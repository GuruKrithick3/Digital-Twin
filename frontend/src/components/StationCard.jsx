import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Thermometer, ShieldAlert, Heart, Fuel, Droplet } from 'lucide-react';
import DataBadge from './DataBadge';

export default function StationCard({ name, status, temp, fuelPct, waterPct, healthScore, activeAlertsCount }) {
  const statusColor = status === 'normal' || status === 'operational'
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    : status === 'warning'
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    : 'bg-rose-500/20 text-rose-400 border-rose-500/40';

  return (
    <div className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:border-cyan-400/40 transition-all">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-xl text-white tracking-wide">{name} Station</h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold font-heading tracking-wider border ${statusColor}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/[0.06] px-2.5 py-1 rounded-md border border-white/10">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="data-value text-xs font-bold text-slate-200">{healthScore}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Temperature</span>
              <DataBadge type="real" />
            </div>
            <div className="text-lg font-bold text-cyan-300 data-value flex items-center">
              <Thermometer className="w-4 h-4 mr-1 text-cyan-400" />
              {temp}°C
            </div>
          </div>

          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Fuel Reserve</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-amber-300 data-value flex items-center">
              <Fuel className="w-4 h-4 mr-1 text-amber-400" />
              {fuelPct}%
            </div>
          </div>

          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Water Reserve</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-blue-300 data-value flex items-center">
              <Droplet className="w-4 h-4 mr-1 text-blue-400" />
              {waterPct}%
            </div>
          </div>

          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Alerts</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-rose-400 data-value flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-rose-400" />
              {activeAlertsCount}
            </div>
          </div>
        </div>
      </div>

      <Link
        to={`/station/${name.toLowerCase()}`}
        className="inline-flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-white/[0.06] text-cyan-300 border border-cyan-400/30 font-semibold font-heading tracking-wide text-sm hover:bg-white/[0.1] hover:border-cyan-400/50 shadow-[0_0_20px_-4px_rgba(0,245,212,0.3)] transition-all mt-2"
      >
        <span>Open 3D Digital Twin</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
