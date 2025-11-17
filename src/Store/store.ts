import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Import all ViewModels
import authViewModel from '../ViewModel/AuthViewModel/Auth';
import postsViewModel from '../ViewModel/PostsViewModel/Posts';
import analyticsViewModel from '../ViewModel/AnalyticsViewModel/Analytics';
import dashboardViewModel from '../ViewModel/DashboardViewModel/Dashboard';

// Create store with devtools
const useStore = create(
  devtools((set: any, get: any, api: any) => ({
    // Spread all ViewModels
    ...authViewModel(set, get, api),
    ...postsViewModel(set, get, api),
    ...analyticsViewModel(set, get, api),
    ...dashboardViewModel(set, get, api),
  }), { name: 'AppStore' })
);

// Infer RootState from the store
export type RootState = ReturnType<typeof useStore.getState>;

export default useStore;

