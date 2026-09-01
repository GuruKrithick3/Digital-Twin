const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // "Maitri", "Bharati"
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  capacity: { type: Number, required: true }, // Max personnel
  currentPopulation: { type: Number, default: 25 },
  fuelCapacity: { type: Number, required: true }, // Liters
  waterCapacity: { type: Number, required: true }, // Liters
  status: { type: String, enum: ['operational', 'warning', 'critical'], default: 'operational' },
  healthScore: { type: Number, default: 95 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Station', stationSchema);
