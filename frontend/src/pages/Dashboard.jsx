  import React, { useState, useEffect, useMemo } from 'react';
  import StationCard from '../components/StationCard';
  import MetricCard from '../components/MetricCard';
  import AlertCard from '../components/AlertCard';
  import { fetchStations, fetchAlerts } from '../services/api';
  import { Thermometer, Zap, Fuel, Droplet, Activity, ShieldAlert } from 'lucide-react';
  import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
  } from 'recharts';

  // Mock time-series generator (swap with live telemetry feed later)
  function useTelemetrySeries() {
    return useMemo(() => {
      const hours = Array.from({ length: 12 }, (_, i) => `${(i * 2).toString().padStart(2, '0')}:00`);
      return hours.map((t, i) => ({
        time: t,
        maitri: -30 + Math.sin(i / 2) * 3 + Math.random() * 1.2,
        bharati: -23 + Math.cos(i / 2) * 2.5 + Math.random() * 1.2,
        power: 620 + Math.sin(i / 1.5) * 60 + Math.random() * 20,
      }));
    }, []);
  }

  const glassTooltipStyle = {
    background: 'rgba(10,10,14,0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#e2e8f0',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
  };

  function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
  }

  function MetricCardSkeleton() {
    return (
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-end justify-between mt-1">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    );
  }

  function StationCardSkeleton() {
    return (
      <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/[0.04] p-3 rounded-lg border border-white/10">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl mt-5" />
      </div>
    );
  }

  function ChartSkeleton() {
    return (
      <div className="rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
    );
  }

  function AlertSkeleton() {
    return (
      <div className="p-3.5 rounded-lg border border-white/10">
        <div className="flex items-start space-x-3">
          <Skeleton className="w-5 h-5 rounded-md shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  export default function Dashboard() {
    const [stations, setStations] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const telemetry = useTelemetrySeries();

    useEffect(() => {
      Promise.all([
        fetchStations().then(res => setStations(res.data.data)),
        fetchAlerts().then(res => setAlerts(res.data.alerts)),
      ])
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Antarctic Central Command Dashboard</h2>
            <p className="text-sm text-slate-400">Real-time status overview for Maitri & Bharati Antarctic Research Stations</p>
          </div>
        </div>

        {/* Overview Metrics Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)
            : (
              <>
                <MetricCard title="Maitri Real Temp" value="-28.4" unit="°C" icon={Thermometer} dataType="real" />
                <MetricCard title="Bharati Real Temp" value="-21.6" unit="°C" icon={Thermometer} dataType="real" />
                <MetricCard title="Total Power Load" value="700" unit="kW" icon={Zap} dataType="simulated" />
                <MetricCard title="Combined Fuel Reserves" value="355,000" unit="L" icon={Fuel} dataType="simulated" />
              </>
            )}
        </div>

        {/* Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? [...Array(2)].map((_, i) => <StationCardSkeleton key={i} />)
            : (
              <>
                <StationCard
                  name="Maitri"
                  status="warning"
                  temp="-28.4"
                  fuelPct={58}
                  waterPct={76}
                  healthScore={84}
                  activeAlertsCount={1}
                />
                <StationCard
                  name="Bharati"
                  status="operational"
                  temp="-21.6"
                  fuelPct={70}
                  waterPct={77}
                  healthScore={94}
                  activeAlertsCount={1}
                />
              </>
            )}
        </div>

        {/* Telemetry Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <div className="lg:col-span-2"><ChartSkeleton /></div>
              <ChartSkeleton />
            </>
          ) : (
            <>
          {/* Temperature Trend */}
          <div className="lg:col-span-2 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-300" />
                Station Temperature Trend
              </h3>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">LAST 24H · °C</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={telemetry} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="maitriGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F5D4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#00F5D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bharatiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3A86FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3A86FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={glassTooltipStyle} labelStyle={{ color: '#94a3b8' }} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="maitri"
                  name="Maitri"
                  stroke="#00F5D4"
                  strokeWidth={2}
                  fill="url(#maitriGrad)"
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="bharati"
                  name="Bharati"
                  stroke="#3A86FF"
                  strokeWidth={2}
                  fill="url(#bharatiGrad)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Power Load */}
          <div className="rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-300" />
                Power Load
              </h3>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">kW</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={telemetry} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={glassTooltipStyle} labelStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="power"
                  name="Load"
                  stroke="#00F5D4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#00F5D4', stroke: '#0B132B', strokeWidth: 2 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
            </>
          )}
        </div>

        {/* Active Alerts List */}
        <div className="rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-cyan-300" />
              <span>Active Station Operational Alerts</span>
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              LIVE SOCKET FEED
            </span>
          </div>
          <div className="space-y-3">
            {alerts.map(a => (
              <AlertCard key={a.id} alert={a} />
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-slate-500 italic">No active alerts.</p>
            )}
          </div>
        </div>
      </div>
    );
  }