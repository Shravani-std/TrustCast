import React from 'react';
import { Activity, Shield, Eye, AlertTriangle, BarChart3, Network } from 'lucide-react';

const FeatureCard = ({ iconName, title, description, status }) => {
  const icons = {
    activity: Activity,
    shield: Shield,
    eye: Eye,
    alert: AlertTriangle,
    chart: BarChart3,
    network: Network
  };
  
  const Icon = icons[iconName] || Activity;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${status === 'active' ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${status === 'active' ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {status === 'coming' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;