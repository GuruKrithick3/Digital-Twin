const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  station: { type: String, required: true }, // "Maitri", "Bharati"
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['generator', 'heating', 'hvac', 'water_pump', 'fuel_system', 'communication', 'building', 'storage', 'chp'],
    required: true
  },
  status: { type: String, enum: ['normal', 'warning', 'critical', 'maintenance'], default: 'normal' },
  healthScore: { type: Number, default: 90 },
  temperature: { type: Number, default: 20 },
  vibration: { type: Number, default: 0.5 },
  runtimeHours: { type: Number, default: 1200 },
  powerOutputKw: { type: Number, default: 150 },
  fuelConsumptionLph: { type: Number, default: 45 },
  maintenanceDue: { type: Date },
  failureProbability: { type: Number, default: 0.05 },
  isRealData: { type: Boolean, default: false } // Data Integrity Flag
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
