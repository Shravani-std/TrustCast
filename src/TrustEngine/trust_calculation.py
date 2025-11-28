
from typing import Dict
import numpy as np # type: ignore
import pandas as pd # type: ignore

EPS = 1e-6

def shannon_entropy(s: str) -> float:
    """Shannon entropy of a string (safe for non-string)."""
    if not isinstance(s, str) or len(s) == 0:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
    return -sum(p * np.log2(p) for p in prob)

def compute_flow_level_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute per-flow features that depend only on a single flow row.
    Safe to run at inference time.
    """
    df = df.copy()
    # make sure numeric columns exist
    for c in ['src_bytes', 'dst_bytes', 'src_pkts', 'dst_pkts', 'duration', 'http_status_code', 'ssl_cipher', 'ssl_subject', 'ssl_issuer', 'dns_query']:
        if c not in df.columns:
            df[c] = np.nan if c != 'ssl_cipher' else '-'

    # safe duration
    df['duration_safe'] = df['duration'].replace(0, np.nan)

    # throughput and packet rate
    df['bytes_per_sec'] = (df['src_bytes'].fillna(0) + df['dst_bytes'].fillna(0)) / df['duration_safe']
    df['pkts_per_sec'] = (df['src_pkts'].fillna(0) + df['dst_pkts'].fillna(0)) / df['duration_safe']

    # avg packet sizes (avoid division by zero)
    df['avg_pkt_size_src'] = df['src_bytes'].fillna(0) / df['src_pkts'].replace({0: np.nan}).fillna(np.nan)
    df['avg_pkt_size_dst'] = df['dst_bytes'].fillna(0) / df['dst_pkts'].replace({0: np.nan}).fillna(np.nan)

    # asymmetry
    df['pkt_byte_asymmetry'] = np.abs(df['src_bytes'].fillna(0) - df['dst_bytes'].fillna(0)) / \
                               (df['src_bytes'].fillna(0) + df['dst_bytes'].fillna(0) + EPS)

    # HTTP error flag
    def http_error(x):
        try:
            return 1 if (pd.notna(x) and int(x) >= 400) else 0
        except Exception:
            return 0
    df['http_error_flag'] = df['http_status_code'].apply(http_error)

    # SSL flags
    weak_ciphers = {'TLS_RSA_WITH_RC4_128_SHA', 'SSL_RSA_WITH_3DES_EDE_CBC_SHA'}
    df['unusual_cipher_flag'] = df['ssl_cipher'].fillna('-').isin(weak_ciphers).astype(int)

    df['ssl_cert_mismatch_flag'] = np.where(
        (df['ssl_subject'].notna()) & (df['ssl_issuer'].notna()) & (df['ssl_subject'] != df['ssl_issuer']),
        1, 0
    )

    # DNS entropy
    df['dns_query_entropy'] = df['dns_query'].fillna('').astype(str).apply(shannon_entropy)

    # cleanup
    df.drop(columns=['duration_safe'], inplace=True, errors='ignore')
    return df

def attach_aggregates_from_map(df: pd.DataFrame,
                               node_degree_map: Dict[str, float],
                               flow_rate_map: Dict[str, float],
                               default_node_degree: float = 0.0,
                               default_flow_rate: float = 0.0) -> pd.DataFrame:
    """
    Attach aggregates (precomputed on training set) to dataframe.
    node_degree_map and flow_rate_map should be persisted artifacts loaded by trust_engine.
    """
    df = df.copy()
    df['node_degree'] = df['src_ip'].map(node_degree_map).fillna(default_node_degree).astype(float)
    df['flow_rate'] = df['src_ip'].map(flow_rate_map).fillna(default_flow_rate).astype(float)
    return df
