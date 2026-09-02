import React, { useState, useEffect, useMemo } from 'react';
import DataBadge from '../components/DataBadge';
import { fetchLogistics } from '../services/api';
import { Calendar, ArrowDown } from 'lucide-react';

const RISK_STYLES = {
  HIGH: { text: 'text-rose-400', chip: 'bg-rose-500/15 text-rose-400 border-rose-500/40', bar: 'bg-rose-500' },
  MODERATE: { text: 'text-amber-400', chip: 'bg-amber-500/15 text-amber-400 border-amber-500/40', bar: 'bg-amber-500' },
  LOW: { text: 'text-emerald-400', chip: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', bar: 'bg-emerald-500' },
};

export default function Logistics() {
  const [station, setStation] = useState('Bharati');
  const [logisticsData, setLogisticsData] = useState(null);

  useEffect(() => {
    fetchLogistics(station).then(res => setLogisticsData(res.data)).catch(() => {});
  }, [station]);

  const sortedInventory = useMemo(() => {
    return [...(logisticsData?.inventory || [])].sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [logisticsData]);

  const criticalCount = sortedInventory.filter(i => i.riskRating === 'HIGH').length;
  const maxDays = Math.max(...sortedInventory.map(i => i.daysRemaining), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventory & resupply</h2>
          <p className="text-sm text-slate-400">Stock levels, burn rate, and when the next voyage should leave</p>
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

      {/* Resupply recommendation moved up top — it's the answer, not a footnote */}
      <div className="glass-panel p-5 rounded-xl border-l-4 border-l-[#3A86FF]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Recommended resupply window</p>
              <p className="font-bold text-white text-base">
                {logisticsData?.resupplyRecommendation?.recommendedWindow || '—'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            RISK_STYLES[logisticsData?.resupplyRecommendation?.urgency]?.chip || RISK_STYLES.LOW.chip
          }`}>
            {logisticsData?.resupplyRecommendation?.urgency || 'MODERATE'} urgency
          </span>
        </div>
        {criticalCount > 0 && (
          <p className="text-xs text-rose-400 mt-3 flex items-center gap-1.5">
            <ArrowDown className="w-3.5 h-3.5" />
            {criticalCount} item{criticalCount > 1 ? 's' : ''} at high risk of running out — see below
          </p>
        )}
      </div>

      {/* Inventory list, most urgent first */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">Stock levels, most urgent first</h3>
          <DataBadge type="simulated" />
        </div>

        <div className="space-y-2">
          {sortedInventory.map((item, idx) => {
            const style = RISK_STYLES[item.riskRating] || RISK_STYLES.LOW;
            const fillPct = Math.min(100, Math.round((item.daysRemaining / maxDays) * 100));

            return (
              <div key={idx} className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-[#1C2541]/40 transition-colors">
                <div className="w-40 shrink-0">
                  <p className="text-white text-sm font-medium truncate">{item.itemName}</p>
                  <p className="text-[11px] text-slate-500 uppercase">{item.itemCategory}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-[#0B132B] overflow-hidden">
                    <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${fillPct}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {item.currentStock.toLocaleString()} {item.unit} · using {item.dailyConsumption}/day · depletes {item.predictedDepletionDate}
                  </p>
                </div>

                <div className="text-right shrink-0 w-20">
                  <p className={`font-mono font-bold text-sm ${style.text}`}>{item.daysRemaining}d</p>
                  <p className="text-[10px] text-slate-500">left</p>
                </div>

                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${style.chip}`}>
                  {item.riskRating}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}