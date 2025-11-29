import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const LineChartComponent = ({ labels = [], dataPoints = [] }) => {
  const data = labels.map((label, idx) => ({
    name: label,
    score: dataPoints[idx]
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <defs>
          <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#cbd5f5" tick={{ fill: '#94a3b8' }} />
        <YAxis stroke="#cbd5f5" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px'
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          fill="url(#trustGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
