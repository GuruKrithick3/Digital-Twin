const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');
const { seriesForRange } = require('../services/observationStore');
const { STATIONS } = require('../data/seedData');

function resolveStation(stationName) {
  const s = String(stationName || 'Bharati').toLowerCase();
  const station = STATIONS.find(x => x.key === s);
  return station ? station.key : 'bharati';
}

// GET /api/environment?station=Bharati&range=24h|7d|30d|all
router.get('/', (req, res) => {
  const stationName = req.query.station || 'Bharati';
  const key = resolveStation(stationName);
  const telemetry = generateStationTelemetry(stationName);

  const range = String(req.query.range || '24h');
  const allowed = ['24h', '7d', '30d', 'all'];
  const useRange = allowed.includes(range) ? range : '24h';

  // Real observation series (falls back to empty if CSV missing)
  const { resolution, points, metricRealStatus } = seriesForRange(key, useRange);

  const history = points && points.length
    ? points.map(p => ({
        ...p,
        isRealTempr: p.temperature !== null,
        isRealAp: p.pressure !== null,
        isRealWs: p.windSpeed !== null,
        isRealRh: p.humidity !== null,
        isRealWd: p.windDirection !== null,
        isRealData: true
      }))
    : Array.from({ length: 24 }, (_, i) => {
        const h = i < 10 ? `0${i}:00` : `${i}:00`;
        return {
          time: h,
          temperature: Number((telemetry.environment.temperature + Math.sin(i / 4) * 4).toFixed(1)),
          windSpeed: Number((telemetry.environment.windSpeed + Math.cos(i / 4) * 8).toFixed(1)),
          pressure: Number((telemetry.environment.pressure + (i % 2 === 0 ? 0.5 : -0.5)).toFixed(1)),
          humidity: 65,
          windDirection: 180,
          isRealTempr: false,
          isRealAp: false,
          isRealWs: false,
          isRealRh: false,
          isRealWd: false,
          isRealData: false
        };
      });

  res.json({
    success: true,
    station: stationName,
    current: telemetry.environment,
    history,
    resolution,
    isRealData: Boolean(points && points.length),
    metricRealStatus: metricRealStatus || {
      temperature: false,
      pressure: false,
      windSpeed: false,
      humidity: false,
      windDirection: false
    },
    riskScore: telemetry.environment.riskScore
  });
});

module.exports = router;
