import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import StationMaitri from './pages/StationMaitri';
import StationBharati from './pages/StationBharati';
import Energy from './pages/Energy';
import Logistics from './pages/Logistics';
import Environment from './pages/Environment';
import Maintenance from './pages/Maintenance';
import Simulation from './pages/Simulation';
import Assistant from './pages/Assistant';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col font-sans">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/station/maitri" element={<StationMaitri />} />
            <Route path="/station/bharati" element={<StationBharati />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
