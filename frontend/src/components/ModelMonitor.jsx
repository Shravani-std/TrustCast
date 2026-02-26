// import React from 'react';
// import { RefreshCw, AlertTriangle } from 'lucide-react';
// import ConfusionMatrix from './ConfusionMatrix';

// const ModelMonitor = () => {
//   const metrics = [
//     { label: 'Accuracy', value: '96.2%' },
//     { label: 'Precision', value: '94.8%' },
//     { label: 'Recall', value: '92.5%' },
//     { label: 'F1 Score', value: '93.6%' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Model</p>
//             <h4 className="text-2xl font-semibold text-slate-900">v1.4.2 • Production</h4>
//             <p className="text-sm text-slate-500">Deployed 4 days ago · CUDA optimized</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
//               <AlertTriangle className="h-4 w-4 text-amber-500" />
//               Drift alert
//             </button>
//             <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
//               <RefreshCw className="h-4 w-4" />
//               Retrain Model
//             </button>
//           </div>
//         </div>
//         <div className="mt-6 grid gap-4 md:grid-cols-4">
//           {metrics.map((metric) => (
//             <div key={metric.label} className="rounded-2xl border border-slate-100 p-4">
//               <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
//               <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//       <ConfusionMatrix data={[[231, 9], [14, 198]]} />
//       <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
//         <div className="mb-4 flex items-center justify-between">
//           <h4 className="text-lg font-semibold text-slate-900">Training Logs</h4>
//           <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
//             View raw logs
//           </button>
//         </div>
//         <div className="space-y-2 font-mono text-xs text-slate-600">
//           <p>[10:32:01] Epoch 42 • val_loss 0.089 • lr 1e-5 • drift -0.7%</p>
//           <p>[10:33:14] Augmentation • GAN synthetic set (512 samples)</p>
//           <p>[10:36:57] Checkpoint saved • checksum 91dd-fa09</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModelMonitor;

