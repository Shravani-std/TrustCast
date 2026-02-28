import React, { useState } from "react";
import { Upload, Hash, FileBadge, Loader2 } from "lucide-react";
import axios from "axios";

const FileUpload = ({ setData }) => {
  const [fileMeta, setFileMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((row) => row.trim());
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

      setTimeout(() => setIsProcessing(false), 800);
    };

    reader.readAsText(selectedFile);
  };

  // 🔥 Send to FastAPI
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

      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center text-slate-600 shadow-inner transition hover:border-slate-900 cursor-pointer">
        <Upload className="mb-4 h-6 w-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-900">
          Drag & drop dataset
        </p>
        <p className="text-xs text-slate-500">
          CSV up to 50MB • Anonymized
        </p>
        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </label>

      {/* File Metadata */}
      {fileMeta && (
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <FileBadge className="h-4 w-4 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-900">{fileMeta.name}</p>
              <p className="text-xs text-slate-500">{fileMeta.size}</p>
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

      {/* Preprocessing Section */}
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-500">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Preprocessing
        </p>

        <div className="mt-2 space-y-2">
          {[
            { label: "Schema validation", status: "Pass" },
            { label: "Normalization", status: "Queued" },
            { label: "Augmentation", status: "GAN (optional)" },
          ].map((step) => (
            <div
              key={step.label}
              className="flex items-center justify-between"
            >
              <span>{step.label}</span>
              <span className="font-semibold text-slate-900">
                {step.status}
              </span>
            </div>
          ))}
        </div>

        {isProcessing && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing file…
          </div>
        )}
      </div>

      {/* 🔥 Predict Button */}
      {file && (
        <button
          onClick={handlePredict}
          className="w-full rounded-2xl bg-black text-white py-3 font-semibold hover:bg-slate-800 transition"
        >
          {loading ? "Running Model..." : "Run TrustCast Detection"}
        </button>
      )}

      {/* 🔥 Result Display */}
      {result && (
  <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl font-bold mb-4">
      Detection Results
    </h2>

    <p>Total Sequences: {result.num_sequences}</p>
    <p>
      Attacks Detected: {
        result.predictions.filter(p => p === 1).length
      }
    </p>
    <p>
      Average Risk: {
        (
          result.probabilities.reduce((a, b) => a + b, 0) /
          result.probabilities.length
        ).toFixed(2)
      }
    </p>
  </div>
)}
    </div>
  );
};

export default FileUpload;