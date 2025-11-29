import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Lock, Activity, Database, Zap } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getAsciiClock = (timeStr) => {
    // Enhanced ASCII art digits (0-9 and colon) - larger and bolder
    const digits = {
      '0': [' ██████ ', '██    ██', '██    ██', '██    ██', '██    ██', '██    ██', ' ██████ '],
      '1': ['   ██   ', '  ███   ', '   ██   ', '   ██   ', '   ██   ', '   ██   ', ' ███████'],
      '2': [' ██████ ', '██    ██', '      ██', ' ██████ ', '██      ', '██      ', '████████'],
      '3': [' ██████ ', '██    ██', '      ██', '  █████ ', '      ██', '██    ██', ' ██████ '],
      '4': ['██    ██', '██    ██', '██    ██', ' ███████', '      ██', '      ██', '      ██'],
      '5': ['████████', '██      ', '██      ', ' ██████ ', '      ██', '██    ██', ' ██████ '],
      '6': [' ██████ ', '██      ', '██      ', '████████', '██    ██', '██    ██', ' ██████ '],
      '7': ['████████', '      ██', '     ██ ', '    ██  ', '   ██   ', '  ██    ', ' ██     '],
      '8': [' ██████ ', '██    ██', '██    ██', ' ██████ ', '██    ██', '██    ██', ' ██████ '],
      '9': [' ██████ ', '██    ██', '██    ██', ' ███████', '      ██', '      ██', ' ██████ '],
      ':': ['        ', '   ██   ', '   ██   ', '        ', '   ██   ', '   ██   ', '        ']
    };

    const lines = ['', '', '', '', '', '', ''];
    for (let char of timeStr) {
      const digit = digits[char] || digits['0'];
      for (let i = 0; i < 7; i++) {
        lines[i] += digit[i] + '  ';
      }
    }
    return lines;
  };

  const clockLines = getAsciiClock(formatTime(time));
  const dateStr = formatDate(time);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient overlay for Netflix effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black z-0" />
      
      {/* ASCII Clock Background - Real-time running watch */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0">
        <div className="font-mono text-[16px] leading-[1.1] text-red-600/20 select-none tracking-wider">
          {clockLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre text-center">
              {line}
            </div>
          ))}
        </div>
        <div className="mt-8 font-mono text-sm text-red-600/15 text-center">
          {dateStr}
        </div>
      </div>
      
      {/* Additional subtle clock instances for depth */}
      <div className="pointer-events-none absolute top-20 left-10 font-mono text-[10px] leading-[1] text-red-600/10 select-none z-0">
        {clockLines.slice(0, 3).map((line, idx) => (
          <div key={idx} className="whitespace-pre">
            {line.substring(0, 20)}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-20 right-10 font-mono text-[10px] leading-[1] text-red-600/10 select-none z-0">
        {clockLines.slice(0, 3).map((line, idx) => (
          <div key={idx} className="whitespace-pre">
            {line.substring(0, 20)}
          </div>
        ))}
      </div>

      {/* Navigation Bar - Netflix Style */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/95 to-transparent">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-600 p-2 text-white shadow-lg shadow-red-600/50">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white">TrustCast</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('about')}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            About
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section - Netflix Style */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-red-600 font-semibold mb-4">IoT Security Platform</p>
            <h1 className="text-6xl font-black text-white mb-6 leading-tight">
              Trust Your Devices.
              <br />
              <span className="text-red-600">Secure Your Network.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
              AI-powered trust scoring for IoT devices. Real-time anomaly detection, ML-driven insights, and enterprise-grade security monitoring.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-2 rounded-md bg-red-600 px-8 py-4 text-base font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/50 hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="rounded-md border-2 border-gray-600 bg-black/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white hover:border-white hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 hover:border-red-600/50 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-600/20 p-3 border border-red-600/30">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Real-Time Monitoring</h3>
                  <p className="text-sm text-gray-400">Continuous trust scoring and anomaly detection across your entire IoT network.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 hover:border-red-600/50 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-600/20 p-3 border border-red-600/30">
                  <Database className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">ML-Powered Insights</h3>
                  <p className="text-sm text-gray-400">Advanced machine learning models trained on behavioral patterns and network topology.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 hover:border-red-600/50 transition-all hover:scale-105">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-600/20 p-3 border border-red-600/30">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Enterprise Security</h3>
                  <p className="text-sm text-gray-400">Multi-factor authentication, audit logs, and role-based access control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Netflix Card Style */}
        <div className="mt-40">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-red-600 font-semibold mb-4">Platform Features</p>
            <h2 className="text-4xl font-black text-white mb-2">Everything you need to secure IoT networks</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Alerts', desc: 'Get notified immediately when trust scores drop or anomalies are detected.' },
              { icon: Activity, title: 'Behavioral Analysis', desc: 'Track device behavior patterns and identify suspicious activities.' },
              { icon: Shield, title: 'Auto Quarantine', desc: 'Automatically isolate devices with trust scores below threshold.' }
            ].map((feature, idx) => (
              <div key={idx} className="rounded-lg border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 hover:border-red-600/50 hover:scale-105 transition-all cursor-pointer group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  <feature.icon className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Netflix Style */}
      <footer className="relative z-10 border-t border-gray-900 bg-black/95 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">© 2025 TrustCast. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">Terms</button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">Docs</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

