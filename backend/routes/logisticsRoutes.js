const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');
const { ALERT_RULES } = require('../data/seedData');

// GET /api/logistics?station=Bharati
router.get('/', (req, res) => {
  const stationName = req.query.station || 'Bharati';
  const telemetry = generateStationTelemetry(stationName);

  const inventoryWithDays = telemetry.inventory.map(item => {
    const daysRemaining = Math.floor(item.currentStock / item.dailyConsumption);
    const criticalThresholdDays = Math.floor(item.reorderThreshold / item.dailyConsumption);
    let riskRating = 'LOW';
    if (daysRemaining < criticalThresholdDays) riskRating = 'HIGH';
    else if (daysRemaining < criticalThresholdDays * 1.5) riskRating = 'MODERATE';

    return {
      ...item,
      daysRemaining,
      riskRating,
      predictedDepletionDate: new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0]
    };
  });

  res.json({
    success: true,
    station: stationName,
    inventory: inventoryWithDays,
    resupplyRecommendation: {
      recommendedWindow: ALERT_RULES.resupplyWindowText,
      urgency: inventoryWithDays.some(i => i.riskRating === 'HIGH') ? 'HIGH' : 'MODERATE',
      itemsRequired: inventoryWithDays.map(item => ({
        itemName: item.itemName,
        requiredQty: Math.max(0, item.capacity - item.currentStock),
        unit: item.unit
      }))
    }
  });
});

module.exports = router;