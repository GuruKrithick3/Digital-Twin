const express = require('express');
const router = express.Router();
const { runCausalSimulation } = require('../services/digitalTwin');
const { STATIONS, SIMULATION } = require('../data/seedData');

// POST /api/simulation/run
router.post('/run', (req, res) => {
  const { station, temperature, windSpeed, population, fuelLevelLiters, energyDemandKw } = req.body;

  const key = String(station || 'Bharati').toLowerCase();
  const stationConfig = STATIONS.find(s => s.key === key);

  const result = runCausalSimulation({
    station: stationConfig ? stationConfig.name : 'Bharati',
    temperature: typeof temperature === 'number' ? temperature : SIMULATION.defaultTempC,
    windSpeed: typeof windSpeed === 'number' ? windSpeed : SIMULATION.defaultWindSpeed,
    population: typeof population === 'number' ? population : stationConfig ? stationConfig.currentPopulation : SIMULATION.baselinePopulation,
    fuelLevelLiters: typeof fuelLevelLiters === 'number' ? fuelLevelLiters : SIMULATION.defaultFuelLevelLiters,
    fuelCapacity: stationConfig ? stationConfig.fuelCapacity : 300000,
    baseEnergyDemandKw: typeof energyDemandKw === 'number' ? energyDemandKw : SIMULATION.defaultEnergyDemandKw
  });

  res.json({
    success: true,
    simulation: result
  });
});

module.exports = router;