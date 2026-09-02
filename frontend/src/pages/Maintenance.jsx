import React, { useState, useEffect, useMemo } from 'react';
import DataBadge from '../components/DataBadge';
import { fetchMaintenance } from '../services/api';
import { Wrench, Cpu, Zap, Fan, Gauge } from 'lucide-react';

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
  },
  MEDIUM: {
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    ring: 'border-amber-500/40',
    chip: 'bg-amber-500/15 text-amber-400',
  },
  LOW: {
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    ring: 'border-emerald-500/40',
    chip: 'bg-emerald-500/15 text-emerald-400',
  },
};

export default function Maintenance() {
  const [station, setStation] = useState('Bharati');
  const [maintenanceList, setMaintenanceList] = useState([]);

  useEffect(() => {
    fetchMaintenance(station).then(res => setMaintenanceList(res.data.data)).catch(() => {});
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Equipment health</h2>
          <p className="text-sm text-slate-400">Predicted failure risk from temperature, vibration and runtime data</p>
        </div>

        <div className="flex items-center space-x-2 bg-[#1C2541] p-1 rounded-lg border border-[#2A365C]">
          {['Maitri', 'Bharati'].map(s => (
            <button
              key={s}
              onClick={() => setStation(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                station === s ? 'bg-[#3A86FF] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet summary — answers "how worried should I be" before scrolling */}
      <div className="grid grid-cols-3 gap-3">
        {(['HIGH', 'MEDIUM', 'LOW']).map(bucket => (
          <div key={bucket} className={`glass-panel rounded-xl border p-4 ${BUCKET_STYLES[bucket].ring}`}>
            <p className={`text-3xl font-bold ${BUCKET_STYLES[bucket].text}`}>{counts[bucket]}</p>
            <p className="text-xs text-slate-400 mt-1">
              {bucket === 'HIGH' ? 'Need attention soon' : bucket === 'MEDIUM' ? 'Worth watching' : 'Running normally'}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((item, idx) => {
          const { asset, prediction } = item;
          const bucket = prediction?.bucket || 'LOW';
          const probPct = Math.round((prediction?.failureProbability || 0.05) * 100);
          const style = BUCKET_STYLES[bucket];
          const Icon = ASSET_ICONS[asset.type?.toLowerCase()] || ASSET_ICONS.default;

          return (
            <div key={idx} className="glass-panel rounded-xl border border-[#2A365C] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-11 h-11 shrink-0 rounded-lg bg-[#0B132B] border ${style.ring} flex items-center justify-center ${style.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{asset.name}</h3>
                    <p className="text-xs text-slate-400">{asset.assetId} · {asset.type}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold font-mono ${style.text}`}>{probPct}%</p>
                  <p className="text-[11px] text-slate-500">failure risk</p>
                </div>
              </div>

              {/* Risk bar — the thing a user should be able to read without any text at all */}
              <div className="mt-3 h-1.5 rounded-full bg-[#0B132B] overflow-hidden">
                <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${probPct}%` }} />
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span>{asset.temperature}°C</span>
                <span>{asset.vibration} mm/s vibration</span>
                <span>{asset.runtimeHours}h runtime</span>
                <span className="ml-auto"><DataBadge type="simulated" /></span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2A365C]/60">
                <p className="text-sm text-slate-200">
                  <span className={`font-semibold ${style.chip} px-2 py-0.5 rounded mr-2 text-xs align-middle`}>
                    {prediction?.recommendedAction}
                  </span>
                  <span className="text-slate-400">{prediction?.timeWindow}</span>
                </p>
                {prediction?.contributingReasons?.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Why: {prediction.contributingReasons.join(' · ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}