const express = require('express');
const router = express.Router();
const { ALERTS } = require('../data/seedData');

// GET /api/alerts
router.get('/', (req, res) => {
  res.json({
    success: true,
    alerts: ALERTS.map(alert => ({
      ...alert,
      timestamp: new Date().toISOString()
    }))
  });
});

module.exports = router;