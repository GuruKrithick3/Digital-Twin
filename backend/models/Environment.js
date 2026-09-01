const mongoose = require('mongoose');

const environmentSchema = new mongoose.Schema({
  station: { type: String, required: true },
  temperature: { type: Number, required: true }, // Celsius
  humidity: { type: Number, required: true }, // %
  pressure: { type: Number, required: true }, // hPa
  windSpeed: { type: Number, required: true }, // km/h
  windDirection: { type: String, default: 'SSW' },
  radiation: { type: Number, default: 120 }, // W/m2
  visibility: { type: Number, default: 10 }, // km
  riskScore: { type: Number, default: 20 }, // 0 - 100 risk
  timestamp: { type: Date, default: Date.now },
  isRealData: { type: Boolean, default: true } // Environmental data labeled "REAL DATA" (conceptually NCPOR)
});

module.exports = mongoose.model('Environment', environmentSchema);
