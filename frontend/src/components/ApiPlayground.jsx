import React, { useState } from "react";
import { api } from "../lib/apiClient";

const ApiPlayground = () => {
  const [deviceId, setDeviceId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!deviceId) {
      alert("Please enter IP address");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/trust-score", { srcip: deviceId });

      setResult(response.data);

    } catch (error) {
      console.error(error);
      alert("API request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      rounded-3xl
      border border-slate-200 dark:border-slate-800
      bg-white dark:bg-slate-900
      p-6
      shadow-lg
    ">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            API
          </p>

          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Playground
          </h4>
        </div>
      </div>


      {/* Input */}
      <div className="grid gap-4 md:grid-cols-2">

        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">

          Device IP

          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="
              mt-2 w-full
              rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-950
              px-3 py-2 text-sm
              text-slate-900 dark:text-white
              placeholder:text-slate-400
            "
            placeholder="Enter srcip (e.g. 175.45.176.1)"
          />

        </label>

      </div>


      {/* Button */}
      <div className="mt-4 flex gap-3">

        <button
          onClick={handleRequest}
          className="
            rounded-2xl
            bg-slate-900 dark:bg-white
            text-white dark:text-black
            px-4 py-2
            text-sm font-semibold
            transition
            hover:bg-slate-700 dark:hover:bg-slate-200
          "
        >
          {loading ? "Loading..." : "Send Request"}
        </button>

      </div>


      {/* Result Panel */}
      <div className="
        mt-6
        rounded-2xl
        border border-slate-200 dark:border-slate-800
        bg-slate-950
        text-emerald-200
      ">

        <pre className="overflow-x-auto p-4 text-sm">

          {result
            ? JSON.stringify(result, null, 2)
            : "Click 'Send Request' to fetch data"}

        </pre>

      </div>

    </div>
  );
};

export default ApiPlayground;