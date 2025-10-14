import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ labels, dataPoints }) => {
  const data = {
    labels,
    datasets: [{
      label: 'Trust Score',
      data: dataPoints,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.3
    }]
  };

  return <Line data={data} className="bg-white shadow-lg rounded-xl p-4" />;
};

export default LineChart;
