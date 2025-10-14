import React, { useState } from 'react';
import DashboardCard from './components/DashboardCard';
import LineChart from './components/LineChart';
import DataTable from './components/DataTable';
import FileUpload from './components/FileUpload';
import { saveAs } from 'file-saver';
import logo from './assets/logo.png';

function App() {
  const [data, setData] = useState([]);

  const totalNodes = data.length;
  const trustedNodes = data.filter(d => parseFloat(d.trust_score) > 70).length;
  const trustedPercent = totalNodes > 0 ? ((trustedNodes / totalNodes) * 100).toFixed(2) : 0;

  const labels = data.map(d => d.timestamp);
  const trustScores = data.map(d => parseFloat(d.trust_score));

  const downloadCSV = () => {
    const csv = data.map(d => Object.values(d).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'processed_data.csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="TrustCast Logo" className="w-16 h-16" />
          <h1 className="text-4xl font-extrabold text-gray-800">TRUST CAST</h1>
        </div>
        <p className="text-gray-600">IoT Trust Dashboard</p>
      </header>

      {/* Metrics Cards */}
      <div className="flex flex-wrap gap-6 mb-8">
        <DashboardCard
          title="Total Nodes"
          value={totalNodes}
          icon="🖧"
          color="bg-indigo-100 text-indigo-800"
        />
        <DashboardCard
          title="Trusted Nodes %"
          value={trustedPercent + "%"}
          icon="✅"
          color="bg-green-100 text-green-800"
        />
        <DashboardCard
          title="Suspicious Nodes"
          value={totalNodes - trustedNodes}
          icon="⚠️"
          color="bg-red-100 text-red-800"
        />
        <FileUpload setData={setData} />
      </div>

      {/* Line Chart */}
      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Trust Score Over Time</h2>
          <LineChart labels={labels} dataPoints={trustScores} />
        </div>
      )}

      {/* Data Table */}
      {data.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Node Data</h2>
          <DataTable rows={data} />
        </div>
      )}

      {/* Download Button */}
      {data.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={downloadCSV}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
