import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Lock, Activity, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('en-GB');

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getAsciiClock = (timeStr) => {
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black z-0" />

      {/* ASCII Background Clock */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0">
        <div className="font-mono text-[18px] leading-[1.1] text-red-600/20 tracking-wider select-none">
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

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-10 py-6 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/40">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white">TrustCast</span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white transition">
            About
          </button>
          <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white transition">
            Contact
          </button>
          <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white transition">
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-10 pt-32 pb-20 text-white">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-600 font-semibold mb-4">
              IoT Security Platform
            </p>

            <h1 className="text-6xl font-black leading-tight mb-6">
              Trust Your Devices.
              <br />
              <span className="text-red-600">Secure Your Network.</span>
            </h1>

            <p className="text-gray-300 text-lg max-w-lg mb-8">
              Advanced ML-driven trust scoring system for IoT environments.
              Detect anomalies in real-time and secure your infrastructure with enterprise-grade monitoring.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-md bg-red-600 px-8 py-4 font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/40 hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="rounded-md border border-gray-600 px-8 py-4 font-semibold hover:border-white hover:bg-white/10 transition"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6">
            {[
              { icon: Activity, title: 'Real-Time Monitoring', desc: 'Continuous trust scoring & anomaly detection.' },
              { icon: Database, title: 'ML-Powered Insights', desc: 'Deep behavioral learning and pattern analysis.' },
              { icon: Lock, title: 'Enterprise Security', desc: 'Audit logs, role control & automatic quarantine.' }
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-800 bg-gray-900/70 backdrop-blur-sm p-6 hover:border-red-600/50 hover:scale-105 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-600/20 p-3 rounded-xl border border-red-600/30">
                    <feature.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 bg-black/90 py-8 text-center text-gray-500">
        © 2025 TrustCast. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;