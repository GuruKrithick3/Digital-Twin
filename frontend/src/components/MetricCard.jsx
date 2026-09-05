import React from 'react';
import DataBadge from './DataBadge';

export default function MetricCard({ title, value, unit, icon: Icon, dataType = 'simulated', status = 'normal' }) {
  return (
    <div className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
        <span className="font-semibold font-heading tracking-wider uppercase text-[11px] text-slate-400">{title}</span>
        <DataBadge type={dataType} />
      </div>
      <div className="flex items-end justify-between mt-1">
        <div>
          <span className="data-value text-2xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-slate-400 ml-1.5 font-sans font-medium">{unit}</span>}
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-900/60 border border-white/[0.08] flex items-center justify-center text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

