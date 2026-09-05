const express = require('express');
const router = express.Router();
const {
  getLatestEnvironment,
  seriesForRange,
  statsForStation,
  getCoverage
} = require('../services/observationStore');
const { STATIONS } = require('../data/seedData');

function resolveStation(stationQuery) {
  const key = String(stationQuery || 'maitri').toLowerCase();
  const station = STATIONS.find(s => s.key === key);
  return station ? station.key : 'maitri';
}

// GET /api/observations/current?station=maitri
router.get('/current', (req, res) => {
  const key = resolveStation(req.query.station);
  const latest = getLatestEnvironment(key);
  const coverage = getCoverage(key);

  res.json({
    success: true,
    station: key,
    current: latest,
    coverage,
    found: Boolean(latest)
  });
});

// GET /api/observations/series?station=maitri&range=24h|7d|30d|all
router.get('/series', (req, res) => {
  const key = resolveStation(req.query.station);
  const range = String(req.query.range || '24h');
  const allowed = ['24h', '7d', '30d', 'all'];
  const useRange = allowed.includes(range) ? range : '24h';

  const { resolution, points } = seriesForRange(key, useRange);

  res.json({
    success: true,
    station: key,
    range: useRange,
    resolution,
    count: points.length,
    series: points,
    coverage: getCoverage(key)
  });
});

// GET /api/observations/stats?station=maitri
router.get('/stats', (req, res) => {
  const key = resolveStation(req.query.station);
  const result = statsForStation(key);

  if (!result) {
    return res.json({ success: true, station: key, found: false, stats: {}, coverage: null });
  }

  res.json({
    success: true,
    station: key,
    found: true,
    ...result
  });
});

module.exports = router;