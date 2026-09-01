import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchLogistics } from '../services/api';
import { Fuel, Droplet, PackageCheck, AlertCircle, Calendar } from 'lucide-react';

export default function Logistics() {
  const [station, setStation] = useState('Bharati');
  const [logisticsData, setLogisticsData] = useState(null);

  useEffect(() => {
    fetchLogistics(station).then(res => setLogisticsData(res.data)).catch(() => {});
  }, [station]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Logistics, Inventory & Resupply Twin</h2>
          <p className="text-sm text-slate-400">Dynamic inventory tracking, burn-rate calculation, and Antarctic voyage resupply scheduling</p>
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

      {/* Inventory Table */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">Critical Station Inventory Health</h3>
          <DataBadge type="simulated" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B132B] text-slate-400 font-semibold border-b border-[#2A365C]">
              <tr>
                <th className="p-3">Item Category</th>
                <th className="p-3">Resource Name</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Daily Burn</th>
                <th className="p-3">Days Remaining</th>
                <th className="p-3">Predicted Depletion</th>
                <th className="p-3">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A365C]">
              {logisticsData?.inventory?.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1C2541]/40 transition-colors">
                  <td className="p-3 font-semibold uppercase text-cyan-300">{item.itemCategory}</td>
                  <td className="p-3 text-white font-medium">{item.itemName}</td>
                  <td className="p-3 font-mono text-slate-200">{item.currentStock.toLocaleString()} {item.unit}</td>
                  <td className="p-3 font-mono text-slate-300">{item.dailyConsumption} / day</td>
                  <td className="p-3 font-mono font-bold text-amber-300">{item.daysRemaining} days</td>
                  <td className="p-3 font-mono text-slate-300">{item.predictedDepletionDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.riskRating === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                      item.riskRating === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {item.riskRating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resupply Recommendation Panel */}
      <div className="glass-panel p-5 rounded-xl border-l-4 border-l-[#3A86FF]">
        <div className="flex items-center space-x-3 mb-3">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-base">NCPOR Voyage Resupply Recommendation</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Recommended Resupply Window: <span className="font-semibold text-cyan-300">{logisticsData?.resupplyRecommendation?.recommendedWindow}</span>
        </p>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Risk Assessment Rating:</span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            {logisticsData?.resupplyRecommendation?.urgency || 'MODERATE'}
          </span>
        </div>
      </div>
    </div>
  );
}
