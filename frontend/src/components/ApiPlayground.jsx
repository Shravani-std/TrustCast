import React, { useState } from "react";
import axios from "axios";

const ApiPlayground = () => {
  const [deviceId, setDeviceId] = useState("");   // ✅ FIXED
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!deviceId) {
      alert("Please enter IP address");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8000/api/trust-score",
        {
          srcip: deviceId   // ✅ FIXED
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            API
          </p>
          <h4 className="text-lg font-semibold text-slate-900">
            Playground
          </h4>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Device IP
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Enter srcip (e.g. 175.45.176.1)"
          />
        </label>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleRequest}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Loading..." : "Send Request"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-slate-950 text-emerald-100">
        <pre className="overflow-x-auto p-4">
          {result
            ? JSON.stringify(result, null, 2)
            : "Click 'Send Request' to fetch data"}
        </pre>
      </div>
    </div>
  );
};

export default ApiPlayground;