import { StateCreator } from 'zustand';
import dashboardApi from '../../Model/Data/Dashboard/Dashboard';

interface DashboardState {
  overview: any;
  isLoadingOverview: boolean;
  overviewRequestInProgress: boolean; // Guard to prevent duplicate calls
  getOverview: () => Promise<{ success: boolean; data?: any; error?: string }>;
  updateOverview: (updates: any) => void;
}

const dashboardViewModel: StateCreator<DashboardState> = (set, get, api) => ({
  // State
  overview: null,
  isLoadingOverview: false,
  overviewRequestInProgress: false, // Guard to prevent duplicate calls
  
  // Get dashboard overview
  getOverview: async () => {
    // Prevent duplicate calls if already loading
    if (get().isLoadingOverview || get().overviewRequestInProgress) {
      // console.log('Dashboard overview request already in progress, skipping duplicate call');
      return { success: false, error: 'Request already in progress' };
    }
    
    set({ isLoadingOverview: true, overviewRequestInProgress: true });
    
    try {
      const response = await dashboardApi.getOverview();
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          overview: data.DB_DATA,
          isLoadingOverview: false,
          overviewRequestInProgress: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingOverview: false, overviewRequestInProgress: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch dashboard overview' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching dashboard overview:', err);
      set({ isLoadingOverview: false, overviewRequestInProgress: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch dashboard overview' 
      };
    }
  },

  // Update dashboard overview (for real-time updates)
  updateOverview: (updates: any) => {
    const currentOverview = get().overview;
    if (currentOverview) {
      set({
        overview: {
          ...currentOverview,
          ...updates,
        },
      });
    }
  },
});

export default dashboardViewModel;

