import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use your PC's local IP for LDPlayer/emulator testing
const LOCAL_IP = '192.168.125.232';

const BASE_URL = Platform.select({
  android: `http://${LOCAL_IP}:3000/api`,
  ios: 'http://localhost:3000/api',
  default: 'http://localhost:3000/api',
});

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

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
