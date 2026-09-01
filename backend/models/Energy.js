const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
  station: { type: String, required: true },
  generationKw: { type: Number, required: true },
  consumptionKw: { type: Number, required: true },
  netEnergyKw: { type: Number, required: true },
  efficiencyPct: { type: Number, default: 88 },
  fuelConsumptionLph: { type: Number, required: true },
  fuelLevelLiters: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  isRealData: { type: Boolean, default: false }
});

module.exports = mongoose.model('Energy', energySchema);
