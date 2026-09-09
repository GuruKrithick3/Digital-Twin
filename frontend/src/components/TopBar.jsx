import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Radio, Snowflake, Clock, LogOut, CircleUserRound } from 'lucide-react';
import DataBadge from './DataBadge';
import { useAuth } from '../auth/AuthContext';
import { fetchObservationCurrent } from '../services/api';

export default function TopBar() {
  const [time, setTime] = useState('loading…');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const formatObserveTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) + ' · ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchObservationCurrent('Maitri'),
      fetchObservationCurrent('Bharati')
    ])
      .then(([m, b]) => {
        if (cancelled) return;
        const ts = [
          m?.data?.current?.timestamp,
          b?.data?.current?.timestamp
        ].filter(Boolean);
        if (!ts.length) {
          setTime('no observation data');
          return;
        }
        const latest = ts.map(t => new Date(t).getTime()).sort((a, z) => z - a)[0];
        setTime(formatObserveTime(new Date(latest).toISOString()));
      })
      .catch(() => {
        if (!cancelled) setTime('no observation data');
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-40
                   bg-[#0B132B]/90 backdrop-blur-xl border-b border-white/[0.08]
                   shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]">
      <div className="flex items-center space-x-3.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-0.5 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_-3px_rgba(0,245,212,0.2)]">
          <div className="w-full h-full bg-[#0B132B]/80 rounded-[6px] flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <h1 className="font-heading font-bold text-base text-white tracking-wider flex items-center space-x-2.5">
            <span>ANTARCTIC TWIN</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-cyan-300 border border-cyan-400/20 tracking-wider">
              INDIA REMOTE OPS
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-sans tracking-wide">National Centre for Polar & Ocean Research (NCPOR) Management Twin</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.08]">
          <DataBadge type="real" />
          <DataBadge type="simulated" />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.08]" title="Latest observation timestamp from real station data">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tabular-nums text-slate-200">{time}</span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="font-semibold font-mono tracking-wider text-[11px]">LINK ACTIVE</span>
        </div>

        {user && (
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 text-xs bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.08]">
              <CircleUserRound className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-semibold font-sans">{user.username}</span>
              <span className={`font-heading uppercase tracking-wider px-1.5 py-0.5 rounded text-[10px] font-bold ${
                user.role === 'admin'
                  ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                  : 'bg-blue-400/15 text-blue-300 border border-blue-400/30'
              }`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/60 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.08] transition-all font-sans"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

