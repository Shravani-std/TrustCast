import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Cpu,
  Activity,
  // Database,

  CloudUpload,
  // Settings,
  BookOpen,
  FileText,
  KeyRound,
  // LogIn
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'devices', label: 'Devices', icon: Activity },
  { id: 'device-details', label: 'Device Details', icon: Cpu },
  { id: 'dataset', label: 'Dataset Upload', icon: CloudUpload },
  // { id: 'model', label: 'Model Monitor', icon: Database },
  { id: 'api', label: 'API Playground', icon: KeyRound },
  // { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'logs', label: 'Logs & Audit', icon: FileText },
  { id: 'help', label: 'Help & Docs', icon: BookOpen },
  // { id: 'login', label: 'Login', icon: LogIn }
];

const Sidebar = ({ activeView, onSelect }) => (
  <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white/95 px-6 py-8 lg:flex">
    <div className="mb-10 flex items-center gap-3">
      <div className="rounded-2xl bg-slate-900/90 p-3 text-white shadow-md">
        <Shield className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">TrustCast</p>
        <p className="text-lg font-semibold text-slate-900">IoT Security</p>
      </div>
    </div>

    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IconComponent className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>

    {/* <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Countdown</p>
      <p className="mt-2 text-sm text-slate-600">Next model retrain:</p>
      <p className="text-lg font-semibold text-slate-900">2 days • 10h • 23m</p>
    </div> */}
  </aside>
);

export default Sidebar;

