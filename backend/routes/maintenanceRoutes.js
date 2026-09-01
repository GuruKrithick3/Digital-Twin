const express = require('express');
const router = express.Router();
const { predictAssetFailure } = require('../services/prediction');
const { generateStationTelemetry } = require('../simulator/sensorSimulator');

// GET /api/maintenance
router.get('/', async (req, res) => {
  const stationName = req.query.station || 'Bharati';
  const telemetry = generateStationTelemetry(stationName);

  const predictions = await Promise.all(
    telemetry.assets.map(async (asset) => {
      const pred = await predictAssetFailure(asset);
      return {
        asset,
        prediction: pred
      };
    })
  );

  res.json({
    success: true,
    station: stationName,
    count: predictions.length,
    data: predictions
  });
});

module.exports = router;
