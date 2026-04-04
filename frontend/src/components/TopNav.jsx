import React, { useState, useEffect } from 'react';
import { Search, UserRound, LogOut } from 'lucide-react';
import { useTheme } from './ThemeContext';

const TopNav = ({ onLogout }) => {
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('Analyst');
  const { highContrast, setHighContrast } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('trustcast_token');
    if (token) {
      fetch('http://localhost:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUserName(data.user.name || 'User');
          setUserRole(data.user.role || 'Analyst');
        })
        .catch(() => {}); // Silent fail
    }
  }, []);

  return (
    <header className="
      sticky top-0 z-40 flex items-center justify-between
      border-b border-slate-200
      bg-white/90
      dark:bg-slate-950
      dark:border-slate-800
      px-6 py-4 backdrop-blur-md
      transition-colors
    ">

      <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 dark:border-slate-700">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          placeholder="Search devices, alerts, logs..."
          className="w-64 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400 dark:text-gray-300"
        />
      </div>

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 dark:border-slate-700">
          <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
            <UserRound className="h-4 w-4 text-slate-500 dark:text-gray-300" />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {userName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              {userRole}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

      </div>

    </header>
  );
};

export default TopNav;

