import React from 'react';
import { Search, Bell, Lock, UserRound, LogOut } from 'lucide-react';
import { useTheme } from './ThemeContext';

const TopNav = ({ onLogout }) => {

  const { highContrast, setHighContrast } = useTheme();

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

        {/* <button
onClick={() => setHighContrast(!highContrast)}
className="
px-4 py-1 rounded-full
bg-black text-white
dark:bg-white dark:text-black
transition-colors
"
>
{highContrast ? "Normal Mode" : "High Contrast"}
</button> */}

        {/* <button className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800">
          <Lock className="h-4 w-4" />
        </button> */}

        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 dark:border-slate-700">
          <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
            <UserRound className="h-4 w-4 text-slate-500 dark:text-gray-300" />
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