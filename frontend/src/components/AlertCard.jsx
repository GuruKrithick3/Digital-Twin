import React from 'react';
import { AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function AlertCard({ alert }) {
  const { station, severity, title, message, sourceModule, timestamp } = alert;

  const severityConfig = {
    GREEN: { bg: 'bg-emerald-950/30', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle2 },
    YELLOW: { bg: 'bg-amber-950/30', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle },
    RED: { bg: 'bg-rose-950/30', border: 'border-rose-500/30', text: 'text-rose-400', icon: AlertOctagon },
    BLUE: { bg: 'bg-blue-950/30', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info }
  };

  const cfg = severityConfig[severity] || severityConfig.BLUE;
  const Icon = cfg.icon;

  return (
    <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} backdrop-blur-md transition-all duration-200`}>
      <div className="flex items-start space-x-3.5">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-wide truncate">{title}</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10 shrink-0 uppercase tracking-wider">
              {station} • {sourceModule.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{message}</p>
          <div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center justify-between">
            <span className="tracking-wider text-slate-500">TIMESTAMP</span>
            <span className="tabular-nums text-slate-400">{new Date(timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

