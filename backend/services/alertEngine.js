const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function sendEmailAlert(alert) {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: `🚨 ${alert.severity} ALERT - ${alert.station} - ${alert.title}`,
      text: alert.message
    });
    console.log(`[EMAIL SENT] ${alert.title}`);
  } catch (err) {
    console.error('[EMAIL FAILED]', err.message);
  }
}

const Alert = require('../models/Alert');
const { ALERT_RULES } = require('../data/seedData');

function initAlertEngine(io) {
  return {
    async evaluateAndEmitAlerts(stationData) {
      const activeAlerts = [];

      // Check fuel reserves
      if (stationData.fuelLevelLiters && stationData.fuelCapacity) {
        const fuelPct = (stationData.fuelLevelLiters / stationData.fuelCapacity) * 100;
        if (fuelPct < ALERT_RULES.fuelCriticalPct) {
          activeAlerts.push({
            station: stationData.name || 'Bharati',
            severity: 'RED',
            title: 'Critical Fuel Reserve',
            message: `Fuel reserve is at ${fuelPct.toFixed(1)}%, below ${ALERT_RULES.fuelCriticalPct}% safety threshold`,
            sourceModule: 'fuel',
            active: true
          });
        } else if (fuelPct < ALERT_RULES.fuelWarningPct) {
          activeAlerts.push({
            station: stationData.name || 'Bharati',
            severity: 'YELLOW',
            title: 'Fuel Consumption Warning',
            message: `Fuel reserve is at ${fuelPct.toFixed(1)}%, reorder recommended`,
            sourceModule: 'fuel',
            active: true
          });
        }
      }

      // Check environmental risk
      if (stationData.temperature && stationData.temperature < ALERT_RULES.extremeLowTempC) {
        activeAlerts.push({
          station: stationData.name || 'Maitri',
          severity: 'YELLOW',
          title: 'Extreme Low Temperature',
          message: `Ambient temperature dropped to ${stationData.temperature}°C. Increased heating demand active.`,
          sourceModule: 'environment',
          active: true
        });
      }

      // Send email for RED (critical) severity alerts
      for (const alert of activeAlerts) {
        if (alert.severity === 'RED') {
          await sendEmailAlert(alert);
        }
      }

      if (io && activeAlerts.length > 0) {
        io.emit('alerts_update', activeAlerts);
      }

      return activeAlerts;
    }
  };
}

module.exports = initAlertEngine;