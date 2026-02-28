import React, { useEffect, useState } from "react";
import axios from "axios";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const logsPerPage = 8;

  // 🔥 Fetch logs from backend
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/logs") // change to your backend URL
      .then((res) => {
        setLogs(res.data);
        setFilteredLogs(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔥 Filter logic
  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(
        (log) => log.level === activeFilter
      );
      setFilteredLogs(filtered);
    }
    setPage(1);
  }, [activeFilter, logs]);

  // 🔥 Pagination logic
  const indexOfLast = page * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Audit
          </p>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Logs
          </h4>
        </div>

        {/* 🔥 Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {["All", "Info", "Warning", "Critical"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-3 py-1 transition ${
                activeFilter === filter
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}

          <button
  onClick={() => {
    const exportData = {
      system: "TrustCast AI Engine",
      exported_at: new Date().toISOString(),
      total_logs: filteredLogs.length,
      logs: filteredLogs.map((log) => ({
        timestamp: log.time,
        level: log.level,
        actor: log.actor,
        action: log.action,
        details: log.details,
      })),
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustcast_logs_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }}
  className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300"
>
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
  {currentLogs.length === 0 ? (
    <tr>
      <td
        colSpan="4"
        className="py-6 text-center text-slate-400 dark:text-slate-500"
      >
        No logs available
      </td>
    </tr>
  ) : (
    currentLogs.map((log, index) => (
      <tr
        key={
          log.id ??
          `${log.time}-${log.actor}-${log.action}-${index}`
        }
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

      {/* 🔥 Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;