import React from 'react';

const DashboardCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center gap-4 p-6 rounded-xl shadow-lg ${color}`}>
    <div className="text-4xl">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

export default DashboardCard;
