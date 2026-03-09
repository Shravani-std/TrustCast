import React, { useEffect, useState } from "react";
import axios from "axios";
import DeviceDetails from "./DeviceDetails";

const DeviceDetailsContainer = ({ selectedIP }) => {
  const [device, setDevice] = useState(null);
  const [timeline, setTimeline] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedIP) {
      // Reset when no device selected
      setDevice(null);
      setTimeline({ labels: [], values: [] });
      return;
    }

    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          "http://localhost:8000/api/trust-score",
          { srcip: selectedIP }
        );

        const data = response.data;

        const trust = data.trust_score || 0;

        setDevice({
          name: selectedIP,
          id: selectedIP,
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
        console.error(err);
        setError("Failed to load device data");
        setDevice(null);
        setTimeline({ labels: [], values: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [selectedIP]);

  if (loading) {
    return <div className="p-6">Loading device data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <DeviceDetails
      device={device}
      timeline={timeline}
    />
  );
};

export default DeviceDetailsContainer;