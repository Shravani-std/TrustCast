import React, { useState } from 'react';

const ApiPlayground = () => {
  const [deviceId, setDeviceId] = useState('IOT-006');
  const [timeWindow, setTimeWindow] = useState('24h');
  const response = {
    device_id: deviceId,
    trust_score: 87,
    anomalies: 1,
    last_seen: '2025-11-28T10:32:00Z'
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">API</p>
          <h4 className="text-lg font-semibold text-slate-900">Playground</h4>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          v1.4 Stable
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Device ID
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Time Window
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Send Request</button>
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
          Generate cURL
        </button>
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
          Generate Python
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 text-left text-sm text-emerald-100">
        <pre className="overflow-x-auto p-4">
{`{
  "device_id": "${response.device_id}",
  "trust_score": ${response.trust_score},
  "anomalies": ${response.anomalies},
  "last_seen": "${response.last_seen}"
}`}
        </pre>
      </div>
    </div>
  );
};

export default ApiPlayground;

