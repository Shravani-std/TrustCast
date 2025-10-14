import React from 'react';
import { ChevronRight } from 'lucide-react';

const DataTable = ({ rows }) => {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No data available. Upload a CSV file to see device information.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-bold text-gray-700">Device ID</th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">Device Name</th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">Trust Score</th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">Last Seen</th>
            <th className="text-left py-3 px-4 font-bold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((device, idx) => {
            const score = parseFloat(device.trust_score || 0);
            let statusColor = 'bg-green-100 text-green-700';
            let statusText = 'Trusted';
            
            if (score < 40) {
              statusColor = 'bg-red-100 text-red-700';
              statusText = 'Critical';
            } else if (score < 70) {
              statusColor = 'bg-yellow-100 text-yellow-700';
              statusText = 'Suspicious';
            }

            return (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-mono text-sm text-gray-600">{device.device_id}</td>
                <td className="py-4 px-4 font-medium text-gray-900">{device.device_name}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div 
                        className={`h-2 rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 min-w-[40px]">{score}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{device.last_seen || 'N/A'}</td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;