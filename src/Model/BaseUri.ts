// Base URLs for API endpoints
export const BASE_URL: string =  'https://backenddeseca-production.up.railway.app';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  POSTS: {
    BASE: '/api/posts',
    BY_ID: (id: string) => `/api/posts/${id}`,
    ANALYTICS: (id: string) => `/api/posts/${id}/analytics`,
  },
  ANALYTICS: {
    OPTIMAL_TIMES: '/api/analytics/optimal-times',
    TRENDS: '/api/analytics/trends',
    PLATFORM_PERFORMANCE: '/api/analytics/performance/platforms',
    TOP_POSTS: '/api/analytics/performance/top-posts',
    PERFORMANCE_COMPARISON: '/api/analytics/performance/comparison',
  },
  DASHBOARD: {
    OVERVIEW: '/api/dashboard/overview',
  },
};

