import React, { useState, useEffect, useCallback } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchObservationCurrent, fetchObservationSeries, fetchObservationStats } from '../services/api';
import { Thermometer, Wind, Droplets, Compass, Gauge, ShieldAlert, Database, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const glassTooltipStyle = {
  background: 'rgba(11, 19, 43, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#f8fafc',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
};

const RANGES = [
  { key: '24h', label: '24H' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'all', label: 'ALL' }
];

function formatAxisTime(iso, range) {
  if (!iso) return '';
  const d = new Date(iso);
  if (range === '24h' || range === '7d') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Environment() {
  const [station, setStation] = useState('Maitri');
  const [range, setRange] = useState('24h');
  const [current, setCurrent] = useState(null);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchObservationCurrent(station).then(r => {
        setCurrent(r.data.current);
        setCoverage(r.data.coverage);
        setFound(r.data.found);
        return r.data;
      }),
      fetchObservationSeries(station, range).then(r => r.data),
      fetchObservationStats(station).then(r => r.data.stats)
    ])
      .then(([, seriesRes, statsData]) => {
        setSeries(seriesRes.series || []);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [station, range]);

  useEffect(() => { load(); }, [load]);

  const chartData = series.map(p => ({
    ...p,
    timeLabel: formatAxisTime(p.time, range)
  }));

  const cur = current || {};

  const directionLabel = cur.windDirectionDeg != null
    ? `${cur.windDirection || ''} ${cur.windDirectionDeg}°`.trim()
    : 'N/A';

  const hasTemp = series.some(p => p.temperature !== null);
  const hasRh = series.some(p => p.humidity !== null);
  const hasWs = series.some(p => p.windSpeed !== null);
  const hasAp = series.some(p => p.pressure !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Environmental Monitoring Twin</h2>
            <DataBadge type={found && (hasTemp || hasWs || hasAp) ? 'real' : 'simulated'} />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Hourly meteorological observations from NCPOR stations (CSV, real data)
          </p>
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

      {/* Time range selector + coverage strip */}
      <div className="glass-panel rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/[0.08]">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-heading tracking-wider transition-all ${
                range === r.key ? 'bg-[#00F5D4] text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          {coverage ? (
            <>
              <span className="text-emerald-400 flex items-center gap-1">
                <Database className="w-3 h-3" /> {coverage.file}
              </span>
              <span>{coverage.recordCount.toLocaleString()} records</span>
              <span>
                {new Date(coverage.start).toLocaleDateString()} → {new Date(coverage.end).toLocaleDateString()}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Activity className="w-3 h-3" /> No real CSV loaded — showing simulated baseline
            </span>
          )}
        </div>
      </div>

      {/* Current metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Ambient Temp" value={loading ? '—' : (cur.temperature ?? 'N/A')} unit="°C" icon={Thermometer} dataType={found && cur.temperature != null ? 'real' : 'simulated'} />
        <MetricCard title="Relative Humidity" value={loading ? '—' : (cur.humidity ?? 'N/A')} unit="%" icon={Droplets} dataType={found && cur.humidity != null ? 'real' : 'simulated'} />
        <MetricCard title="Wind Speed" value={loading ? '—' : (cur.windSpeed ?? 'N/A')} unit="m/s" icon={Wind} dataType={found && cur.windSpeed != null ? 'real' : 'simulated'} />
        <MetricCard title="Wind Direction" value={loading ? '—' : directionLabel} unit="" icon={Compass} dataType={found && cur.windDirectionDeg != null ? 'real' : 'simulated'} />
        <MetricCard title="Barometric Pressure" value={loading ? '—' : (cur.pressure ?? 'N/A')} unit="hPa" icon={Gauge} dataType={found && cur.pressure != null ? 'real' : 'simulated'} />
        <MetricCard title="Environmental Risk" value={loading ? '—' : (cur.riskScore ?? 0)} unit="/ 100" icon={ShieldAlert} dataType={found && cur.temperature != null ? 'real' : 'simulated'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white font-heading tracking-wide text-base">Temperature & Relative Humidity (°C / %)</h3>
            <div className="flex items-center gap-1.5">
              <DataBadge type={found && hasTemp ? 'real' : 'simulated'} />
              {(!hasRh || !found) && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30">
                  RH: SIMULATED
                </span>
              )}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={glassTooltipStyle} labelStyle={{ color: '#94a3b8' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconType="dot" iconSize={8} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#00F5D4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00F5D4' }} connectNulls={false} />
                <Line type="monotone" dataKey="humidity" name="RH (%)" stroke="#3A86FF" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3A86FF' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white font-heading tracking-wide text-base">Wind Speed & Pressure (m/s / hPa)</h3>
            <div className="flex items-center gap-1.5">
              <DataBadge type={found && (hasWs || hasAp) ? 'real' : 'simulated'} />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={glassTooltipStyle} labelStyle={{ color: '#94a3b8' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconType="dot" iconSize={8} />
                <Line type="monotone" dataKey="windSpeed" name="Wind (m/s)" stroke="#FF9F45" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF9F45' }} connectNulls={false} />
                <Line type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#A78BFA" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#A78BFA' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistical analysis panel */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white font-heading tracking-wide text-base">Full-Range Statistical Analysis</h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <DataBadge type="real" />
            {coverage && (
              <span>{coverage.recordCount.toLocaleString()} readings · {new Date(coverage.start).toLocaleDateString()} → {new Date(coverage.end).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 font-mono tracking-wider text-[10px] uppercase border-b border-white/10">
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Latest</th>
                <th className="py-2 pr-4">Min</th>
                <th className="py-2 pr-4">Mean</th>
                <th className="py-2 pr-4">Max</th>
                <th className="py-2 pr-4">Std Dev</th>
                <th className="py-2 pr-4">Unit</th>
                <th className="py-2">Missing</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {Object.values(stats || {}).map(s => (
                <tr key={s.label} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="py-2.5 pr-4 font-medium text-white">{s.label}</td>
                  <td className="py-2.5 pr-4">{s.latest ?? 'N/A'}</td>
                  <td className="py-2.5 pr-4">{s.min ?? 'N/A'}</td>
                  <td className="py-2.5 pr-4">{s.avg ?? 'N/A'}</td>
                  <td className="py-2.5 pr-4">{s.max ?? 'N/A'}</td>
                  <td className="py-2.5 pr-4">{s.stdDev ?? 'N/A'}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{s.unit}</td>
                  <td className="py-2.5 text-amber-400/80">{s.missing > 0 ? `${s.missing} (-999)` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}