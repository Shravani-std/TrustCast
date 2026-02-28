import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Cpu,
  Activity,
  CloudUpload,
  BookOpen,
  FileText,
  KeyRound,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // { path: '/devices', label: 'Devices', icon: Activity },
  { path: '/device-details', label: 'Device Details', icon: Cpu },
  { path: '/dataset', label: 'Dataset Upload', icon: CloudUpload },
  { path: '/api', label: 'API Playground', icon: KeyRound },
  { path: '/logs', label: 'Logs & Audit', icon: FileText },
  { path: '/help', label: 'Help & Docs', icon: BookOpen },
];

const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white/95 px-6 py-8 lg:flex">
      
      {/* Logo Section */}
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-2xl bg-slate-900/90 p-3 text-white shadow-md">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            TrustCast
          </p>
          <p className="text-lg font-semibold text-slate-900">
            IoT Security
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <IconComponent className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;