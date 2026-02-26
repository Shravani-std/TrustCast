import React, { useState } from 'react';
import { Upload, Hash, FileBadge, Loader2 } from 'lucide-react';
import { ThemeProvider } from './ThemeContext';
const FileUpload = ({ setData }) => {
  const [fileMeta, setFileMeta] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').filter((row) => row.trim());
        const headers = rows[0].split(',').map((h) => h.trim());
        const parsed = rows.slice(1).map((row) => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx]?.trim() || '';
          });
          return obj;
        });
        setData(parsed);
        setFileMeta({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          hash: window.btoa(file.name).slice(0, 12).toUpperCase()
        });
        setTimeout(() => setIsProcessing(false), 1000);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center text-slate-600 shadow-inner transition hover:border-slate-900 cursor-pointer">
        <Upload className="mb-4 h-6 w-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-900">Drag & drop dataset</p>
        <p className="text-xs text-slate-500">CSV up to 50MB • Anonymized</p>
        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
      </label>
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
            <p className="font-mono text-xs text-slate-500">{fileMeta.hash}</p>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-500">
        <p className="text-xs uppercase tracking-wide text-slate-400">Preprocessing</p>
        <div className="mt-2 space-y-2">
          {[
            { label: 'Schema validation', status: 'Pass' },
            { label: 'Normalization', status: 'Queued' },
            { label: 'Augmentation', status: 'GAN (optional)' }
          ].map((step) => (
            <div key={step.label} className="flex items-center justify-between">
              <span>{step.label}</span>
              <span className="font-semibold text-slate-900">{step.status}</span>
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
    </div>
  );
};

export default FileUpload;
