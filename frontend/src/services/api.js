import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false
});

export const fetchStations = () => api.get('/stations');
export const fetchStationDetail = (name) => api.get(`/stations/${name}`);
export const fetchEnergy = (station) => api.get(`/energy?station=${station}`);
export const fetchLogistics = (station) => api.get(`/logistics?station=${station}`);
export const fetchEnvironment = (station, range = '24h') => api.get(`/environment?station=${station}&range=${range}`);
export const fetchMaintenance = (station) => api.get(`/maintenance?station=${station}`);
export const fetchAlerts = () => api.get('/alerts');

export const fetchObservationCurrent = (station) => api.get(`/observations/current?station=${station}`);
export const fetchObservationSeries = (station, range = '24h') => api.get(`/observations/series?station=${station}&range=${range}`);
export const fetchObservationStats = (station) => api.get(`/observations/stats?station=${station}`);

export const runSimulation = (params) => api.post('/simulation/run', params);
export const queryAssistant = (payload) => api.post('/assistant/query', payload);

export const authLogin = (payload) => api.post('/auth/login', payload);
export const authLogout = () => api.post('/auth/logout');
export const authMe = () => api.get('/auth/me');
