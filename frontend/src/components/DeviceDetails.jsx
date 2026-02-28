import React from 'react';
import { Download, AlertCircle } from 'lucide-react';
import LineChartComponent from './LineChartComponent';

const DeviceDetails = ({
  device = {
    name: 'No Device Selected',
    id: 'N/A',
    trustScore: 0,
    status: 'Unknown',
    uptime: '-',
    latency: '-',
    firmware: '-',
    anomalies: []
  },
  timeline = {
    labels: [],
    values: []
  }
}) => {

  return (
    <div className="space-y-6">

      {/* Device Info */}
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Device</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {device?.name}
            </h3>
            <p className="text-sm text-slate-500">{device?.id}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
              Trust {device?.trustScore}%
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
              {device?.status}
            </span>

            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Export CSV
            </button>

            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Export PDF
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Uptime</p>
            <p className="text-lg font-semibold text-slate-900">{device?.uptime}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Latency</p>
            <p className="text-lg font-semibold text-slate-900">{device?.latency}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Firmware</p>
            <p className="text-lg font-semibold text-slate-900">{device?.firmware}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900">Trust Timeline</h4>

          <div className="flex gap-2">
            {['24H', '7D', '30D'].map((range) => (
              <button
                key={range}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  range === '7D'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <LineChartComponent
          labels={timeline?.labels || []}
          dataPoints={timeline?.values || []}
        />
      </div>

      {/* Anomalies */}
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900">Anomaly Events</h4>
          <button className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Download className="h-4 w-4" />
            Export Timeline
          </button>
        </div>

        <div className="space-y-4">
          {device?.anomalies && device.anomalies.length > 0 ? (
            device.anomalies.map((event, index) => (
              <div
                key={event?.time || index}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-rose-50 p-2 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {event?.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {event?.time}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Critical
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No anomalies detected.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default DeviceDetails;