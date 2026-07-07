import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, Next.js API typically runs on port 3000
// Use your machine's local IP address for physical device or emulator testing
const API_URL = 'http://10.33.65.193:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});
