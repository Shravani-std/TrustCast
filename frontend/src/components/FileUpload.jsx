import React, { useState } from "react";
import { Upload, Hash, FileBadge, Loader2 } from "lucide-react";
import { api } from "../lib/apiClient";

// `setData` is optional because this component is used in both public and authenticated routes.
const FileUpload = ({ setData = () => {} }) => {
  const [fileMeta, setFileMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    { label: "Schema validation", status: "Check dataset columns and structure" },
    { label: "Missing value handling", status: "Fill or remove incomplete records" },
    { label: "Feature normalization", status: "Scale numerical features using trained scaler" },
    { label: "Sequence generation", status: "Convert traffic logs into time-series sequences" },
    { label: "Model inference", status: "Run BiGRU-Attention anomaly detection model" },
    { label: "Trust score calculation", status: "Compute trust score from anomaly probability" },
  ];

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;

        if (!text) {
          alert("File appears to be empty.");
          setIsProcessing(false);
          return;
        }

        const rows = text.split("\n").filter((row) => row.trim());

        if (rows.length === 0) {
          alert("Invalid CSV file.");
          setIsProcessing(false);
          return;
        }

        const headers = rows[0].split(",").map((h) => h.trim());

        const parsed = rows.slice(1).map((row) => {
          const values = row.split(",");
          const obj = {};

          headers.forEach((header, idx) => {
            obj[header] = values[idx]?.trim() || "";
          });

          return obj;
        });

        setData(parsed);

        setFileMeta({
          name: selectedFile.name,
          size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          hash: window.btoa(selectedFile.name).slice(0, 12).toUpperCase(),
        });

      } catch (error) {
        console.error("CSV parsing error:", error);
        alert("Error parsing CSV file.");
      } finally {
        setTimeout(() => setIsProcessing(false), 800);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const response = await api.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);

    } catch (error) {
      console.error("Prediction error:", error);
      const isNetworkError = error?.code === "ERR_NETWORK";
      const serverUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

      if (isNetworkError) {
        alert(
          `Cannot reach backend at ${serverUrl}.\n` +
          "Start FastAPI server first (e.g. uvicorn app:app --reload --port 8000)."
        );
      } else {
        const apiError = error?.response?.data?.error;
        alert(apiError ? `Prediction failed: ${apiError}` : "Prediction request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const attackCount =
    result?.predictions?.filter((p) => p === 1).length || 0;

  const avgRisk =
    result?.probabilities?.length
      ? (
          result.probabilities.reduce((a, b) => a + b, 0) /
          result.probabilities.length
        ).toFixed(2)
      : 0;

  return (
    <div className="space-y-4">

      {/* Upload Box */}
      <label
        className="flex flex-col items-center justify-center
        rounded-3xl border border-dashed
        border-slate-300 dark:border-slate-700
        bg-white/80 dark:bg-slate-900
        px-6 py-10 text-center
        text-slate-600 dark:text-slate-300
        shadow-inner transition
        hover:border-slate-900 dark:hover:border-slate-500
        cursor-pointer"
      >
        <Upload className="mb-4 h-6 w-6 text-slate-400" />

        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Drag & drop dataset
        </p>

        <p className="text-xs text-slate-500">
          CSV up to 50MB • Anonymized
        </p>

        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </label>

      {/* File Metadata */}
      {fileMeta && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <FileBadge className="h-4 w-4 text-slate-400" />

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {fileMeta.name}
              </p>

              <p className="text-xs text-slate-500">
                {fileMeta.size}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />

            <p className="font-mono text-xs text-slate-500">
              {fileMeta.hash}
            </p>
          </div>
        </div>
      )}

      {/* Preprocessing Steps */}
      <div className="mt-2 space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{step.label}</span>

            <span className="font-semibold text-slate-900 dark:text-white">
              {step.status}
            </span>
          </div>
        ))}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing file…
        </div>
      )}

      {/* Predict Button */}
      {file && (
        <button
          onClick={handlePredict}
          className="w-full rounded-2xl bg-black text-white py-3 font-semibold hover:bg-slate-800 transition"
        >
          {loading ? "Running Model..." : "Run TrustCast Detection"}
        </button>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
            Detection Results
          </h2>

          <p>Total Sequences: {result.num_sequences}</p>

          <p>Attacks Detected: {attackCount}</p>

          <p>Average Risk: {avgRisk}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;