const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  station: { type: String, required: true },
  inputParams: {
    temperature: Number,
    windSpeed: Number,
    population: Number,
    fuelLevelLiters: Number,
    energyDemandKw: Number
  },
  results: {
    heatingDemandChangePct: Number,
    energyConsumptionChangePct: Number,
    fuelConsumptionChangePct: Number,
    outdoorOpsRiskLevel: String, // "LOW", "MODERATE", "HIGH", "CRITICAL"
    projectedFuelRemainingPct: Number,
    predictedCriticalDays: Number,
    recommendedActions: [String]
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Simulation', simulationSchema);
