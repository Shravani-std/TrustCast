import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import DashboardCard from './components/DashboardCard';
import DataTable from './components/DataTable';
import FileUpload from './components/FileUpload';
import LineChartComponent from './components/LineChartComponent';
import StatCard from './components/StatCard';
import FeatureCard from './components/FeatureCard';

const App = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for demo
  const sampleData = [
    { device_id: 'IOT-001', device_name: 'Temperature Sensor A', trust_score: 92, status: 'Trusted', last_seen: '2 min ago', timestamp: '10:00' },
    { device_id: 'IOT-002', device_name: 'Motion Detector B', trust_score: 45, status: 'Suspicious', last_seen: '5 min ago', timestamp: '10:05' },
    { device_id: 'IOT-003', device_name: 'Smart Camera C', trust_score: 88, status: 'Trusted', last_seen: '1 min ago', timestamp: '10:10' },
    { device_id: 'IOT-004', device_name: 'Door Lock D', trust_score: 15, status: 'Critical', last_seen: '10 min ago', timestamp: '10:15' },
    { device_id: 'IOT-005', device_name: 'Humidity Sensor E', trust_score: 95, status: 'Trusted', last_seen: '3 min ago', timestamp: '10:20' },
  ];

  const currentData = data.length > 0 ? data : sampleData;
  const totalNodes = currentData.length;
  const trustedNodes = currentData.filter(d => parseFloat(d.trust_score || 0) > 70).length;
  const criticalNodes = currentData.filter(d => parseFloat(d.trust_score || 0) < 40).length;
  const avgTrustScore = (currentData.reduce((sum, d) => sum + parseFloat(d.trust_score || 0), 0) / currentData.length).toFixed(1);

  // Data for LineChart
  const chartLabels = currentData.map(d => d.timestamp || d.device_id);
  const chartData = currentData.map(d => parseFloat(d.trust_score || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-lg">
                <Shield className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold">TrustCast</h1>
                <p className="text-blue-100 text-sm mt-1">IoT Trust Scoring & Network Security Platform</p>
              </div>
            </div>
            <FileUpload setData={setData} />
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-xl p-2">
            {['overview'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Devices" 
            value={totalNodes} 
            iconName="network"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={5}
          />
          <StatCard 
            title="Trusted Devices" 
            value={trustedNodes} 
            iconName="shield"
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={2}
          />
          <StatCard 
            title="Critical Alerts" 
            value={criticalNodes} 
            iconName="alert"
            color="bg-gradient-to-r from-red-500 to-red-600"
            trend={-3}
          />
          <StatCard 
            title="Avg Trust Score" 
            value={avgTrustScore} 
            iconName="trending"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={1}
          />
        </div>

        {/* About Section */}
        <DashboardCard
          title="About TrustCast"
          description="TrustCast is an advanced IoT security platform that analyzes sensor data and device behavior to calculate real-time trust scores. Our system monitors network activity, detects anomalies, and identifies potentially compromised devices before they can cause harm."
        />

        {/* Line Chart */}
        {currentData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trust Score Trends</h2>
            <LineChartComponent labels={chartLabels} dataPoints={chartData} />
          </div>
        )}

        {/* Core Features */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              iconName="activity"
              title="Real-Time Monitoring"
              description="Continuous monitoring of IoT device behavior, performance metrics, and network activity with instant anomaly detection."
              status="active"
            />
            <FeatureCard
              iconName="shield"
              title="Trust Score Calculation"
              description="ML-driven trust scoring based on device reliability, performance history, and behavioral patterns."
              status="active"
            />
            <FeatureCard
              iconName="eye"
              title="Anomaly Detection"
              description="Advanced algorithms identify unusual patterns, potential security breaches, and device malfunctions."
              status="active"
            />
            <FeatureCard
              iconName="alert"
              title="Intelligent Alerts"
              description="Customizable alert system that notifies administrators of critical security events and trust score changes."
              status="active"
            />
            <FeatureCard
              iconName="chart"
              title="Advanced Analytics Dashboard"
              description="Interactive visualizations showing trust trends, network topology, device comparisons, and historical analysis."
              status="coming"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <p className="text-lg font-semibold">TrustCast - Securing IoT Networks Through Trust</p>
          <p className="text-sm mt-2">Powered by Advanced Machine Learning & Real-Time Analytics</p>
        </div>
      </div>
    </div>
  );
};

export default App;