import React from 'react';
import DataBadge from './DataBadge';

export default function MetricCard({ title, value, unit, icon: Icon, dataType = 'simulated', status = 'normal' }) {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
        <span className="font-semibold font-heading tracking-wide">{title}</span>
        <DataBadge type={dataType} />
      </div>
      <div className="flex items-end justify-between mt-1">
        <div>
          <span className="data-value text-2xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-slate-400 ml-1.5 font-sans">{unit}</span>}
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_-4px_rgba(0,245,212,0.35)]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
