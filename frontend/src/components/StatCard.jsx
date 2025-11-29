import React from 'react';
import { Network, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

const StatCard = ({
  title,
  value,
  iconName = 'network',
  badge,
  trendLabel,
  trendValue,
  sparkline = []
}) => {
  const icons = {
    network: Network,
    shield: Shield,
    alert: AlertTriangle,
    trending: TrendingUp
  };

  const Icon = icons[iconName] || Network;
  const isPositive = trendValue >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_15px_35px_rgba(15,23,42,0.08)] backdrop-blur-md transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">{value}</span>
            {badge && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl bg-slate-900/90 p-3 text-white shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-slate-500">{trendLabel}</span>
        <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}
          {trendValue}%
        </span>
      </div>

      {sparkline.length > 0 && (
        <div className="mt-4 flex h-12 items-end gap-0.5">
          {sparkline.map((point, idx) => (
            <span
              key={`${title}-${idx}-${point}`}
              className="w-full rounded-full bg-gradient-to-t from-blue-200 to-blue-500"
              style={{ height: `${Math.max(point, 5)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
