import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getLocalStorage, setLocalStorage } from '../Authentication/localStorageServices';
import authErrorHandler from './__authErrorHandler';
import authApi from '../Model/Data/Auth/Auth';
import { isTokenValid } from '../Authentication/jwt_decode';

interface FailedQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const setupAuthInterceptor = (axiosInstance: AxiosInstance, instanceName: string = 'Unknown'): void => {
  // Request interceptor - add fresh token to every request
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get fresh token from localStorage
      const token = getLocalStorage('access_token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      // console.error(`Request error in ${instanceName}:`, error);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor - handle auth errors and token refresh
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Check if server sent a new access token in response header
      const newAccessToken = response.headers['x-new-access-token'];
      if (newAccessToken) {
        // console.log('New access token received, updating localStorage');
        setLocalStorage('access_token', newAccessToken);
      }
      
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      if (!originalRequest) {
        return Promise.reject(error);
      }
      
      // Check if this is a 401 error and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Check if token is expired
        const token = getLocalStorage('access_token');
        const userId = getLocalStorage('user_id');
        
        if (token && userId && !isTokenValid()) {
          // Token is expired, try to refresh
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise<AxiosResponse>((resolve, reject) => {
              failedQueue.push({ 
                resolve: (token: string | null) => {
                  if (originalRequest.headers && token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(axiosInstance(originalRequest));
                }, 
                reject 
              });
            })
              .catch((err: any) => {
                return Promise.reject(err);
              });
          }
          
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            // console.log('Access token expired, attempting automatic refresh...');
            const response = await authApi.refreshToken(userId);
            
            if (response.data && response.data.DB_DATA && response.data.DB_DATA.access_token) {
              const newAccessToken = response.data.DB_DATA.access_token;
              
              // Update localStorage with new token
              setLocalStorage('access_token', newAccessToken);
              
              // Update the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              
              // Process queued requests
              processQueue(null, newAccessToken);
              isRefreshing = false;
              
              // Retry the original request
              return axiosInstance(originalRequest);
            } else {
              throw new Error('No access token in refresh response');
            }
          } catch (refreshError: any) {
            // Refresh failed, clear auth data and redirect to login
            processQueue(refreshError, null);
            isRefreshing = false;
            
            // Only redirect if it's a real auth error, not during token refresh
            if (authErrorHandler.isAuthenticationError(refreshError)) {
              return authErrorHandler.handleAuthError(refreshError, originalRequest);
            }
            
            return Promise.reject(refreshError);
          }
        }
      }
      
      // Check if this is an authentication error
      // CRITICAL: NEVER handle auth errors on login/register endpoints - let the component handle them
      // This prevents page reloads when login fails
      const requestUrl = originalRequest?.url || '';
      const isLoginOrRegister = requestUrl.includes('/auth/login') || 
                                requestUrl.includes('/auth/register') ||
                                requestUrl.includes('/login') ||
                                requestUrl.includes('/register');
      
      // NEVER call auth error handler for login/register - it causes page reloads
      if (isLoginOrRegister) {
        // Just reject the promise and let the component handle the error
        return Promise.reject(error);
      }
      
      // Only handle auth errors for other endpoints
      if (authErrorHandler.isAuthenticationError(error)) {
        return authErrorHandler.handleAuthError(error, originalRequest);
      }
      
      return Promise.reject(error);
    }
  );
};

