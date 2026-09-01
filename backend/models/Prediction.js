const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  station: { type: String, required: true },
  type: { type: String, required: true }, // "energy_demand", "fuel_depletion", "asset_failure"
  inputParams: { type: Object, required: true },
  predictionOutput: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
