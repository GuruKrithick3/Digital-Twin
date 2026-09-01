/**
 * Core Digital Twin Engine Service
 * Implements causal physics & operational relationships between environment, heating, energy,
 * generator load, fuel reserves, and logistics timelines.
 * All model parameters come from the editable seed data file.
 */

const { SIMULATION } = require('../data/seedData');

function runCausalSimulation({
  station = 'Bharati',
  temperature = SIMULATION.defaultTempC,
  windSpeed = SIMULATION.defaultWindSpeed,
  population = SIMULATION.baselinePopulation,
  fuelLevelLiters = SIMULATION.defaultFuelLevelLiters,
  fuelCapacity = 300000,
  baseEnergyDemandKw = SIMULATION.defaultEnergyDemandKw
}) {
  // Baseline ambient assumption
  const tempDelta = SIMULATION.baselineAmbientTempC - temperature;

  // 1. Heating demand increases as outdoor temperature drops below baseline & wind increases
  const windFactor = 1 + (Math.max(0, windSpeed - 20) * 0.015);
  const heatingDemandChangePct = Math.round((Math.max(0, tempDelta * 3.5) * windFactor));

  // 2. Energy consumption increases based on heating demand + population load
  const popFactor = (population / SIMULATION.baselinePopulation);
  const energyConsumptionChangePct = Math.round(heatingDemandChangePct * 0.65 + (popFactor - 1) * 12);

  // 3. Generator load and fuel consumption change
  const currentEnergyDemandKw = Math.max(SIMULATION.minEnergyDemandKw, Math.round(baseEnergyDemandKw * (1 + energyConsumptionChangePct / 100)));

  // Fuel consumption curve (liters per kWh output)
  const fuelConsumptionLph = Number((currentEnergyDemandKw * SIMULATION.fuelPerKwh).toFixed(1));
  const fuelConsumptionChangePct = Math.round(((fuelConsumptionLph - SIMULATION.baseFuelLph) / SIMULATION.baseFuelLph) * 100);

  // 4. Projected Fuel Remaining & Days to Critical Threshold (reserve %)
  const criticalThresholdLiters = fuelCapacity * SIMULATION.criticalFuelReservePct;
  const usableFuel = Math.max(0, fuelLevelLiters - criticalThresholdLiters);
  const dailyFuelConsumptionLiters = fuelConsumptionLph * 24;
  const predictedCriticalDays = Math.max(0, Math.floor(usableFuel / dailyFuelConsumptionLiters));

  const projectedFuelRemainingPct = Number(((fuelLevelLiters / fuelCapacity) * 100).toFixed(1));

  // 5. Outdoor Operations Risk Level
  let outdoorOpsRiskLevel = 'LOW';
  if (temperature < -35 || windSpeed > 75) {
    outdoorOpsRiskLevel = 'CRITICAL';
  } else if (temperature < -25 || windSpeed > 50) {
    outdoorOpsRiskLevel = 'HIGH';
  } else if (temperature < -20 || windSpeed > 30) {
    outdoorOpsRiskLevel = 'MODERATE';
  }

  // 6. Actionable recommendations
  const recommendedActions = [];
  if (predictedCriticalDays < 60) {
    recommendedActions.push(`Schedule urgent fuel resupply before day ${predictedCriticalDays}`);
  }
  if (heatingDemandChangePct > 20) {
    recommendedActions.push('Enable secondary CHP (Combined Heat & Power) loop to optimize thermal efficiency');
  }
  if (outdoorOpsRiskLevel === 'HIGH' || outdoorOpsRiskLevel === 'CRITICAL') {
    recommendedActions.push('Restrict non-essential exterior field operations due to extreme wind chill');
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push('Maintain standard operational parameters and monitor telemetry');
  }

  return {
    station,
    inputs: { temperature, windSpeed, population, fuelLevelLiters, fuelCapacity, baseEnergyDemandKw },
    outputs: {
      heatingDemandChangePct,
      energyConsumptionChangePct,
      fuelConsumptionChangePct,
      currentEnergyDemandKw,
      fuelConsumptionLph,
      dailyFuelConsumptionLiters,
      projectedFuelRemainingPct,
      predictedCriticalDays,
      outdoorOpsRiskLevel,
      recommendedActions
    }
  };
}

module.exports = { runCausalSimulation };