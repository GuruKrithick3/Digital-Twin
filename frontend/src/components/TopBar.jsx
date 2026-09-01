import React, { useState, useEffect } from 'react';
import { ShieldCheck, Radio, Snowflake, Clock } from 'lucide-react';
import DataBadge from './DataBadge';

export default function TopBar() {
  const [time, setTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-40
                   bg-black/40 backdrop-blur-2xl border-b border-white/10
                   shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(0,245,212,0.35)]">
          <div className="w-full h-full bg-black/60 rounded-[10px] flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-cyan-300" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide flex items-center space-x-2">
            <span>ANTARCTIC TWIN</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/[0.06] text-cyan-300 border border-cyan-400/30">
              INDIA REMOTE OPS
            </span>
          </h1>
          <p className="text-xs text-slate-400">National Centre for Polar & Ocean Research (NCPOR) Management Twin</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 text-xs text-slate-300 bg-white/[0.05] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <DataBadge type="real" />
          <DataBadge type="simulated" />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-white/[0.05] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Clock className="w-4 h-4 text-cyan-300" />
          <span>{time}</span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-800/50">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold font-mono tracking-wider">LINK ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
