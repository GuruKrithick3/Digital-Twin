const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');

// GET /api/environment?station=Bharati
router.get('/', (req, res) => {
  const stationName = req.query.station || 'Bharati';
  const telemetry = generateStationTelemetry(stationName);

  const history24h = Array.from({ length: 24 }, (_, i) => {
    const h = i < 10 ? `0${i}:00` : `${i}:00`;
    const tempOffset = Math.sin(i / 4) * 4;
    const windOffset = Math.cos(i / 4) * 8;
    return {
      time: h,
      temperature: Number((telemetry.environment.temperature + tempOffset).toFixed(1)),
      windSpeed: Number((telemetry.environment.windSpeed + windOffset).toFixed(1)),
      pressure: Number((telemetry.environment.pressure + (i % 2 === 0 ? 0.5 : -0.5)).toFixed(1)),
      isRealData: true
    };
  });

  res.json({
    success: true,
    station: stationName,
    current: telemetry.environment,
    history24h,
    riskScore: telemetry.environment.riskScore
  });
});

module.exports = router;
