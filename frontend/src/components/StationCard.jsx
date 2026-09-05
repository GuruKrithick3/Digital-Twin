import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Thermometer, ShieldAlert, Heart, Fuel, Droplet } from 'lucide-react';
import DataBadge from './DataBadge';

export default function StationCard({ name, status, temp, fuelPct, waterPct, healthScore, activeAlertsCount }) {
  const statusColor = status === 'normal' || status === 'operational'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : status === 'warning'
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-xl text-white font-heading tracking-wide">{name} Station</h3>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono tracking-wider border uppercase ${statusColor}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/[0.08]">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="data-value text-xs font-bold text-slate-200">{healthScore}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-slate-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-heading font-semibold text-[11px] uppercase tracking-wider">Temperature</span>
              <DataBadge type="real" />
            </div>
            <div className="text-lg font-bold text-cyan-300 data-value flex items-center mt-1">
              <Thermometer className="w-4 h-4 mr-1.5 text-cyan-400 shrink-0" />
              {temp}°C
            </div>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-heading font-semibold text-[11px] uppercase tracking-wider">Fuel Reserve</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-amber-300 data-value flex items-center mt-1">
              <Fuel className="w-4 h-4 mr-1.5 text-amber-400 shrink-0" />
              {fuelPct}%
            </div>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-heading font-semibold text-[11px] uppercase tracking-wider">Water Reserve</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-blue-300 data-value flex items-center mt-1">
              <Droplet className="w-4 h-4 mr-1.5 text-blue-400 shrink-0" />
              {waterPct}%
            </div>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-heading font-semibold text-[11px] uppercase tracking-wider">Active Alerts</span>
              <DataBadge type="simulated" />
            </div>
            <div className="text-lg font-bold text-rose-400 data-value flex items-center mt-1">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-rose-400 shrink-0" />
              {activeAlertsCount}
            </div>
          </div>
        </div>
      </div>

      <Link
        to={`/station/${name.toLowerCase()}`}
        className="inline-flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg bg-white/[0.06] text-cyan-300 border border-cyan-400/30 font-semibold font-heading tracking-wider text-sm hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all mt-2"
      >
        <span>Open 3D Digital Twin</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

