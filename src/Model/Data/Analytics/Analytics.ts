import axiosInstance from '../../base';
import { API_ENDPOINTS } from '../../BaseUri';
import { AxiosPromise } from 'axios';

interface TrendsParams {
  period?: string;
  granularity?: 'hourly' | 'daily' | 'weekly';
  metric?: string;
}

interface TopPostsParams {
  limit?: number;
}

interface PerformanceComparisonParams {
  start_date?: string;
  end_date?: string;
}

const analyticsApi = {
  // Get optimal posting times
  getOptimalTimes: function (): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.ANALYTICS.OPTIMAL_TIMES
    });
  },
  
  // Get engagement trends
  getTrends: function (params: TrendsParams = {}): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.ANALYTICS.TRENDS,
      params: params
    });
  },
  
  // Get platform performance
  getPlatformPerformance: function (): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.ANALYTICS.PLATFORM_PERFORMANCE
    });
  },
  
  // Get top posts
  getTopPosts: function (params: TopPostsParams = {}): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.ANALYTICS.TOP_POSTS,
      params: params
    });
  },
  
  // Get performance comparison
  getPerformanceComparison: function (params: PerformanceComparisonParams = {}): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.ANALYTICS.PERFORMANCE_COMPARISON,
      params: params
    });
  }
};

export default analyticsApi;

