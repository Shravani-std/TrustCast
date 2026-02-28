import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Lock, Activity, Database, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();   // ✅ React Router navigation

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

      {/* Background Clock */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 font-mono text-red-600 text-[16px]">
        {clockLines.map((line, idx) => (
          <div key={idx} className="whitespace-pre">{line}</div>
        ))}
        <div className="mt-6 text-sm">{dateStr}</div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white">TrustCast</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white">
            About
          </button>
          <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-white">
            Contact
          </button>
          <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white">
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-32 pb-20 text-white">
        <h1 className="text-5xl font-black mb-6">
          Trust Your Devices.
          <br />
          <span className="text-red-600">Secure Your Network.</span>
        </h1>

        <p className="text-gray-300 mb-8 max-w-lg">
          ML-powered IoT trust scoring and anomaly detection platform.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-red-600 px-6 py-3 rounded hover:bg-red-700"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="border border-gray-600 px-6 py-3 rounded hover:border-white"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 text-center text-gray-500">
        © 2025 TrustCast. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;