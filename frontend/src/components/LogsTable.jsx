import React from 'react';

const LogsTable = ({ logs = [] }) => (
  <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900 p-6 transition-colors duration-300">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Audit</p>
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          System Logs
        </h4>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {['All', 'Info', 'Warning', 'Critical'].map((filter) => (
          <button
            key={filter}
            className={`rounded-full border px-3 py-1 transition ${
              filter === 'All'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
            }`}
          >
            {filter}
          </button>
        ))}

        <button className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300">
          Export
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-3">Timestamp</th>
            <th className="py-3">Actor</th>
            <th className="py-3">Action</th>
            <th className="py-3">Details</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-6 text-center text-slate-400 dark:text-slate-500">
                No logs available
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-slate-50 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300"
              >
                <td className="py-3">{log.time}</td>
                <td className="py-3">{log.actor}</td>
                <td className="py-3">{log.action}</td>
                <td className="py-3 text-slate-500 dark:text-slate-400">
                  {log.details}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>Page 1 of 12</span>
      <div className="space-x-2">
        <button className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1">
          Prev
        </button>
        <button className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1">
          Next
        </button>
      </div>
    </div>
  </div>
);

export default LogsTable;