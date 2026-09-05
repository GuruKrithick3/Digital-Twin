import React, { useState, useEffect, useMemo } from 'react';
import DataBadge from '../components/DataBadge';
import { fetchMaintenance } from '../services/api';
import { Wrench, Cpu, Zap, Fan, Gauge, AlertTriangle, Eye, CheckCircle2, Loader2, Info } from 'lucide-react';

const ASSET_ICONS = {
  pump: Gauge,
  generator: Zap,
  hvac: Fan,
  default: Cpu,
};

const BUCKET_STYLES = {
  HIGH: {
    text: 'text-rose-400',
    bar: 'bg-rose-500',
    ring: 'border-rose-500/40',
    chip: 'bg-rose-500/15 text-rose-400',
    icon: AlertTriangle,
    label: 'Needs attention soon',
  },
  MEDIUM: {
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    ring: 'border-amber-500/40',
    chip: 'bg-amber-500/15 text-amber-400',
    icon: Eye,
    label: 'Worth watching',
  },
  LOW: {
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    ring: 'border-emerald-500/40',
    chip: 'bg-emerald-500/15 text-emerald-400',
    icon: CheckCircle2,
    label: 'Running normally',
  },
};

export default function Maintenance() {
  const [station, setStation] = useState('Bharati');
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMaintenance(station)
      .then(res => setMaintenanceList(res.data.data))
      .catch(() => setMaintenanceList([]))
      .finally(() => setLoading(false));
  }, [station]);

  const sorted = useMemo(() => {
    return [...maintenanceList].sort(
      (a, b) => (b.prediction?.failureProbability || 0) - (a.prediction?.failureProbability || 0)
    );
  }, [maintenanceList]);

  const counts = useMemo(() => {
    return sorted.reduce(
      (acc, item) => {
        const bucket = item.prediction?.bucket || 'LOW';
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      },
      { HIGH: 0, MEDIUM: 0, LOW: 0 }
    );
  }, [sorted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Predictive Equipment Health</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Predicted failure risk derived from real-time temperature, vibration and runtime telemetry</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/[0.08]">
          {['Maitri', 'Bharati'].map(s => (
            <button
              key={s}
              onClick={() => setStation(s)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-heading tracking-wider transition-all ${
                station === s ? 'bg-[#3A86FF] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-10 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-sm font-sans">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          Loading equipment data for {station}…
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-panel p-10 rounded-xl flex flex-col items-center justify-center gap-2 text-center">
          <Wrench className="w-6 h-6 text-slate-500" />
          <p className="text-sm text-slate-400 font-sans">No equipment data available for {station} right now.</p>
        </div>
      ) : (
        <>
          {/* Fleet summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['HIGH', 'MEDIUM', 'LOW']).map(bucket => {
              const style = BUCKET_STYLES[bucket];
              const BucketIcon = style.icon;
              return (
                <div key={bucket} className={`glass-panel rounded-xl border p-4 flex items-center gap-3.5 ${style.ring}`}>
                  <div className={`w-9 h-9 rounded-lg bg-slate-900/80 flex items-center justify-center shrink-0 ${style.text}`}>
                    <BucketIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold font-mono leading-none ${style.text}`}>{counts[bucket]}</p>
                    <p className="text-xs text-slate-400 font-sans mt-1">{style.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-sans">Sorted by failure risk probability, highest first</p>
            <DataBadge type="simulated" />
          </div>

          <div className="space-y-4">
            {sorted.map((item, idx) => {
              const { asset, prediction } = item;
              const bucket = prediction?.bucket || 'LOW';
              const probPct = Math.round((prediction?.failureProbability || 0.05) * 100);
              const style = BUCKET_STYLES[bucket];
              const Icon = ASSET_ICONS[asset.type?.toLowerCase()] || ASSET_ICONS.default;

              return (
                <div key={idx} className="glass-panel glass-panel-hover rounded-xl border border-white/[0.08] p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-11 h-11 shrink-0 rounded-lg bg-slate-900/80 border ${style.ring} flex items-center justify-center ${style.text}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base font-heading tracking-wide truncate">{asset.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${style.chip} shrink-0`}>
                            {bucket}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{asset.assetId} · {asset.type}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold font-mono tabular-nums ${style.text}`}>{probPct}%</p>
                      <p className="text-[10px] text-slate-500 font-sans">failure risk</p>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="mt-3.5 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/[0.04]">
                    <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${probPct}%` }} />
                  </div>

                  {/* Sensor readings */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-4 text-xs font-mono text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-white/[0.04]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-sans">Temperature:</span>
                      <span className="text-slate-200 font-bold">{asset.temperature}°C</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-sans">Vibration:</span>
                      <span className="text-slate-200 font-bold">{asset.vibration} mm/s</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-sans">Runtime:</span>
                      <span className="text-slate-200 font-bold">{asset.runtimeHours}h</span>
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.08]">
                    <div className="flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-200 font-sans">
                        <span className={`font-semibold font-mono ${style.chip} px-2 py-0.5 rounded mr-2 text-[11px] align-middle border`}>
                          {prediction?.recommendedAction}
                        </span>
                        <span className="text-slate-400">{prediction?.timeWindow}</span>
                      </p>
                    </div>
                    {prediction?.contributingReasons?.length > 0 && (
                      <div className="flex items-start gap-2.5 mt-2">
                        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 font-sans">
                          <span className="text-slate-400 font-medium">Contributing Factors:</span> {prediction.contributingReasons.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

}