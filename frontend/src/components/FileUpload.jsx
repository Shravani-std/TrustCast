import React from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ setData }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        const parsed = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx]?.trim() || '';
          });
          return obj;
        });
        setData(parsed);
      };
      reader.readAsText(file);
    }
  };

  return (
    <label className="px-6 py-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2 font-semibold">
      <Upload className="w-5 h-5" />
      Upload Data
      <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
    </label>
  );
};

export default FileUpload;
