const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  station: { type: String, required: true },
  itemCategory: {
    type: String,
    enum: ['fuel', 'food', 'water', 'medical', 'spare_parts', 'scientific', 'personnel'],
    required: true
  },
  itemKey: { type: String, required: true },
  itemName: { type: String, required: true },
  currentStock: { type: Number, required: true },
  capacity: { type: Number, required: true },
  unit: { type: String, required: true },
  dailyConsumption: { type: Number, required: true },
  reorderThreshold: { type: Number, required: true },
  isRealData: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
