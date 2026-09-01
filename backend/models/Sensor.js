const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  station: { type: String, required: true },
  assetId: { type: String, required: true },
  sensorType: { type: String, required: true }, // "temperature", "vibration", "pressure", "flow", "power"
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRealData: { type: Boolean, default: false } // Clearly tag SIMULATED vs REAL DATA
});

module.exports = mongoose.model('Sensor', sensorSchema);
