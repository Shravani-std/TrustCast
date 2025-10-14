import React from 'react';
import { Network, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, iconName, color, trend }) => {
  const icons = {
    network: Network,
    shield: Shield,
    alert: AlertTriangle,
    trending: TrendingUp
  };
  
  const Icon = icons[iconName] || Network;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;

