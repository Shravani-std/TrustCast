import React from 'react';
import { Zap, Lock, Database } from 'lucide-react';
const DashboardCard = ({ title, description }) => {
  return ( 
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-6">{description}</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Real-Time Analysis</h3>
            <p className="text-sm text-gray-600">Instant threat detection and trust score updates</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Secure by Design</h3>
            <p className="text-sm text-gray-600">Enterprise-grade security for IoT networks</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">ML-Powered</h3>
            <p className="text-sm text-gray-600">Advanced machine learning algorithms</p>
          </div>
        </div>
      </div>
    </div>
   
  );
};

export default DashboardCard;
