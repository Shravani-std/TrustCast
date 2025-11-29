import React from 'react';
import { EyeOff, Copy, ShieldCheck } from 'lucide-react';

const SettingsPanel = () => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-slate-500" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Thresholds</p>
          <h4 className="text-lg font-semibold text-slate-900">Trust Sensitivity</h4>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Critical Threshold', value: '35%', description: 'Auto quarantine < 35%' },
          { label: 'Warning Threshold', value: '65%', description: 'Surface to analyst' },
          { label: 'Healthy Threshold', value: '80%', description: 'Mark as reliable' }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Access</p>
          <h4 className="text-lg font-semibold text-slate-900">API Keys</h4>
        </div>
        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
          Rotate key
        </button>
      </div>
      <div className="space-y-3">
        {['sk_live_9B3X...PQ1', 'sk_live_18XM...ZK7'].map((key) => (
          <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 p-2">
                <EyeOff className="h-4 w-4 text-slate-500" />
              </span>
              <p className="font-mono text-sm text-slate-600">{key}</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Roles</p>
        <h4 className="text-lg font-semibold text-slate-900">User Management</h4>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Dr. Vega', role: 'Admin' },
          { name: 'Analyst Ray', role: 'Researcher' },
          { name: 'Ops Mira', role: 'Read Only' }
        ].map((user) => (
          <div key={user.name} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">mfa enabled</p>
            </div>
            <select className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              <option>{user.role}</option>
              <option>Admin</option>
              <option>Researcher</option>
              <option>Read Only</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SettingsPanel;

