require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { requireAuth } = require('./middleware/auth');
const authSocket = require('./middleware/socketAuth');

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
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antarctic_twin';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middlewares
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Socket.IO Authentication + Connection
authSocket(io);

// Initialize Alert Engine
const alertEngine = initAlertEngine(io);

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Antarctic Digital Twin Remote Management Platform',
    stations: ['Maitri', 'Bharati'],
    timestamp: new Date().toISOString()
  });
});

// Mount Auth Routes (public login/logout, admin-guarded user mgmt)
app.use('/api/auth', authRoutes);

// Mount Protected Routes (require valid JWT in HTTP-only cookie)
app.use('/api/stations', requireAuth, stationRoutes);
app.use('/api/assets', requireAuth, assetRoutes);
app.use('/api/sensors', requireAuth, sensorRoutes);
app.use('/api/energy', requireAuth, energyRoutes);
app.use('/api/logistics', requireAuth, logisticsRoutes);
app.use('/api/environment', requireAuth, environmentRoutes);
app.use('/api/maintenance', requireAuth, maintenanceRoutes);
app.use('/api/simulation', requireAuth, simulationRoutes);
app.use('/api/assistant', requireAuth, assistantRoutes);
app.use('/api/alerts', requireAuth, alertRoutes);

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
