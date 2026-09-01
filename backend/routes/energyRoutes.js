const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');
const { SIMULATION } = require('../data/seedData');

// GET /api/energy?station=Bharati
router.get('/', (req, res) => {
  const stationName = req.query.station || 'Bharati';
  const telemetry = generateStationTelemetry(stationName);

  // 24h trend
  const hours = Array.from({ length: SIMULATION.historyHours }, (_, i) => {
    const h = i < 10 ? `0${i}:00` : `${i}:00`;
    const gen = Math.round(telemetry.energy.generationKw + (Math.sin(i / 3) * 20));
    const con = Math.round(telemetry.energy.consumptionKw + (Math.cos(i / 3) * 18));
    return { time: h, generationKw: gen, consumptionKw: con, fuelLph: Number((gen * SIMULATION.fuelPerKwh).toFixed(1)) };
  });

  res.json({
    success: true,
    station: stationName,
    current: telemetry.energy,
    history24h: hours,
    energyFlow: {
      generationKw: telemetry.energy.generationKw,
      distribution: [
        { name: 'Building Load', kw: Math.round(telemetry.energy.consumptionKw * 0.45) },
        { name: 'Heating Systems', kw: Math.round(telemetry.energy.consumptionKw * 0.35) },
        { name: 'Laboratory Equipment', kw: Math.round(telemetry.energy.consumptionKw * 0.12) },
        { name: 'Station Utilities', kw: Math.round(telemetry.energy.consumptionKw * 0.08) }
      ]
    }
  });
});

module.exports = router;