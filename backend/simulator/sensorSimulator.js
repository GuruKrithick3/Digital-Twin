/**
 * Sensor Telemetry Simulator
 * Builds live telemetry objects from the editable seed data file.
 * Environmental readings come from the REAL NCPOR observation CSVs
 * when available (backend/data/observations/*.csv), falling back to
 * the static seed baseline otherwise. Energy / inventory / assets
 * remain simulated.
 */

const { ENVIRONMENT, ENERGY, INVENTORY, ASSETS } = require('../data/seedData');
const { getLatestEnvironment } = require('../services/observationStore');

function getSeed(stationName) {
  const key = String(stationName || 'Bharati').toLowerCase();
  if (key === 'maitri') return 'maitri';
  if (key === 'bharati') return 'bharati';
  return String(stationName);
}

function generateStationTelemetry(stationName = 'Bharati') {
  const key = getSeed(stationName);
  const stationLabel = key === 'maitri' ? 'Maitri' : 'Bharati';

  // Real environmental reading from the observation CSVs (or null).
  const realEnv = getLatestEnvironment(key);

  let environment;
  if (realEnv) {
    environment = {
      ...realEnv,
      station: stationName,
      // radiation / visibility are not measured in the CSV; keep seed defaults.
      radiation: ENVIRONMENT[key] ? ENVIRONMENT[key].radiation : 135,
      visibility: ENVIRONMENT[key] ? ENVIRONMENT[key].visibility : 12,
      isRealData: true
    };
  } else {
    environment = {
      ...ENVIRONMENT[key],
      station: stationName,
      timestamp: new Date().toISOString(),
      isRealData: ENVIRONMENT[key] ? ENVIRONMENT[key].isRealData : true
    };
  }

  const energy = {
    ...ENERGY[key],
    station: stationName,
    timestamp: new Date().toISOString(),
    isRealData: ENERGY[key] ? ENERGY[key].isRealData : false
  };

  const inventory = (INVENTORY[key] || []).map(item => ({
    ...item,
    station: stationName
  }));

  const assets = (ASSETS[key] || []).map(asset => ({
    ...asset,
    station: stationName
  }));

  return { environment, energy, inventory, assets };
}

module.exports = { generateStationTelemetry };