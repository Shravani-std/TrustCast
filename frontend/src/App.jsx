import React, { useMemo, useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import StatCard from './components/StatCard';
import LineChartComponent from './components/LineChartComponent';
import AlertsPanel from './components/AlertsPanel';
import DataTable from './components/DataTable';
import DeviceDetails from './components/DeviceDetails';
import FileUpload from './components/FileUpload';
import ModelMonitor from './components/ModelMonitor';
import ApiPlayground from './components/ApiPlayground';
import SettingsPanel from './components/SettingsPanel';
import LogsTable from './components/LogsTable';
import FeatureCard from './components/FeatureCard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register', 'dashboard'
  const [uploadedData, setUploadedData] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');

  const devices = useMemo(
    () => (uploadedData.length ? uploadedData : [
      { device_id: 'IOT-001', status: 'Healthy', trust_score: 92, last_seen: '2m ago' },
      { device_id: 'IOT-002', status: 'Low Trust', trust_score: 61, last_seen: '5m ago' },
      { device_id: 'IOT-003', status: 'Healthy', trust_score: 88, last_seen: '1m ago' },
      { device_id: 'IOT-004', status: 'Anomaly', trust_score: 28, last_seen: 'Just now' },
      { device_id: 'IOT-005', status: 'Healthy', trust_score: 95, last_seen: '12m ago' }
    ]),
    [uploadedData]
  );

  const alerts = [
    { id: 1, title: 'Firmware downgrade attempt blocked', device: 'IOT-004', severity: 'high', time: '32s ago' },
    { id: 2, title: 'Latency spike on gateway-12', device: 'IOT-019', severity: 'medium', time: '8m ago' },
    { id: 3, title: 'Auto quarantine released for IOT-011', device: 'IOT-011', severity: 'low', time: '20m ago' }
  ];

  const deviceProfile = {
    name: 'Smart Camera Alpha',
    id: 'IOT-004',
    trustScore: 28,
    status: 'Quarantined',
    uptime: '98.4%',
    latency: '120ms',
    firmware: 'v3.02',
    anomalies: [{ title: 'Trust drop below 30%', time: 'Today • 10:14' }]
  };

  const timeline = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [88, 85, 78, 60, 52, 45, 28]
  };

  const kpiCards = [
    { title: 'Total IoT Devices', value: '1,842', iconName: 'network', trendLabel: 'vs last 24h', trendValue: 4, sparkline: [40, 60, 80, 70, 85, 92], badge: 'Live' },
    { title: 'Healthy Devices', value: '1,526', iconName: 'shield', trendLabel: 'stable', trendValue: 1, sparkline: [80, 82, 83, 85, 84, 86], badge: '83%' },
    { title: 'Low Trust Devices', value: '214', iconName: 'alert', trendLabel: 'needs attention', trendValue: 12, sparkline: [15, 20, 24, 30, 26, 21], badge: '12 new' },
    { title: 'Anomalies Detected', value: '34', iconName: 'trending', trendLabel: 'today', trendValue: -6, sparkline: [30, 28, 26, 24, 20, 18], badge: '24h' }
  ];

  const chartData = {
    labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
    values: [88, 92, 84, 79, 86, 90]
  };

  const logs = [
    { id: 1, time: '2025-11-28 10:10:12Z', actor: 'Dr.Vega', action: 'DATASET_UPLOAD', details: 'trust-core-v14.csv (hash 91dd)' },
    { id: 2, time: '2025-11-28 10:05:01Z', actor: 'system', action: 'MODEL_SCORE', details: 'batch inference complete (512 nodes)' },
    { id: 3, time: '2025-11-28 09:40:57Z', actor: 'ops.mira', action: 'THRESHOLD_EDIT', details: 'critical threshold -> 35%' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_25px_55px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Network</p>
              <h3 className="text-xl font-semibold text-slate-900">Trust Trend Over Time</h3>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              {['24H', '7D', '30D'].map((range) => (
                <button
                  key={range}
                  className={`rounded-full border px-3 py-1 ${
                    range === '7D' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <LineChartComponent labels={chartData.labels} dataPoints={chartData.values} />
        </section>
        <AlertsPanel alerts={alerts} />
      </div>
      <DataTable rows={devices} />
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { iconName: 'activity', title: 'Real-time Telemetry', description: 'Streaming trust telemetry from 1,842 devices', status: 'active' },
          { iconName: 'shield', title: 'Autonomous Policy', description: 'Auto quarantine for trust < 35%', status: 'active' },
          { iconName: 'network', title: 'Topology Awareness', description: 'Device clusters mapped via heuristics', status: 'coming' }
        ].map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
      <DataTable rows={devices} />
    </div>
  );

  const renderDataset = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dataset Upload</h2>
        <p className="text-sm text-slate-500">Drag and drop anonymized CSV files, we’ll handle preprocessing, hashing and augmentation.</p>
        <div className="mt-6">
          <FileUpload setData={setUploadedData} />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Augmentation</p>
        <h4 className="text-lg font-semibold text-slate-900">SMOTE • GAN • TimeGAN</h4>
        <div className="mt-6 space-y-4">
          {[
            { label: 'SMOTE', value: 70 },
            { label: 'GAN', value: 45 },
            { label: 'TimeGAN', value: 22 }
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-500">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'devices':
        return renderDevices();
      case 'device-details':
        return <DeviceDetails device={deviceProfile} timeline={timeline} />;
      case 'dataset':
        return renderDataset();
      case 'model':
        return <ModelMonitor />;
      case 'api':
        return <ApiPlayground />;
      case 'settings':
        return <SettingsPanel />;
      case 'logs':
        return <LogsTable logs={logs} />;
      default:
        return <div className="rounded-3xl border border-slate-200 bg-white/95 p-10 text-slate-500">Coming soon.</div>;
    }
  };

  // Handle navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  // Handle register
  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  // Render pre-auth pages
  if (!isAuthenticated) {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} onRegister={handleRegister} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  }

  // Render authenticated dashboard
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <Sidebar activeView={activeView} onSelect={setActiveView} />
      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[22rem] font-semibold text-slate-200/25">
          <span className="drop-shadow-xl">02</span>
        </div>
        <div className="pointer-events-none absolute top-6 right-12 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 shadow-lg shadow-slate-200/80">
          Next Model Retrain In: 2 Days • 10h • 23m
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <TopNav onLogout={handleLogout} />
          <main className="flex-1 bg-white px-6 py-8">{renderView()}</main>
        </div>
      </div>
    </div>
  );
};

export default App;