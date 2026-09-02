import React, { useState, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { runSimulation } from '../services/api';
import { Sliders, Play, Thermometer, Wind, Users, Fuel, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

const glassTooltipStyle = {
  background: 'rgba(10,10,14,0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#e2e8f0',
  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
};

export default function Simulation() {
  const [station, setStation] = useState('Bharati');
  const [temperature, setTemperature] = useState(-25);
  const [windSpeed, setWindSpeed] = useState(40);
  const [population, setPopulation] = useState(45);

  const stationMaxPopulation = station === 'Bharati' ? 72 : 65;
  const [fuelLevelLiters, setFuelLevelLiters] = useState(180000);
  const [energyDemandKw, setEnergyDemandKw] = useState(340);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await runSimulation({
        station,
        temperature: Number(temperature),
        windSpeed: Number(windSpeed),
        population: Number(population),
        fuelLevelLiters: Number(fuelLevelLiters),
        energyDemandKw: Number(energyDemandKw)
      });
      setSimResult(res.data.simulation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Derive a fuel depletion curve from the simulation output (linear drawdown to 0 at predictedCriticalDays)
  const fuelCurve = useMemo(() => {
    if (!simResult) return [];
    const days = simResult.outputs.predictedCriticalDays;
    const startLiters = Number(fuelLevelLiters);
    const points = Math.min(days, 30); // cap chart resolution
    const step = days / points;
    return Array.from({ length: points + 1 }, (_, i) => {
      const day = Math.round(i * step);
      const remaining = Math.max(0, startLiters * (1 - day / days));
      return { day, liters: Math.round(remaining) };
    });
  }, [simResult, fuelLevelLiters]);

  const tempSeverity = temperature <= -35 ? 'text-rose-400' : temperature <= -20 ? 'text-amber-300' : 'text-cyan-300';
  const windSeverity = windSpeed >= 70 ? 'text-rose-400' : windSpeed >= 40 ? 'text-amber-300' : 'text-cyan-300';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-heading">What-If Operational Scenario Simulator</h2>
        <p className="text-sm text-slate-400">Simulate extreme weather, population swings & fuel depletion timelines using the Digital Twin Causal Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Control Form */}
        <div className="rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 space-y-5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2 font-heading tracking-wide">
              <Sliders className="w-5 h-5 text-cyan-300" />
              <span>Simulation Parameters</span>
            </h3>
            <DataBadge type="simulated" />
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1.5 block tracking-wide">Station Select</label>
              <select
                value={station}
                onChange={(e) => {
                  const newStation = e.target.value;
                  setStation(newStation);
                  const max = newStation === 'Bharati' ? 72 : 65;
                  setPopulation((prev) => Math.min(prev, max));
                }}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-white text-sm
                           focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30
                           transition-colors appearance-none cursor-pointer"
              >
                <option value="Maitri" className="bg-[#0B0B0F]">Maitri Station</option>
                <option value="Bharati" className="bg-[#0B0B0F]">Bharati Station</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-slate-500" />
                  Outdoor Temp
                </span>
                <span className={`font-mono font-bold ${tempSeverity} transition-colors`}>{temperature}°C</span>
              </div>
              <input
                type="range"
                min="-50"
                max="-5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-400
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300
                           [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,245,212,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  Wind Speed
                </span>
                <span className={`font-mono font-bold ${windSeverity} transition-colors`}>{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-400
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300
                           [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,245,212,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Station Population
                </span>
                <span className="font-mono font-bold text-cyan-300">{population} Personnel</span>
              </div>
              <input
                type="range"
                min="10"
                max={stationMaxPopulation}
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-400
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300
                           [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,245,212,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" />
                  Current Fuel Reserve
                </span>
                <span className="font-mono font-bold text-amber-300">{Number(fuelLevelLiters).toLocaleString()} L</span>
              </div>
              <input
                type="number"
                value={fuelLevelLiters}
                onChange={(e) => setFuelLevelLiters(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-white font-mono text-sm
                           focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#3A86FF] to-[#00F5D4] text-[#0B0B0F] font-bold text-sm
                         font-heading tracking-wide hover:shadow-[0_0_25px_-5px_rgba(0,245,212,0.5)]
                         disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Simulating Physics & Causal Chain...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Digital Twin Simulation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 flex flex-col shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="font-bold text-white text-base font-heading tracking-wide">Digital Twin Simulation Results</h3>
            <DataBadge type="simulated" />
          </div>

          {simResult ? (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/[0.03] p-3.5 rounded-lg border border-white/10 border-l-2 border-l-cyan-400">
                  <p className="text-[11px] text-slate-400 tracking-wide">Heating Demand</p>
                  <p className="text-xl font-bold font-mono text-cyan-300 mt-1">+{simResult.outputs.heatingDemandChangePct}%</p>
                </div>
                <div className="bg-white/[0.03] p-3.5 rounded-lg border border-white/10 border-l-2 border-l-amber-400">
                  <p className="text-[11px] text-slate-400 tracking-wide">Fuel Consumption</p>
                  <p className="text-xl font-bold font-mono text-amber-300 mt-1">+{simResult.outputs.fuelConsumptionChangePct}%</p>
                </div>
                <div className="bg-white/[0.03] p-3.5 rounded-lg border border-white/10 border-l-2 border-l-rose-400">
                  <p className="text-[11px] text-slate-400 tracking-wide">Days to Critical Reserve</p>
                  <p className="text-xl font-bold font-mono text-rose-400 mt-1">{simResult.outputs.predictedCriticalDays} Days</p>
                </div>
                <div className="bg-white/[0.03] p-3.5 rounded-lg border border-white/10 border-l-2 border-l-emerald-400">
                  <p className="text-[11px] text-slate-400 tracking-wide">Outdoor Ops Risk</p>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{simResult.outputs.outdoorOpsRiskLevel}</p>
                </div>
              </div>

              {/* Fuel Depletion Timeline Chart */}
              <div className="bg-white/[0.03] p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2 font-heading tracking-wide">
                    <Fuel className="w-4 h-4 text-amber-300" />
                    <span>Fuel Depletion Timeline</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">PROJECTED · LITERS</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={fuelCurve} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => `Day ${d}`}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={glassTooltipStyle}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(v) => [`${Number(v).toLocaleString()} L`, 'Remaining']}
                      labelFormatter={(d) => `Day ${d}`}
                    />
                    <ReferenceLine
                      y={fuelLevelLiters * 0.15}
                      stroke="#f87171"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Critical (15%)', position: 'insideTopRight', fill: '#f87171', fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="liters"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      fill="url(#fuelGrad)"
                      animationDuration={900}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/[0.03] p-4 rounded-lg border border-white/10">
                <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2 font-heading tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>AI Operational Recommendations</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {simResult.outputs.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1 shadow-[0_0_6px_rgba(0,245,212,0.6)]"></span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-3 py-10">
              <Sliders className="w-8 h-8 text-slate-600" />
              <p className="text-center max-w-xs">Adjust simulation sliders on the left and run the Digital Twin Simulation to see predicted outcomes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}