import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
// import FileUpload from './components/FileUpload';
import ApiPlayground from './components/ApiPlayground';
import SettingsPanel from './components/SettingsPanel';
import LogsTable from './components/LogsTable';
import HelpDocs from './components/HelpDocs';
import DeviceDetails from './components/DeviceDetails'

import { ThemeProvider } from './components/ThemeContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleRegister = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/devices" element={<div>Devices Page</div>} />
          <Route path="/device-details" element={<DeviceDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <ThemeProvider>
          <div className="flex min-h-screen 
                          bg-white text-slate-900 
                          dark:bg-slate-950 dark:text-white 
                          transition-colors duration-300">

            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col">
              <TopNav onLogout={handleLogout} />

              <main className="flex-1 px-6 py-8">
                <Routes>
  <Route path="/dashboard" element={<div>Dashboard Content</div>} />
  <Route path="/devices" element={<div>Devices Page</div>} />
  <Route path="/device-details" element={<DeviceDetails />} />
  <Route path="/dataset" element={<FileUpload setData={setUploadedData} />} />
  <Route path="/api" element={<ApiPlayground />} />
  <Route path="/settings" element={<SettingsPanel />} />
  <Route path="/logs" element={<LogsTable />} />
  <Route path="/help" element={<HelpDocs />} />
  <Route path="*" element={<Navigate to="/dashboard" />} />
</Routes>
              </main>
            </div>
          </div>
        </ThemeProvider>
      )}
    </Router>
  );
};

export default App;