import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001/api';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// attach auth token or guest token on every request
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const authToken  = await SecureStore.getItemAsync('auth_token');
  const guestToken = await SecureStore.getItemAsync('guest_token');

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else if (guestToken) {
    config.headers['X-Guest-Token'] = guestToken;
  }

  const deviceId = await SecureStore.getItemAsync('device_id');
  if (deviceId) {
    config.headers['X-Device-ID'] = deviceId;
  }

  return config;
});

// handle 401 globally
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default client;
