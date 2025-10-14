import streamlit as st
import pandas as pd
import plotly.express as px
from io import BytesIO

# ----------------- Page Config -----------------
st.set_page_config(
    page_title="TRUST CAST Dashboard",
    page_icon="🖧",
    layout="wide"
)

# ----------------- Header -----------------
st.markdown(
    """
    <div style='display:flex; align-items:center; gap:10px'>
        <img src='https://img.icons8.com/color/48/000000/network.png'/>
        <h1 style='color:#4B0082'>TRUST CAST Dashboard</h1>
    </div>
    """,
    unsafe_allow_html=True
)

st.write("**IoT Trust & Node Reliability Monitoring**")
st.markdown("---")

# ----------------- File Upload -----------------
uploaded_file = st.file_uploader("Upload IoT Data CSV", type=["csv", "xlsx"])
if uploaded_file is not None:
    if uploaded_file.name.endswith(".csv"):
        df = pd.read_csv(uploaded_file)
    else:
        df = pd.read_excel(uploaded_file)
    
    st.success("Data Loaded Successfully!")

    # ----------------- Metrics -----------------
    total_nodes = len(df)
    trusted_nodes = len(df[df['trust_score'] > 70])
    suspicious_nodes = total_nodes - trusted_nodes
    trusted_percent = round((trusted_nodes / total_nodes) * 100, 2) if total_nodes > 0 else 0

    st.markdown("### Key Metrics")
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Nodes", total_nodes, "🖧")
    col2.metric("Trusted Nodes %", f"{trusted_percent}%", "✅")
    col3.metric("Suspicious Nodes", suspicious_nodes, "⚠️")

    st.markdown("---")

    # ----------------- Trust Score Line Chart -----------------
    st.markdown("### Trust Score Over Time")
    if 'timestamp' in df.columns and 'trust_score' in df.columns:
        fig = px.line(df, x='timestamp', y='trust_score', title='Trust Score Over Time',
                      markers=True, color_discrete_sequence=['#4B0082'])
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("Columns 'timestamp' and 'trust_score' not found for chart plotting.")

    st.markdown("---")

    # ----------------- Data Table -----------------
    st.markdown("### Node Data Table")
    st.dataframe(df, use_container_width=True)

    # ----------------- CSV Download -----------------
    def convert_df_to_csv(dataframe):
        return dataframe.to_csv(index=False).encode('utf-8')

    csv_data = convert_df_to_csv(df)
    st.download_button(
        label="Download Processed CSV",
        data=csv_data,
        file_name='processed_data.csv',
        mime='text/csv',
        help="Download your IoT node data with trust scores"
    )

else:
    st.info("Upload your IoT CSV file to see dashboard metrics, charts, and table.")
