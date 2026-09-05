import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  LayoutDashboard,
  Box,
  Zap,
  Truck,
  CloudSun,
  Wrench,
  Sliders,
  BotMessageSquare
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator'] },
  { path: '/station/maitri', label: 'Maitri Station Twin', icon: Box, roles: ['admin', 'operator'] },
  { path: '/station/bharati', label: 'Bharati Station Twin', icon: Box, roles: ['admin', 'operator'] },
  { path: '/energy', label: 'Energy Management', icon: Zap, roles: ['admin', 'operator'] },
  { path: '/logistics', label: 'Logistics & Inventory', icon: Truck, roles: ['admin', 'operator'] },
  { path: '/environment', label: 'Environmental Monitor', icon: CloudSun, roles: ['admin', 'operator'] },
  { path: '/maintenance', label: 'Predictive Maintenance', icon: Wrench, roles: ['admin', 'operator'] },
  { path: '/simulation', label: 'What-If Simulation', icon: Sliders, roles: ['admin', 'operator'] },
  { path: '/assistant', label: 'AI Operations Assistant', icon: BotMessageSquare, roles: ['admin', 'operator'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside
      className="w-64 min-h-[calc(100vh-4rem)] p-3 flex flex-col justify-between shrink-0
                 bg-[#0B132B]/90 backdrop-blur-xl border-r border-white/[0.08]
                 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto"
    >
      <nav className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-heading">
          Control Center Modules
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-heading tracking-wide
                 transition-all duration-200 ease-out overflow-hidden
                 ${
                   isActive
                     ? 'text-cyan-300 bg-white/[0.06] border border-cyan-400/30 shadow-[0_0_15px_-3px_rgba(0,245,212,0.2)]'
                     : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/[0.04] hover:border-white/[0.06]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* active left accent bar */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500 transition-all duration-200 ${
                      isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
                    }`}
                  />
                  <span className="relative z-10 truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="relative p-3 rounded-lg bg-slate-900/60 border border-white/[0.08] text-xs text-slate-400 overflow-hidden mt-4">
        <div className="flex items-center justify-between text-cyan-300 font-semibold mb-1.5 font-heading tracking-wider text-[11px]">
          <span>STATION COORDINATES</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            LIVE
          </span>
        </div>
        <p className="text-slate-300 font-mono text-[11px] leading-tight">Maitri: 70.7667° S, 11.7333° E</p>
        <p className="text-slate-300 font-mono text-[11px] leading-tight mt-0.5">Bharati: 69.4068° S, 76.1952° E</p>
      </div>
    </aside>
  );
}