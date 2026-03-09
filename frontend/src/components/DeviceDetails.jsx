import React, { useEffect, useState } from "react";
import axios from "axios";
import DeviceDetails from "./DeviceDetails";

const DeviceDetailsContainer = ({ selectedIP }) => {
  const [device, setDevice] = useState(null);
  const [timeline, setTimeline] = useState({ labels: [], values: [] });

  useEffect(() => {
    if (!selectedIP) return;

    const fetchDeviceData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/trust-score",
          { srcip: selectedIP }
        );

        const data = response.data;

        setDevice({
          name: selectedIP,
          id: selectedIP,
          trustScore: data.trust_score || 0,
          status:
            data.trust_score > 80
              ? "Healthy"
              : data.trust_score > 50
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
      } catch (error) {
        console.error(error);
      }
    };

    fetchDeviceData();
  }, [selectedIP]);

  return (
    <DeviceDetails
      device={device}
      timeline={timeline}
    />
  );
};

export default DeviceDetailsContainer;