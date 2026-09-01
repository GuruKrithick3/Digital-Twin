const express = require('express');
const router = express.Router();
const { SENSORS } = require('../data/seedData');

// GET /api/sensors
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: SENSORS
  });
});

module.exports = router;