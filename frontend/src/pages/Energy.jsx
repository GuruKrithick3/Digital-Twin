import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchEnergy } from '../services/api';
import { Zap, Fuel, Activity, ArrowRight, Gauge } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Energy() {
  const [station, setStation] = useState('Bharati');
  const [energyData, setEnergyData] = useState(null);

  useEffect(() => {
    fetchEnergy(station).then(res => setEnergyData(res.data)).catch(() => {});
  }, [station]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Energy Management & Generation Twin</h2>
          <p className="text-sm text-slate-400">Power generation, consumption, CHP thermal loops & fuel efficiency tracking</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Current Generation" value={energyData?.current?.generationKw || 420} unit="kW" icon={Zap} dataType="simulated" />
        <MetricCard title="Current Consumption" value={energyData?.current?.consumptionKw || 385} unit="kW" icon={Activity} dataType="simulated" />
        <MetricCard title="Thermal Efficiency" value={energyData?.current?.efficiencyPct || 91.2} unit="%" icon={Gauge} dataType="simulated" />
        <MetricCard title="Fuel Burn Rate" value={energyData?.current?.fuelConsumptionLph || 48.6} unit="L/h" icon={Fuel} dataType="simulated" />
      </div>

      {/* 24h Generation vs Consumption Chart */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Generation vs Consumption Trend (24 Hours)</h3>
            <p className="text-xs text-slate-400">Real-time load balancing and power stability envelope</p>
          </div>
          <DataBadge type="simulated" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyData?.history24h || []}>
              <defs>
                <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3A86FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A365C" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#2A365C', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="generationKw" name="Generation (kW)" stroke="#00F5D4" fillOpacity={1} fill="url(#colorGen)" />
              <Area type="monotone" dataKey="consumptionKw" name="Consumption (kW)" stroke="#3A86FF" fillOpacity={1} fill="url(#colorCon)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Flow Visualization */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">Station Microgrid Energy Flow Pipeline</h3>
          <DataBadge type="simulated" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[#0B132B]/80 border border-[#2A365C]">
          <div className="text-center p-3 rounded-lg bg-[#1C2541] border border-cyan-500/40">
            <p className="text-xs text-slate-400">Generators / CHP</p>
            <p className="text-lg font-bold font-mono text-cyan-300">{energyData?.current?.generationKw || 420} kW</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500" />
          <div className="text-center p-3 rounded-lg bg-[#1C2541] border border-blue-500/40">
            <p className="text-xs text-slate-400">Distribution Switchgear</p>
            <p className="text-lg font-bold font-mono text-blue-300">100% Nominal</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#1C2541] p-2 rounded border border-[#2A365C]">Building: 173 kW</div>
            <div className="bg-[#1C2541] p-2 rounded border border-[#2A365C]">Heating: 135 kW</div>
            <div className="bg-[#1C2541] p-2 rounded border border-[#2A365C]">Labs: 46 kW</div>
            <div className="bg-[#1C2541] p-2 rounded border border-[#2A365C]">Utilities: 31 kW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
