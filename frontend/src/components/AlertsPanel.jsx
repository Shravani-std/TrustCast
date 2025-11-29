import React from 'react';
import { AlertTriangle, CheckCheck, Info } from 'lucide-react';

const severityMap = {
  high: {
    label: 'Critical',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: AlertTriangle
  },
  medium: {
    label: 'Warning',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: Info
  },
  low: {
    label: 'Informational',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: CheckCheck
  }
};

const AlertsPanel = ({ alerts }) => (
  <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.07)]">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Alerts</p>
        <h3 className="text-xl font-semibold text-slate-900">Latest Incidents</h3>
      </div>
      <button className="text-sm font-semibold text-blue-600">View all</button>
    </div>
    <div className="space-y-4">
      {alerts.map((alert) => {
        const severity = severityMap[alert.severity];
        const Icon = severity.icon;
        return (
          <div
            key={alert.id}
            className="flex items-start justify-between rounded-2xl border border-slate-100/70 bg-slate-50/50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className={`rounded-xl border p-2 ${severity.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.time}</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {alert.device}
            </span>
          </div>
        );
      })}
    </div>
  </section>
);

export default AlertsPanel;

