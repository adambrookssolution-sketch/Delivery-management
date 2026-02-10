import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { enqueue, startListening } from './offlineQueue';

// ============================================
// SERVER CONFIGURATION
// Change this to your server's IP or domain
// ============================================
const SERVER_URL = 'http://192.168.125.232:3000';

const BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 + offline queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Offline queue: queue mutation requests when no network
    if (
      error.message === 'Network Error' &&
      !originalRequest._retry &&
      !originalRequest._queued &&
      ['post', 'put', 'delete'].includes(originalRequest.method) &&
      !originalRequest.url?.includes('/auth/') &&
      originalRequest.headers?.['Content-Type'] !== 'multipart/form-data'
    ) {
      originalRequest._queued = true;
      await enqueue(originalRequest);
      return {
        data: {
          success: true,
          queued: true,
          message: 'Sin conexion. La solicitud se enviara cuando vuelva la senal.',
        },
      };
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    }
    return Promise.reject(error);
  }
);

// Start offline queue listener
startListening(api);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const shipmentAPI = {
  getMyShipments: (status) => {
    const params = {};
    if (status) params.status = status;
    return api.get('/shipments/driver/my', { params });
  },
  getById: (id) => api.get(`/shipments/${id}`),
  updateStatus: (id, status, note, location) =>
    api.put(`/shipments/${id}/status`, { status, note, location }),
  deliver: (id, data) => api.post(`/shipments/${id}/deliver`, data),
  getQRCode: (id) => api.get(`/shipments/${id}/qr`),
};

export const uploadAPI = {
  photo: (formData) =>
    api.post('/uploads/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  signature: (formData) =>
    api.post('/uploads/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
