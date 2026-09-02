import React from 'react';
import Station3D from '../components/Station3D';
import MetricCard from '../components/MetricCard';
import DataBadge from '../components/DataBadge';
import { Thermometer, Zap, Fuel, Droplet, Users, ShieldAlert } from 'lucide-react';

export default function StationMaitri() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Maitri Station Digital Twin</h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              WARNING STATUS
            </span>
          </div>
          <p className="text-sm text-slate-400">70°45'57" S, 11°44'00" E • Schirmacher Oasis, Queen Maud Land</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 shrink-0">
        <MetricCard title="Real Outdoor Temp" value="-28.4" unit="°C" icon={Thermometer} dataType="real" />
        <MetricCard title="Station Population" value="25" unit="Personnel" icon={Users} dataType="simulated" />
        <MetricCard title="Total Power Load" value="315" unit="kW" icon={Zap} dataType="simulated" />
        <MetricCard title="Fuel Reserve" value="145,000" unit="L (58%)" icon={Fuel} dataType="simulated" />
      </div>

      {/* 3D Scene View */}
      <div className="flex-1 min-h-0 mt-6">
        <Station3D stationName="Maitri" />
      </div>
    </div>
  );
}
