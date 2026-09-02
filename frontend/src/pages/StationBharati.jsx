import React from 'react';
import Station3D from '../components/Station3D';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { Thermometer, Zap, Fuel, Droplet, Users, ShieldAlert } from 'lucide-react';

export default function StationBharati() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Bharati Station Digital Twin</h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              OPERATIONAL
            </span>
          </div>
          <p className="text-sm text-slate-400">69°24'24" S, 76°11'42" E • Larsemann Hills, East Antarctica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 shrink-0">
        <MetricCard title="Real Outdoor Temp" value="-21.6" unit="°C" icon={Thermometer} dataType="real" />
        <MetricCard title="Station Population" value="45" unit="Personnel" icon={Users} dataType="simulated" />
        <MetricCard title="Total Power Load" value="385" unit="kW" icon={Zap} dataType="simulated" />
        <MetricCard title="Fuel Reserve" value="210,000" unit="L (70%)" icon={Fuel} dataType="simulated" />
      </div>

      {/* 3D Scene View */}
      <div className="flex-1 min-h-0 mt-6">
        <Station3D stationName="Bharati" />
      </div>
    </div>
  );
}
