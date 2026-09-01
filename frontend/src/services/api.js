import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const socket = io('http://localhost:5000', {
  autoConnect: false
});

export const fetchStations = () => api.get('/stations');
export const fetchStationDetail = (name) => api.get(`/stations/${name}`);
export const fetchEnergy = (station) => api.get(`/energy?station=${station}`);
export const fetchLogistics = (station) => api.get(`/logistics?station=${station}`);
export const fetchEnvironment = (station) => api.get(`/environment?station=${station}`);
export const fetchMaintenance = (station) => api.get(`/maintenance?station=${station}`);
export const fetchAlerts = () => api.get('/alerts');

export const runSimulation = (params) => api.post('/simulation/run', params);
export const queryAssistant = (payload) => api.post('/assistant/query', payload);
