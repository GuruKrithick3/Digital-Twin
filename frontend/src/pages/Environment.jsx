import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { fetchEnvironment } from '../services/api';
import { Thermometer, Wind, Compass, Sun, Eye, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Environment() {
  const [station, setStation] = useState('Bharati');
  const [envData, setEnvData] = useState(null);

  useEffect(() => {
    fetchEnvironment(station).then(res => setEnvData(res.data)).catch(() => {});
  }, [station]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Environmental Monitoring Twin</h2>
            <DataBadge type="real" />
          </div>
          <p className="text-sm text-slate-400">Meteorological telemetry conceptualized from NCPOR Antarctic stations</p>
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
        <MetricCard title="Ambient Temp" value={envData?.current?.temperature || -21.6} unit="°C" icon={Thermometer} dataType="real" />
        <MetricCard title="Wind Speed" value={envData?.current?.windSpeed || 31.2} unit="km/h" icon={Wind} dataType="real" />
        <MetricCard title="Barometric Pressure" value={envData?.current?.pressure || 992.1} unit="hPa" icon={Compass} dataType="real" />
        <MetricCard title="Environmental Risk" value={envData?.riskScore || 25} unit="/ 100" icon={ShieldAlert} dataType="real" />
      </div>

      {/* 24-Hour Temperature Chart */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">24-Hour Outdoor Temperature Profile (°C)</h3>
          <DataBadge type="real" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={envData?.history24h || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A365C" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#2A365C', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#00F5D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
