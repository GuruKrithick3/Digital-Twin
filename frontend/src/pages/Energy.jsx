import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchEnergy } from '../services/api';
import { Zap, Fuel, Activity, ArrowRight, Gauge } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const glassTooltipStyle = {
  background: 'rgba(11, 19, 43, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#f8fafc',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
};

export default function Energy() {
  const [station, setStation] = useState('Bharati');
  const [energyData, setEnergyData] = useState(null);

  useEffect(() => {
    fetchEnergy(station).then(res => setEnergyData(res.data)).catch(() => {});
  }, [station]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Energy Management & Generation Twin</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Power generation, consumption, CHP thermal loops & fuel efficiency tracking</p>
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
            <h3 className="font-bold text-white font-heading tracking-wide text-base">Generation vs Consumption Trend (24 Hours)</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time load balancing and power stability envelope</p>
          </div>
          <DataBadge type="simulated" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyData?.history24h || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3A86FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={glassTooltipStyle} labelStyle={{ color: '#94a3b8' }} />
              <Area type="monotone" dataKey="generationKw" name="Generation (kW)" stroke="#00F5D4" strokeWidth={2} fillOpacity={1} fill="url(#colorGen)" />
              <Area type="monotone" dataKey="consumptionKw" name="Consumption (kW)" stroke="#3A86FF" strokeWidth={2} fillOpacity={1} fill="url(#colorCon)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Flow Visualization */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white font-heading tracking-wide text-base">Station Microgrid Energy Flow Pipeline</h3>
          <DataBadge type="simulated" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/40 border border-white/[0.06]">
          <div className="text-center p-3.5 rounded-lg bg-slate-900/80 border border-cyan-500/30">
            <p className="text-xs text-slate-400 font-heading font-semibold uppercase tracking-wider">Generators / CHP</p>
            <p className="text-lg font-bold font-mono text-cyan-300 mt-1">{energyData?.current?.generationKw || 420} kW</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="text-center p-3.5 rounded-lg bg-slate-900/80 border border-blue-500/30">
            <p className="text-xs text-slate-400 font-heading font-semibold uppercase tracking-wider">Distribution Switchgear</p>
            <p className="text-lg font-bold font-mono text-blue-300 mt-1">100% Nominal</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/[0.08] text-slate-200">Building: 173 kW</div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/[0.08] text-slate-200">Heating: 135 kW</div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/[0.08] text-slate-200">Labs: 46 kW</div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/[0.08] text-slate-200">Utilities: 31 kW</div>
          </div>
        </div>
      </div>
    </div>
  );
}

