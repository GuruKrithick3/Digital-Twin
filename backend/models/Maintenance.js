const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  assetId: { type: String, required: true },
  station: { type: String, required: true },
  failureProbabilityBucket: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  failureProbabilityValue: { type: Number, required: true },
  contributingReasons: [{ type: String }],
  recommendedAction: { type: String, required: true },
  timeWindow: { type: String, required: true }, // e.g. "Within 48 hours"
  timestamp: { type: Date, default: Date.now },
  isRealData: { type: Boolean, default: false }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
