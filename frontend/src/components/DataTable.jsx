import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const statusStyles = {
  Healthy: 'bg-emerald-50 text-emerald-600',
  'Low Trust': 'bg-amber-50 text-amber-600',
  Anomaly: 'bg-rose-50 text-rose-600'
};

const DataTable = ({ rows = [] }) => (
  <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_15px_40px_rgba(15,23,42,0.07)]">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Devices</p>
        <h3 className="text-xl font-semibold text-slate-900">Inventory</h3>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {['Healthy', 'Low Trust', 'Anomaly'].map((filter) => (
          <button key={filter} className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 hover:border-slate-900 hover:text-slate-900">
            {filter}
          </button>
        ))}
        <button className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">Export</button>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        placeholder="Search device ID, tag, owner..."
        className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-900 md:w-72"
      />
      <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Batch Actions</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-3">Device ID</th>
            <th className="py-3">Status</th>
            <th className="py-3">Trust Score</th>
            <th className="py-3">Last Seen</th>
            <th className="py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((device) => (
            <tr
              key={device.device_id}
              className="border-b border-slate-50 text-slate-700 transition hover:bg-slate-50/60"
            >
              <td className="py-3 font-mono text-xs text-slate-500">{device.device_id}</td>
              <td className="py-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[device.status]}`}>
                  {device.status}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[100px] rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${
                        device.status === 'Healthy'
                          ? 'bg-emerald-500'
                          : device.status === 'Low Trust'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${device.trust_score}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-900">{device.trust_score}%</span>
                </div>
              </td>
              <td className="py-3 text-slate-500">{device.last_seen}</td>
              <td className="py-3 text-right">
                <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  Tag
                </button>
                <button className="ml-2 rounded-full border border-slate-200 p-1 text-slate-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;