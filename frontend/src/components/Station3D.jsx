import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html, Billboard } from '@react-three/drei';
import DataBadge from './DataBadge';
import { X, ShieldAlert, Cpu } from 'lucide-react';

function BuildingBox({ position, args, color, name, onClick, isSelected }) {
  return (
    <group position={position}>
      <mesh onClick={onClick}>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={isSelected ? '#00F5D4' : color}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      <Billboard position={[0, args[1] / 2 + 0.6, 0]}>
        <Text
          fontSize={0.4}
          color="#E0FBFC"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

export default function Station3D({ stationName = 'Bharati', className = '' }) {
  const isMaitri = stationName.toLowerCase() === 'maitri';
  const [selectedComponent, setSelectedComponent] = useState(null);

  const components = isMaitri
    ? [
        { id: 'main', name: 'Main Building', pos: [0, 1, 0], args: [4, 2, 6], color: '#3A86FF', temp: '21.5°C', status: 'Normal', health: 92, power: '120 kW' },
        { id: 'fuel_farm', name: 'Fuel Farm', pos: [-5, 0.75, 2], args: [3, 1.5, 3], color: '#F59E0B', temp: '-12.0°C', status: 'Normal', health: 88, power: '0 kW' },
        { id: 'fuel_station', name: 'Fuel Station', pos: [-5, 0.75, -3], args: [2.5, 1.5, 2], color: '#EF4444', temp: '-8.5°C', status: 'Warning', health: 76, power: '15 kW' },
        { id: 'water_pump', name: 'Lake Water Pump House', pos: [5, 0.75, 3], args: [2, 1.5, 2], color: '#3B82F6', temp: '42.0°C', status: 'Warning', health: 74, power: '30 kW' },
        { id: 'summer_camp', name: 'Summer Camp', pos: [5, 0.75, -3], args: [3, 1.5, 2.5], color: '#10B981', temp: '19.0°C', status: 'Normal', health: 95, power: '45 kW' },
        { id: 'containers', name: 'Containerized Modules', pos: [0, 0.5, -6], args: [6, 1, 2], color: '#6366F1', temp: '18.5°C', status: 'Normal', health: 90, power: '20 kW' }
      ]
    : [
        { id: 'main', name: 'Main Building', pos: [0, 1.2, 0], args: [5, 2.4, 7], color: '#3A86FF', temp: '22.0°C', status: 'Normal', health: 96, power: '180 kW' },
        { id: 'fuel_farm', name: 'Fuel Farm', pos: [-6, 0.75, 2], args: [3.5, 1.5, 3.5], color: '#F59E0B', temp: '-10.0°C', status: 'Normal', health: 94, power: '0 kW' },
        { id: 'fuel_station', name: 'Fuel Station', pos: [-6, 0.75, -3], args: [2.5, 1.5, 2], color: '#10B981', temp: '-5.0°C', status: 'Normal', health: 92, power: '12 kW' },
        { id: 'seawater_pump', name: 'Seawater Pump House', pos: [6, 0.75, 3], args: [2.5, 1.5, 2.5], color: '#3B82F6', temp: '26.5°C', status: 'Normal', health: 95, power: '40 kW' },
        { id: 'summer_camp', name: 'Summer Camp', pos: [6, 0.75, -3], args: [3.5, 1.5, 2.5], color: '#10B981', temp: '20.0°C', status: 'Normal', health: 98, power: '50 kW' },
        { id: 'chp_power', name: 'Power / CHP Area', pos: [0, 1, 6], args: [4, 2, 3], color: '#00F5D4', temp: '78.5°C', status: 'Normal', health: 91, power: '210 kW' },
        { id: 'containers', name: 'Containerized Modules', pos: [0, 0.5, -6], args: [7, 1, 2], color: '#6366F1', temp: '19.5°C', status: 'Normal', health: 95, power: '25 kW' }
      ];

  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-xl overflow-hidden glass-panel border border-[#2A365C] ${className}`}>
      {/* Top Banner overlay */}
      <div className="absolute top-4 left-4 z-10 bg-[#0B132B]/90 backdrop-blur-md px-4 py-2 rounded-lg border border-[#2A365C] flex items-center space-x-3">
        <Cpu className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="font-bold text-sm text-white">{stationName} 3D Digital Twin</h3>
          <p className="text-[11px] text-slate-400">Click any component to inspect telemetry</p>
        </div>
        <DataBadge type="simulated" />
      </div>

      <Canvas camera={{ position: [12, 10, 14], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Ice / Snow Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#0E1A38" roughness={0.9} />
        </mesh>
        <gridHelper args={[40, 20, '#3A86FF', '#1C2541']} position={[0, 0.01, 0]} />

        {/* Station Components */}
        {components.map((comp) => (
          <BuildingBox
            key={comp.id}
            position={comp.pos}
            args={comp.args}
            color={comp.color}
            name={comp.name}
            isSelected={selectedComponent?.id === comp.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(comp);
            }}
          />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} minDistance={8} maxDistance={35} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>

      {/* Component Detail Drawer */}
      {selectedComponent && (
        <div className="absolute bottom-4 right-4 z-20 w-80 bg-[#0B132B]/95 backdrop-blur-md p-4 rounded-xl border border-[#3A86FF] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#2A365C] pb-2 mb-3">
            <h4 className="font-bold text-white text-base">{selectedComponent.name}</h4>
            <button
              onClick={() => setSelectedComponent(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`font-semibold ${selectedComponent.status === 'Normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedComponent.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Health Score</span>
              <span className="font-mono text-cyan-300 font-bold">{selectedComponent.health}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Operating Temp</span>
              <span className="font-mono text-white">{selectedComponent.temp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Power Output</span>
              <span className="font-mono text-white">{selectedComponent.power}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#2A365C] flex justify-between items-center text-[10px] text-slate-400">
            <span>Telemetry Status: LIVE</span>
            <DataBadge type="simulated" />
          </div>
        </div>
      )}
    </div>
  );
}
