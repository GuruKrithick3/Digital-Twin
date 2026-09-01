/**
 * ============================================================
 *  SEED DATA — Antarctic Digital Twin Platform (Maitri & Bharati)
 * ============================================================
 *  ALL editable mock/static data lives in this single file.
 *  Edit values here and every API route / service picks them up.
 *
 *  Sections:
 *    STATIONS   -> station registry (also used by /api/stations)
 *    ENVIRONMENT-> environmental baseline per station (REAL DATA)
 *    ENERGY     -> generation/consumption/fuel baseline (SIMULATED)
 *    INVENTORY  -> logistics stock levels per station (SIMULATED)
 *    ASSETS     -> machinery / equipment per station (SIMULATED)
 *    SENSORS    -> raw sensor readings (SIMULATED)
 *    ALERTS     -> static alert feed (shown on dashboard)
 *    SIMULATION -> digital twin model parameters & thresholds
 * ============================================================
 */

const STATIONS = [
  {
    key: 'maitri',
    name: 'Maitri',
    location: { latitude: -70.7667, longitude: 11.7333 },
    capacity: 65,
    currentPopulation: 25,
    fuelCapacity: 250000,
    waterCapacity: 50000,
    status: 'warning',
    healthScore: 84
  },
  {
    key: 'bharati',
    name: 'Bharati',
    location: { latitude: -69.4068, longitude: 76.19525 },
    capacity: 72,
    currentPopulation: 45,
    fuelCapacity: 300000,
    waterCapacity: 70000,
    status: 'operational',
    healthScore: 94
  }
];

const ENVIRONMENT = {
  maitri: {
    temperature: -28.4,
    humidity: 68,
    pressure: 984.5,
    windSpeed: 42.5,
    windDirection: 'SSW',
    radiation: 135,
    visibility: 12,
    riskScore: 45,
    isRealData: true
  },
  bharati: {
    temperature: -21.6,
    humidity: 74,
    pressure: 992.1,
    windSpeed: 31.2,
    windDirection: 'ENE',
    radiation: 135,
    visibility: 12,
    riskScore: 25,
    isRealData: true
  }
};

const ENERGY = {
  maitri: {
    generationKw: 340,
    consumptionKw: 315,
    netEnergyKw: 25,
    efficiencyPct: 86.4,
    fuelConsumptionLph: 52.1,
    fuelLevelLiters: 145000,
    isRealData: false
  },
  bharati: {
    generationKw: 420,
    consumptionKw: 385,
    netEnergyKw: 35,
    efficiencyPct: 91.2,
    fuelConsumptionLph: 48.6,
    fuelLevelLiters: 210000,
    isRealData: false
  }
};

const INVENTORY = {
  maitri: [
    { itemCategory: 'fuel', itemKey: 'aviation_turbine_fuel', itemName: 'ATF (Aviation Turbine Fuel / ATF-50)', currentStock: 145000, capacity: 250000, unit: 'Liters', dailyConsumption: 1250, reorderThreshold: 60000, isRealData: false },
    { itemCategory: 'water', itemKey: 'potable_water', itemName: 'Potable Water', currentStock: 38000, capacity: 50000, unit: 'Liters', dailyConsumption: 1200, reorderThreshold: 15000, isRealData: false },
    { itemCategory: 'food', itemKey: 'ration_supplies', itemName: 'Freeze-Dried Rations & Provisions', currentStock: 180, capacity: 365, unit: 'Days of Supply', dailyConsumption: 1, reorderThreshold: 60, isRealData: false }
  ],
  bharati: [
    { itemCategory: 'fuel', itemKey: 'aviation_turbine_fuel', itemName: 'ATF (Aviation Turbine Fuel / ATF-50)', currentStock: 210000, capacity: 300000, unit: 'Liters', dailyConsumption: 1160, reorderThreshold: 60000, isRealData: false },
    { itemCategory: 'water', itemKey: 'potable_water', itemName: 'Potable Water', currentStock: 54000, capacity: 70000, unit: 'Liters', dailyConsumption: 1200, reorderThreshold: 15000, isRealData: false },
    { itemCategory: 'food', itemKey: 'ration_supplies', itemName: 'Freeze-Dried Rations & Provisions', currentStock: 180, capacity: 365, unit: 'Days of Supply', dailyConsumption: 1, reorderThreshold: 60, isRealData: false }
  ]
};

