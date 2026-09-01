const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');

// GET /api/assets?station=Bharati
router.get('/', (req, res) => {
  const stationParam = req.query.station || 'Bharati';
  const maitriTelemetry = generateStationTelemetry('Maitri');
  const bharatiTelemetry = generateStationTelemetry('Bharati');

  let allAssets = [...maitriTelemetry.assets, ...bharatiTelemetry.assets];
  if (req.query.station) {
    allAssets = allAssets.filter(a => a.station.toLowerCase() === stationParam.toLowerCase());
  }

  res.json({
    success: true,
    count: allAssets.length,
    data: allAssets
  });
});

// GET /api/assets/:id
router.get('/:id', (req, res) => {
  const maitriTelemetry = generateStationTelemetry('Maitri');
  const bharatiTelemetry = generateStationTelemetry('Bharati');
  const allAssets = [...maitriTelemetry.assets, ...bharatiTelemetry.assets];
  const asset = allAssets.find(a => a.assetId === req.params.id);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  res.json({ success: true, data: asset });
});

module.exports = router;
