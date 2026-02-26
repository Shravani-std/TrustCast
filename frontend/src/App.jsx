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
import ApiPlayground from './components/ApiPlayground';
import SettingsPanel from './components/SettingsPanel';
import LogsTable from './components/LogsTable';
import FeatureCard from './components/FeatureCard';
import { ThemeProvider } from './components/ThemeContext';
import HelpDocs from './components/HelpDocs';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [uploadedData, setUploadedData] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');

  const handleNavigate = (page) => setCurrentPage(page);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

const renderView = () => {
  switch (activeView) {
    case 'dashboard':
      return <div>Dashboard Content</div>;

    case 'dataset':
      return <FileUpload setData={setUploadedData} />;

    case 'api':
      return <ApiPlayground />;

    case 'settings':
      return <SettingsPanel />;

    case 'logs':
      return <LogsTable />;

    case 'help':
      return <HelpDocs />;   // ✅ ADD THIS

    default:
      return <div>Coming Soon</div>;
  }
};

  // Public pages (NO theme)
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
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  }

  // Authenticated Dashboard (Theme Enabled)
  return (
    <ThemeProvider>
      <div className="flex min-h-screen 
                      bg-white text-slate-900 
                      dark:bg-slate-950 dark:text-white 
                      transition-colors duration-300">

        <Sidebar activeView={activeView} onSelect={setActiveView} />

        <div className="flex-1 flex flex-col">
          <TopNav onLogout={handleLogout} />

          <main className="flex-1 
                           bg-white dark:bg-slate-950 
                           px-6 py-8 
                           transition-colors duration-300">
            {renderView()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;