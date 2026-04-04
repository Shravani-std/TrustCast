import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import FileUpload from "./components/FileUpload";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import ApiPlayground from "./components/ApiPlayground";
import SettingsPanel from "./components/SettingsPanel";
import LogsTable from "./components/LogsTable";
import HelpDocs from "./components/HelpDocs";
import DeviceDetails from "./components/DeviceDetails";
import DevicesPage from "./components/DevicePage";
import { ThemeProvider } from "./components/ThemeContext";
import Dashboard from "./components/Dashboard";
import { api, authStorage } from "./lib/apiClient";
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setAuthReady(true);
      return;
    }

    api
      .get("/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        authStorage.clearToken();
        setIsAuthenticated(false);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const handleLogin = (authPayload) => {
    authStorage.setToken(authPayload.access_token);
    localStorage.setItem('user', JSON.stringify(authPayload.user));
    setIsAuthenticated(true);
  };

  const handleRegister = (authPayload) => {
    authStorage.setToken(authPayload.access_token);
    localStorage.setItem('user', JSON.stringify(authPayload.user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setIsAuthenticated(false);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-400">
        Checking authentication...
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        /* ---------- PUBLIC ROUTES ---------- */
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<RegisterPage onRegister={handleRegister} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/upload" element={<FileUpload />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        /* ---------- AUTHENTICATED DASHBOARD ---------- */
        <ThemeProvider>
          <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 flex flex-col">
              <TopNav onLogout={handleLogout} />

              <main className="flex-1 px-6 py-8">
                <Routes>
                  {/* Dashboard Home */}
                  <Route
  path="/dashboard"
  element={<Dashboard />}
/>

                  {/* Device Details Page */}
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/device-details" element={<DeviceDetails />} />
                  <Route
                    path="/device-details/:ip"
                    element={<DeviceDetails />}
                  />

                  {/* <Route path="/devices" element={<div>Devices Page</div>} /> */}

                  <Route
                    path="/dataset"
                    element={<FileUpload setData={setUploadedData} />}
                  />

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