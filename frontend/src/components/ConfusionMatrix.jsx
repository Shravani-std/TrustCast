import React from 'react';

const ConfusionMatrix = ({ data }) => (
  <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
    <div className="mb-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Model</p>
      <h4 className="text-lg font-semibold text-slate-900">Confusion Matrix</h4>
    </div>
    <div className="grid grid-cols-3 gap-3 text-center text-sm font-semibold">
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-slate-900"
          >
            <p className="text-xs uppercase text-slate-500">
              {rowIndex === 0 ? (colIndex === 0 ? 'TP' : 'FP') : colIndex === 0 ? 'FN' : 'TN'}
            </p>
            <p className="text-2xl">{value}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default ConfusionMatrix;

