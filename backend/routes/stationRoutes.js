const express = require('express');
const router = express.Router();
const { STATIONS } = require('../data/seedData');
const { generateStationTelemetry } = require('../simulator/sensorSimulator');

const stripKey = ({ key, ...station }) => ({ ...station, isRealData: false });

// GET /api/stations
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: STATIONS.map(stripKey)
  });
});

// GET /api/stations/:name
router.get('/:name', (req, res) => {
  const requested = req.params.name.toLowerCase();
  const station = STATIONS.find(s => s.key === requested);
  const stationName = station ? station.name : 'Bharati';
  const telemetry = generateStationTelemetry(stationName);

  res.json({
    success: true,
    station: station ? stripKey(station) : null,
    telemetry
  });
});

module.exports = router;