const ASSETS = {
  maitri: [
    { assetId: 'MAI-GEN-01', station: 'Maitri', name: 'Primary Diesel Generator 1', type: 'generator', status: 'normal', healthScore: 92, temperature: 78.5, vibration: 0.62, runtimeHours: 3420, powerOutputKw: 180, fuelConsumptionLph: 24.5, failureProbability: 0.08, isRealData: false },
    { assetId: 'MAI-HVAC-01', station: 'Maitri', name: 'Main Station HVAC & Air Handler', type: 'hvac', status: 'normal', healthScore: 88, temperature: 21.0, vibration: 0.35, runtimeHours: 8900, powerOutputKw: 65, failureProbability: 0.12, isRealData: false },
    { assetId: 'MAI-PUMP-01', station: 'Maitri', name: 'Lake Priyadarshini Water Pump', type: 'water_pump', status: 'warning', healthScore: 74, temperature: 42.0, vibration: 1.45, runtimeHours: 5120, powerOutputKw: 30, failureProbability: 0.38, isRealData: false }
  ],
  bharati: [
    { assetId: 'BHA-GEN-01', station: 'Bharati', name: 'Main CHP Generator A', type: 'generator', status: 'normal', healthScore: 92, temperature: 78.5, vibration: 0.62, runtimeHours: 3420, powerOutputKw: 180, fuelConsumptionLph: 24.5, failureProbability: 0.08, isRealData: false },
    { assetId: 'BHA-HVAC-01', station: 'Bharati', name: 'Main Station HVAC & Air Handler', type: 'hvac', status: 'normal', healthScore: 88, temperature: 21.0, vibration: 0.35, runtimeHours: 8900, powerOutputKw: 65, failureProbability: 0.12, isRealData: false },
    { assetId: 'BHA-PUMP-01', station: 'Bharati', name: 'Seawater Desalination Pump', type: 'water_pump', status: 'normal', healthScore: 95, temperature: 26.5, vibration: 0.42, runtimeHours: 5120, powerOutputKw: 30, failureProbability: 0.04, isRealData: false }
  ]
};

const SENSORS = [
  { station: 'Bharati', assetId: 'BHA-GEN-01', sensorType: 'vibration', value: 0.62, unit: 'mm/s', isRealData: false },
  { station: 'Bharati', assetId: 'BHA-GEN-01', sensorType: 'temperature', value: 78.5, unit: '°C', isRealData: false },
  { station: 'Maitri', assetId: 'MAI-PUMP-01', sensorType: 'temperature', value: 42.0, unit: '°C', isRealData: false },
  { station: 'Maitri', assetId: 'MAI-PUMP-01', sensorType: 'vibration', value: 1.45, unit: 'mm/s', isRealData: false }
];

const ALERTS = [
  {
    id: 'ALT-101',
    station: 'Maitri',
    severity: 'YELLOW',
    title: 'Lake Water Pump Vibration Above Baseline',
    message: 'Lake Priyadarshini water pump vibration measured at 1.45 mm/s (threshold 1.2 mm/s)',
    sourceModule: 'maintenance',
    active: true
  },
  {
    id: 'ALT-102',
    station: 'Bharati',
    severity: 'BLUE',
    title: 'CHP Thermal Loop Optimized',
    message: 'Combined Heat & Power loop output operating at 91.2% thermal efficiency',
    sourceModule: 'energy',
    active: true
  }
];

/**
 * Digital twin & alert model parameters.
 * Edit thresholds / baseline assumptions used by services.
 */
const SIMULATION = {
  baselineAmbientTempC: -15,       // reference temperature for heating-delay model
  baselinePopulation: 40,          // population reference for energy load factor
  baseFuelLph: 45,                 // baseline fuel burn rate (L/h)
  fuelPerKwh: 0.28,                // liters of fuel per kWh of energy output
  criticalFuelReservePct: 0.20,    // % of fuel capacity treated as "critical threshold"
  minEnergyDemandKw: 150,          // floor for modeled energy demand
  defaultTempC: -22,               // fallback ambient temperature
  defaultWindSpeed: 35,            // fallback wind speed
  defaultFuelLevelLiters: 180000,  // fallback fuel level
  defaultEnergyDemandKw: 320,      // fallback base energy demand
  historyHours: 24
};

const ALERT_RULES = {
  fuelCriticalPct: 25,      // emit RED when fuel % drops below this
  fuelWarningPct: 40,       // emit YELLOW when fuel % below this (above critical)
  extremeLowTempC: -30,     // emit YELLOW when ambient temp below this
  resupplyWindowText: 'Next Antarctic Summer Voyage (Nov 2026 - Jan 2027)'
};

const PREDICTION_RULES = {
  highTempC: 65,            // asset temperature considered elevated
  highVibration: 1.2,       // vibration (mm/s) considered elevated
  highRuntimeHours: 3000,   // runtime considered elevated
  baseProbability: 0.05,
  tempProbabilityBump: 0.3,
  vibrationProbabilityBump: 0.35,
  runtimeProbabilityBump: 0.2,
  highBucketThreshold: 0.6,
  mediumBucketThreshold: 0.3,
  probabilityCeiling: 0.99
};

module.exports = {
  STATIONS,
  ENVIRONMENT,
  ENERGY,
  INVENTORY,
  ASSETS,
  SENSORS,
  ALERTS,
  SIMULATION,
  ALERT_RULES,
  PREDICTION_RULES
};