import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { label, p, ul } from "framer-motion/client";
import { api } from "../lib/apiClient";

const DeviceDetails = () => {
  const { ip } = useParams();

  const deviceIP = ip || "192.168.1.10";

  const defaultDevice = {
    name: deviceIP,
    id: deviceIP,
    trustScore: 75,
    status: "Healthy",
    uptime: "99.2%",
    latency: "32ms",
    firmware: "v1.4.2",
    anomalies: []
  };

  const [device, setDevice] = useState(defaultDevice);
  const [timeline, setTimeline] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchDeviceData = async () => {
      try {
        setLoading(true);

        const response = await api.post("/api/trust-score", { srcip: deviceIP });

        const data = response.data;
        const trust = data.trust_score || 0;

        setDevice({
          name: deviceIP,
          id: deviceIP,
          trustScore: trust,
          status:
            trust > 80
              ? "Healthy"
              : trust > 50
              ? "Warning"
              : "Critical",
          uptime: "99.2%",
          latency: "32ms",
          firmware: "v1.4.2",
          anomalies: data.anomalies || []
        });

        setTimeline({
          labels: data.timeline?.labels || [],
          values: data.timeline?.values || []
        });

      } catch (err) {
        console.log("Backend unavailable — using default device data");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();

  }, [deviceIP]);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Device Details</h1>

      {loading && (
        <div className="text-sm text-gray-500">
          Fetching latest trust score...
        </div>
      )}

      {/* Device Info */}
      <div className="bg-slate-800 text-white p-6 rounded-xl shadow">
        <p><b>Device IP:</b> {device.name}</p>
        <p><b>Trust Score:</b> {device.trustScore}</p>
        <p><b>Status:</b> {device.status}</p>
        <p><b>Uptime:</b> {device.uptime}</p>
        <p><b>Latency:</b> {device.latency}</p>
        <p><b>Firmware:</b> {device.firmware}</p>
      </div>

      {/* Anomalies */}
      <div className="bg-slate-800 text-white p-6 rounded-xl">
        <h2 className="text-xl mb-2">Anomalies</h2>

        {device.anomalies.length === 0 ? (
          <p>No anomalies detected</p>
        ) : (
          <ul className="list-disc ml-5">
            {device.anomalies.map((a, index) => (
              <li key={index}>
                Attack: {a.attack_type} (Row: {a.index})
                </li>
            ))}
          </ul>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-slate-800 text-white p-6 rounded-xl">
  <h2 className="text-xl mb-4">Timeline Data</h2>

  {timeline.labels.length === 0 ? (
    <p>No timeline data</p>
  ) : (
    <ul className="space-y-1">
      {timeline.labels.map((label, index) => {
        const hour = String(label).padStart(2, "0") // convert 1 -> 01

        return (
          <li key={index}>
            {hour}:00  →  {timeline.values[index]}%
          </li>
        );
      })}
    </ul>
  )}
</div>

    </div>
  );
};

export default DeviceDetails;