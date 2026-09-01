const axios = require('axios');
const { PREDICTION_RULES } = require('../data/seedData');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function predictAssetFailure(assetData) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/failure`, assetData, { timeout: 3000 });
    return response.data;
  } catch (error) {
    // Fallback heuristic if ML service is unreachable
    const temp = assetData.temperature || 25;
    const vib = assetData.vibration || 0.5;
    const hours = assetData.runtimeHours || 1000;

    let prob = PREDICTION_RULES.baseProbability
      + (temp > PREDICTION_RULES.highTempC ? PREDICTION_RULES.tempProbabilityBump : 0)
      + (vib > PREDICTION_RULES.highVibration ? PREDICTION_RULES.vibrationProbabilityBump : 0)
      + (hours > PREDICTION_RULES.highRuntimeHours ? PREDICTION_RULES.runtimeProbabilityBump : 0);
    prob = Math.min(PREDICTION_RULES.probabilityCeiling, Number(prob.toFixed(2)));

    let bucket = 'LOW';
    if (prob > PREDICTION_RULES.highBucketThreshold) bucket = 'HIGH';
    else if (prob > PREDICTION_RULES.mediumBucketThreshold) bucket = 'MEDIUM';

    return {
      assetId: assetData.assetId || 'ASSET-01',
      failureProbability: prob,
      bucket,
      contributingReasons: [
        ...(temp > PREDICTION_RULES.highTempC ? ['High operational temperature'] : []),
        ...(vib > PREDICTION_RULES.highVibration ? ['Vibration level exceeds threshold'] : []),
        ...(hours > PREDICTION_RULES.highRuntimeHours ? ['High cumulative runtime hours'] : [])
      ],
      recommendedAction: prob > PREDICTION_RULES.highBucketThreshold ? 'Schedule immediate inspection' : 'Continue monitoring',
      timeWindow: prob > PREDICTION_RULES.highBucketThreshold ? 'Within 48 hours' : 'Next scheduled maintenance'
    };
  }
}

module.exports = { predictAssetFailure };