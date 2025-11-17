import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from './BaseUri';
import { setupAuthInterceptor } from '../services/__axiosInterceptors';

// Create axios instance for main API
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup auth interceptors
setupAuthInterceptor(axiosInstance, 'MainAPI');

export default axiosInstance;

