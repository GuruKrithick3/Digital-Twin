import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchMaintenance } from '../services/api';
import { Wrench, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export default function Maintenance() {
  const [station, setStation] = useState('Bharati');
  const [maintenanceList, setMaintenanceList] = useState([]);

  useEffect(() => {
    fetchMaintenance(station).then(res => setMaintenanceList(res.data.data)).catch(() => {});
  }, [station]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Equipment Health & Predictive Maintenance Twin</h2>
          <p className="text-sm text-slate-400">ML-driven failure probability modeling based on temperature, vibration & runtime telemetry</p>
        </div>

        <div className="flex items-center space-x-2 bg-[#1C2541] p-1 rounded-lg border border-[#2A365C]">
          <button
            onClick={() => setStation('Maitri')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              station === 'Maitri' ? 'bg-[#3A86FF] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Maitri
          </button>
          <button
            onClick={() => setStation('Bharati')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              station === 'Bharati' ? 'bg-[#3A86FF] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bharati
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {maintenanceList.map((item, idx) => {
          const { asset, prediction } = item;
          const bucket = prediction?.bucket || 'LOW';
          const probPct = Math.round((prediction?.failureProbability || 0.05) * 100);

          return (
            <div key={idx} className="glass-panel p-5 rounded-xl border border-[#2A365C] hover:border-[#3A86FF]/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0B132B] border border-[#2A365C] flex items-center justify-center text-cyan-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{asset.name}</h3>
                    <p className="text-xs text-slate-400">ID: {asset.assetId} • Type: {asset.type.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DataBadge type="simulated" />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    bucket === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                    bucket === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    FAILURE RISK: {probPct}% ({bucket})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 p-3 rounded-lg bg-[#0B132B]/70 border border-[#2A365C] text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Operating Temp</span>
                  <span className="font-mono font-bold text-white">{asset.temperature}°C</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Vibration Level</span>
                  <span className="font-mono font-bold text-white">{asset.vibration} mm/s</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Cumulative Runtime</span>
                  <span className="font-mono font-bold text-white">{asset.runtimeHours} Hours</span>
                </div>
              </div>

              <div className="bg-[#1C2541]/60 p-3 rounded-lg border border-[#2A365C] text-xs space-y-1">
                <p className="text-slate-300 font-medium">
                  <span className="text-cyan-400 font-semibold">Recommended Action:</span> {prediction?.recommendedAction} ({prediction?.timeWindow})
                </p>
                {prediction?.contributingReasons?.length > 0 && (
                  <p className="text-slate-400 text-[11px]">
                    Contributing factors: {prediction.contributingReasons.join(' • ')}
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
