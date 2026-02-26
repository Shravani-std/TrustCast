import React from 'react';
import { Search, Bell, Lock, UserRound, LogOut } from 'lucide-react';

const TopNav = ({ onLogout }) => (
  <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md">
    <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        placeholder="Search devices, alerts, logs..."
        className="w-64 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
      />
    </div>

    <div className="flex items-center gap-3">
      <button className="rounded-full bg-black px-3 py-2 text-xs font-bold text-white hover:bg-white hover:text-black border-2 border-white transition-all duration-200">
  High Contrast
</button>
      <button className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">
        <Lock className="h-4 w-4" />
      </button>
      <button className="relative rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
      </button>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
        <div className="rounded-full bg-slate-100 p-2">
          <UserRound className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">Dr. Vega</p>
          <p className="text-[11px] text-slate-500">Admin</p>
        </div>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  </header>
);

export default TopNav;

