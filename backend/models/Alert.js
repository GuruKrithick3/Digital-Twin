const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  station: { type: String, required: true },
  severity: { type: String, enum: ['GREEN', 'YELLOW', 'RED', 'BLUE'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  sourceModule: {
    type: String,
    enum: ['energy', 'fuel', 'inventory', 'environment', 'maintenance', 'system'],
    required: true
  },
  active: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
