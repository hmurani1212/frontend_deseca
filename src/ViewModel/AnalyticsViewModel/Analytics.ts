import { StateCreator } from 'zustand';
import analyticsApi from '../../Model/Data/Analytics/Analytics';

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

interface AnalyticsState {
  optimalTimes: any[];
  trends: any;
  platformPerformance: any[];
  topPosts: any[];
  performanceComparison: any;
  isLoadingOptimalTimes: boolean;
  isLoadingTrends: boolean;
  isLoadingPlatformPerformance: boolean;
  isLoadingTopPosts: boolean;
  isLoadingComparison: boolean;
  getOptimalTimes: () => Promise<{ success: boolean; data?: any; error?: string }>;
  getTrends: (params?: TrendsParams) => Promise<{ success: boolean; data?: any; error?: string }>;
  getPlatformPerformance: () => Promise<{ success: boolean; data?: any; error?: string }>;
  getTopPosts: (params?: TopPostsParams) => Promise<{ success: boolean; data?: any; error?: string }>;
  getPerformanceComparison: (params?: PerformanceComparisonParams) => Promise<{ success: boolean; data?: any; error?: string }>;
}

const analyticsViewModel: StateCreator<AnalyticsState> = (set, get, api) => ({
  // State
  optimalTimes: [],
  trends: null,
  platformPerformance: [],
  topPosts: [],
  performanceComparison: null,
  isLoadingOptimalTimes: false,
  isLoadingTrends: false,
  isLoadingPlatformPerformance: false,
  isLoadingTopPosts: false,
  isLoadingComparison: false,
  
  // Get optimal posting times
  getOptimalTimes: async () => {
    set({ isLoadingOptimalTimes: true });
    
    try {
      const response = await analyticsApi.getOptimalTimes();
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          optimalTimes: data.DB_DATA || [],
          isLoadingOptimalTimes: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingOptimalTimes: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch optimal times' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching optimal times:', err);
      set({ isLoadingOptimalTimes: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch optimal times' 
      };
    }
  },
  
  // Get engagement trends
  getTrends: async (params: TrendsParams = {}) => {
    set({ isLoadingTrends: true });
    
    try {
      const response = await analyticsApi.getTrends(params);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          trends: data.DB_DATA,
          isLoadingTrends: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingTrends: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch trends' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching trends:', err);
      set({ isLoadingTrends: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch trends' 
      };
    }
  },
  
  // Get platform performance
  getPlatformPerformance: async () => {
    set({ isLoadingPlatformPerformance: true });
    
    try {
      const response = await analyticsApi.getPlatformPerformance();
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          platformPerformance: data.DB_DATA || [],
          isLoadingPlatformPerformance: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingPlatformPerformance: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch platform performance' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching platform performance:', err);
      set({ isLoadingPlatformPerformance: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch platform performance' 
      };
    }
  },
  
  // Get top posts
  getTopPosts: async (params: TopPostsParams = {}) => {
    set({ isLoadingTopPosts: true });
    
    try {
      const response = await analyticsApi.getTopPosts(params);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          topPosts: data.DB_DATA || [],
          isLoadingTopPosts: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingTopPosts: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch top posts' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching top posts:', err);
      set({ isLoadingTopPosts: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch top posts' 
      };
    }
  },
  
  // Get performance comparison
  getPerformanceComparison: async (params: PerformanceComparisonParams = {}) => {
    set({ isLoadingComparison: true });
    
    try {
      const response = await analyticsApi.getPerformanceComparison(params);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          performanceComparison: data.DB_DATA,
          isLoadingComparison: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingComparison: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch performance comparison' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching performance comparison:', err);
      set({ isLoadingComparison: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch performance comparison' 
      };
    }
  },
});

export default analyticsViewModel;

