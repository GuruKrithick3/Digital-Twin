const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const stationRoutes = require('./routes/stationRoutes');
const assetRoutes = require('./routes/assetRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const energyRoutes = require('./routes/energyRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const alertRoutes = require('./routes/alertRoutes');
const initAlertEngine = require('./services/alertEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antarctic_twin';

// Middlewares
app.use(cors());
app.use(express.json());

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Initialize Alert Engine
const alertEngine = initAlertEngine(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Antarctic Digital Twin Remote Management Platform',
    stations: ['Maitri', 'Bharati'],
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/stations', stationRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/alerts', alertRoutes);

// Database Connection with graceful fallback
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected successfully to Antarctic Digital Twin database');
  })
  .catch((err) => {
    console.warn('[MongoDB] Database connection deferred/unavailable. Operating in mock mode:', err.message);
  });

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`[ANTARCTIC TWIN BACKEND] Server listening on port ${PORT}`);
  console.log(`[REST API] http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});
