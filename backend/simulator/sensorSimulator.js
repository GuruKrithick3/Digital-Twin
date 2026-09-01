/**
 * Sensor Telemetry Simulator
 * Builds live telemetry objects from the editable seed data file.
 * All values originate from ../../data/seedData — edit data there.
 */

const { ENVIRONMENT, ENERGY, INVENTORY, ASSETS } = require('../data/seedData');

function getSeed(stationName) {
  const key = String(stationName || 'Bharati').toLowerCase();
  if (key === 'maitri') return 'maitri';
  if (key === 'bharati') return 'bharati';
  return String(stationName);
}

function generateStationTelemetry(stationName = 'Bharati') {
  const key = getSeed(stationName);
  const stationLabel = key === 'maitri' ? 'Maitri' : 'Bharati';

  const environment = {
    ...ENVIRONMENT[key],
    station: stationName,
    timestamp: new Date().toISOString(),
    isRealData: ENVIRONMENT[key] ? ENVIRONMENT[key].isRealData : true
  };

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