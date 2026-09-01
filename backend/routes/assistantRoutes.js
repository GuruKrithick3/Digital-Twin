const express = require('express');
const router = express.Router();
const { generateStationTelemetry } = require('../simulator/sensorSimulator');
const { runCausalSimulation } = require('../services/digitalTwin');
const { STATIONS } = require('../data/seedData');

// POST /api/assistant/query
router.post('/query', async (req, res) => {
  const { question, station = 'Bharati' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  const stationConfig = STATIONS.find(s => s.key === String(station).toLowerCase()) || STATIONS[1];

  // Build live digital twin context for whichever station is selected
  const telemetry = generateStationTelemetry(stationConfig.name);
  const mainGen = telemetry.assets.find(a => a.type === 'generator');
  const food = telemetry.inventory.find(i => i.itemCategory === 'food');
  const fuel = telemetry.inventory.find(i => i.itemCategory === 'fuel');
  const water = telemetry.inventory.find(i => i.itemCategory === 'water');

  const sim = runCausalSimulation({
    station: stationConfig.name,
    temperature: telemetry.environment.temperature,
    windSpeed: telemetry.environment.windSpeed,
    population: food ? stationConfig.currentPopulation : 30,
    fuelLevelLiters: telemetry.energy.fuelLevelLiters,
    fuelCapacity: stationConfig.fuelCapacity
  });

  const stationContext = {
    station: stationConfig.name,
    environment: {
      temperature: `${telemetry.environment.temperature}°C`,
      windSpeed: `${telemetry.environment.windSpeed} m/s`,
      windDirection: telemetry.environment.windDirection,
      humidity: `${telemetry.environment.humidity}%`,
      pressure: `${telemetry.environment.pressure} hPa`,
      radiation: `${telemetry.environment.radiation} W/m²`,
      visibility: `${telemetry.environment.visibility} km`,
      outdoorOpsRiskLevel: sim.outputs.outdoorOpsRiskLevel,
      isRealData: telemetry.environment.isRealData
    },
    energy: {
      generationKw: telemetry.energy.generationKw,
      consumptionKw: telemetry.energy.consumptionKw,
      netEnergyKw: telemetry.energy.netEnergyKw,
      efficiencyPct: telemetry.energy.efficiencyPct,
      fuelConsumptionLph: telemetry.energy.fuelConsumptionLph,
      fuelLevelLiters: telemetry.energy.fuelLevelLiters,
      predictedCriticalDays: sim.outputs.predictedCriticalDays,
      projectedFuelRemainingPct: sim.outputs.projectedFuelRemainingPct,
      dailyFuelConsumptionLiters: sim.outputs.dailyFuelConsumptionLiters,
      isRealData: telemetry.energy.isRealData
    },
    inventory: telemetry.inventory.map(i => ({
      itemCategory: i.itemCategory,
      itemName: i.itemName,
      currentStock: i.currentStock,
      capacity: i.capacity,
      unit: i.unit,
      dailyConsumption: i.dailyConsumption,
      reorderThreshold: i.reorderThreshold
    })),
    assets: telemetry.assets.map(a => ({
      assetId: a.assetId,
      name: a.name,
      type: a.type,
      status: a.status,
      healthScore: a.healthScore,
      vibration: a.vibration,
      temperature: `${a.temperature}°C`,
      failureProbability: a.failureProbability
    })),
    recommendations: sim.outputs.recommendedActions
  };

  const systemPrompt = `You are the Antarctic Twin AI Operational Assistant for NCPOR.
You answer questions about the Maitri and Bharati Antarctic research stations using the live digital twin data provided.
Be precise, cite numbers directly from the data, and clearly flag any risk (fuel, power, weather, personnel safety).
Keep answers concise and operational. Structure multi-point answers with short bullet lines.

STATION DATA:
${JSON.stringify(stationContext, null, 2)}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // If no Gemini key configured, fall back to the grounded twin response so the UI stays functional
    if (!apiKey) {
      const fallback = buildFallbackAnswer(question, stationConfig.name, sim);
      return res.json({
        success: true,
        reply: fallback.answer,
        answer: fallback.answer,
        groundingData: fallback.groundingData
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser question: ${question}` }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(502).json({ error: 'AI service error', details: data.error && data.error.message });
    }

    const reply = data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text
      || 'No response generated.';

    res.json({
      success: true,
      reply,
      answer: reply,
      groundingData: {
        station: stationConfig.name,
        provider: 'gemini',
        fuelLevelLiters: telemetry.energy.fuelLevelLiters,
        predictedCriticalDays: sim.outputs.predictedCriticalDays,
        temperature: telemetry.environment.temperature,
        riskLevel: sim.outputs.outdoorOpsRiskLevel
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Keep the previous rule-based fallback so the UI works even without a Gemini key
function buildFallbackAnswer(question, station, sim) {
  const telemetry = generateStationTelemetry(station);
  const qLower = (question || '').toLowerCase();
  let answer;

  if (qLower.includes('resupply') || qLower.includes('days') || qLower.includes('operate')) {
    answer = `Based on current live digital twin telemetry for ${station}:\n` +
      `- Current Fuel Reserves: ${telemetry.energy.fuelLevelLiters.toLocaleString()} L\n` +
      `- Daily Consumption Rate: ${sim.outputs.dailyFuelConsumptionLiters.toLocaleString()} L/day\n` +
      `- Projected Days until Critical Threshold: ${sim.outputs.predictedCriticalDays} days.\n\n` +
      `Recommendation: ${station} CAN operate safely for the requested period. Resupply window is recommended before day ${sim.outputs.predictedCriticalDays}.`;
  } else if (qLower.includes('generator') || qLower.includes('maintenance') || qLower.includes('health')) {
    const mainGen = telemetry.assets.find(a => a.type === 'generator');
    answer = `Asset Telemetry for ${station} Generators:\n` +
      `- Primary Unit: ${mainGen ? mainGen.name : 'CHP Generator A'}\n` +
      `- Current Health Score: ${mainGen ? mainGen.healthScore : 92}/100\n` +
      `- Vibration Level: ${mainGen ? mainGen.vibration : 0.62} mm/s\n` +
      `- Failure Risk: ${mainGen && mainGen.failureProbability > 0.3 ? 'ELEVATED' : 'LOW'}\n\n` +
      `Recommendation: Maintain standard maintenance schedule. No immediate emergency shutdown required.`;
  } else {
    answer = `Antarctic Digital Twin Grounded Response for ${station}:\n` +
      `- Ambient Temperature: ${telemetry.environment.temperature}°C (REAL DATA - NCPOR)\n` +
      `- Current Power Load: ${telemetry.energy.consumptionKw} kW (SIMULATED TELEMETRY)\n` +
      `- Station Health Status: OPERATIONAL (${telemetry.environment.riskScore < 30 ? 'NORMAL' : 'MONITOR'})\n\n` +
      `All station subsystems are operating within safe parametric margins.`;
  }

  const groundingData = {
    station,
    provider: 'digital-twin-fallback',
    fuelLevelLiters: telemetry.energy.fuelLevelLiters,
    predictedCriticalDays: sim.outputs.predictedCriticalDays,
    temperature: telemetry.environment.temperature,
    riskLevel: sim.outputs.outdoorOpsRiskLevel
  };

  return { answer, groundingData };
}

module.exports = router;