import React, { useState, useEffect, useMemo } from 'react';
import DataBadge from '../components/DataBadge';
import { fetchLogistics } from '../services/api';
import { Calendar, ArrowDown, Package, AlertTriangle, TrendingDown, Loader2 } from 'lucide-react';

const RISK_STYLES = {
  HIGH: { text: 'text-rose-400', chip: 'bg-rose-500/15 text-rose-400 border-rose-500/40', bar: 'bg-rose-500', dot: 'bg-rose-500' },
  MODERATE: { text: 'text-amber-400', chip: 'bg-amber-500/15 text-amber-400 border-amber-500/40', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  LOW: { text: 'text-emerald-400', chip: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
};

const CATEGORY_ICON_FALLBACK = 'GENERAL';

export default function Logistics() {
  const [station, setStation] = useState('Bharati');
  const [logisticsData, setLogisticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLogistics(station)
      .then(res => setLogisticsData(res.data))
      .catch(() => setLogisticsData(null))
      .finally(() => setLoading(false));
  }, [station]);

  const sortedInventory = useMemo(() => {
    return [...(logisticsData?.inventory || [])].sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [logisticsData]);

  const criticalCount = sortedInventory.filter(i => i.riskRating === 'HIGH').length;
  const moderateCount = sortedInventory.filter(i => i.riskRating === 'MODERATE').length;
  const maxDays = Math.max(...sortedInventory.map(i => i.daysRemaining), 1);
  const urgency = logisticsData?.resupplyRecommendation?.urgency || 'MODERATE';
  const urgencyStyle = RISK_STYLES[urgency] || RISK_STYLES.MODERATE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Inventory &amp; Resupply Management</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Stock levels, burn rate, and projected voyage resupply windows</p>
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
          Loading logistics data for {station}…
        </div>
      ) : !logisticsData ? (
        <div className="glass-panel p-10 rounded-xl flex flex-col items-center justify-center gap-2 text-center">
          <Package className="w-6 h-6 text-slate-500" />
          <p className="text-sm text-slate-400 font-sans">No logistics data available for {station} right now.</p>
        </div>
      ) : (
        <>
          {/* At-a-glance stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#3A86FF]/15 border border-[#3A86FF]/30 flex items-center justify-center shrink-0">
                <Package className="w-4.5 h-4.5 text-[#3A86FF]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-mono leading-none">{sortedInventory.length}</p>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Tracked items</p>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-mono leading-none">{criticalCount}</p>
                <p className="text-[11px] text-slate-400 font-sans mt-1">High risk items</p>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-mono leading-none">{moderateCount}</p>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Moderate risk items</p>
              </div>
            </div>
          </div>

          {/* Resupply recommendation */}
          <div className={`glass-panel p-5 rounded-xl border-l-4 ${
            urgency === 'HIGH' ? 'border-l-rose-500' : urgency === 'MODERATE' ? 'border-l-amber-500' : 'border-l-emerald-500'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[11px] font-heading uppercase tracking-wider text-slate-400 font-semibold">Recommended Resupply Window</p>
                  <p className="font-bold text-white text-base font-sans mt-0.5">
                    {logisticsData?.resupplyRecommendation?.recommendedWindow || 'Not yet determined'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${urgencyStyle.chip}`}>
                {urgency} URGENCY
              </span>
            </div>
            {criticalCount > 0 && (
              <p className="text-xs text-rose-400 font-sans mt-3 flex items-center gap-1.5">
                <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                {criticalCount} item{criticalCount > 1 ? 's' : ''} at high risk of depletion prior to scheduled resupply
              </p>
            )}
          </div>

          {/* Inventory list */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white font-heading tracking-wide text-base">Station Stock Reserves (Ranked by Urgency)</h3>
              <DataBadge type="simulated" />
            </div>

            {sortedInventory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6 font-sans">No inventory items to display.</p>
            ) : (
              <div className="space-y-2">
                {/* Column header row */}
                <div className="hidden sm:flex items-center gap-4 px-3 pb-2 text-[10px] uppercase tracking-wider text-slate-400 font-heading font-semibold border-b border-white/[0.06]">
                  <span className="w-44 shrink-0">Item / Category</span>
                  <span className="flex-1">Stock Level & Depletion Rate</span>
                  <span className="text-right shrink-0 w-20">Days Left</span>
                  <span className="shrink-0 w-24 text-right">Risk Level</span>
                </div>

                {sortedInventory.map((item, idx) => {
                  const style = RISK_STYLES[item.riskRating] || RISK_STYLES.LOW;
                  const fillPct = Math.min(100, Math.round((item.daysRemaining / maxDays) * 100));

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 px-3 rounded-lg border border-transparent hover:border-white/[0.08] hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 w-full sm:w-44 shrink-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                        <div className="min-w-0">
                          <p className="text-slate-100 text-sm font-semibold truncate font-sans">{item.itemName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono truncate">{item.itemCategory || CATEGORY_ICON_FALLBACK}</p>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/[0.04]">
                          <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${fillPct}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                          {item.currentStock.toLocaleString()} {item.unit} · {item.dailyConsumption}/day · Depletes {item.predictedDepletionDate}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                        <div className="text-right w-20">
                          <p className={`font-mono font-bold text-sm ${style.text}`}>{item.daysRemaining}d</p>
                          <p className="text-[10px] text-slate-500 font-sans">remaining</p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap ${style.chip}`}>
                          {item.riskRating}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}