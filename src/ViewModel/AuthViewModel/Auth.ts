import { StateCreator } from 'zustand';
import authApi from '../../Model/Data/Auth/Auth';
import { setLocalStorage, clearAuthData, getLocalStorage } from '../../Authentication/localStorageServices';
import { isTokenValid } from '../../Authentication/jwt_decode';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  accessToken: string | null;
  setAuthenticationState: (isAuthenticated: boolean, isAuthLoading?: boolean) => void;
  register: (registerData: RegisterData) => Promise<{ success: boolean; data?: User; error?: string }>;
  login: (loginData: LoginData) => Promise<{ success: boolean; data?: User; error?: string }>;
  refreshAccessToken: () => Promise<{ success: boolean; accessToken?: string; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const authViewModel: StateCreator<AuthState> = (set, get, api) => ({
  // State
  isAuthenticated: false,
  isAuthLoading: false,
  user: null,
  accessToken: null,
  
  // Set authentication state
  setAuthenticationState: (isAuthenticated: boolean, isAuthLoading: boolean = false) => {
    set({ isAuthenticated, isAuthLoading });
  },
  
  // Register user
  register: async (registerData: RegisterData) => {
    set({ isAuthLoading: true });
    
    try {
      const response = await authApi.register(registerData);
      const data = response.data;
      
      if (response.status === 201 && data.STATUS === 'SUCCESSFUL') {
        const { user, access_token } = data.DB_DATA;
        
        // Save access token and user data (refresh token is stored in database)
        setLocalStorage('access_token', access_token);
        setLocalStorage('user_data', user);
        setLocalStorage('user_id', user._id);
        setLocalStorage('user_email', user.email);
        setLocalStorage('user_role', user.role);
        
        set({
          isAuthenticated: true,
          isAuthLoading: false,
          user: user,
          accessToken: access_token,
        });
        
        return { success: true, data: user };
      } else {
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Registration failed' 
        };
      }
    } catch (err: any) {
      // console.error('Error registering user:', err);
      const errorMessage = err.response?.data?.ERROR_DESCRIPTION || err.message || 'Registration failed';
      set({ isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  // Login user
  login: async (loginData: LoginData) => {
    // CRITICAL: Don't set isAuthLoading to true - it causes App.jsx to show loading screen
    // which unmounts the Login component and resets the form
    // Only set loading state locally in the component, not globally
    // set({ isAuthLoading: true }); // REMOVED - causes page reload
    
    try {
      const response = await authApi.login(loginData);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        const { user, access_token } = data.DB_DATA;
        
        // Save access token and user data (refresh token is stored in database)
        setLocalStorage('access_token', access_token);
        setLocalStorage('user_data', user);
        setLocalStorage('user_id', user._id);
        setLocalStorage('user_email', user.email);
        setLocalStorage('user_role', user.role);
        
        set({
          isAuthenticated: true,
          isAuthLoading: false, // Set to false on success
          user: user,
          accessToken: access_token,
        });
        
        return { success: true, data: user };
      } else {
        // CRITICAL: Don't set isAuthLoading to false here - it wasn't set to true
        // set({ isAuthLoading: false }); // REMOVED
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Login failed' 
        };
      }
    } catch (err: any) {
      // console.error('Error logging in:', err);
      
      // Handle different error types
      let errorMessage = 'Login failed';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 429) {
          errorMessage = data?.ERROR_DESCRIPTION || 'Too many authentication attempts. Please try again later.';
        } else if (status === 401) {
          errorMessage = data?.ERROR_DESCRIPTION || 'Invalid email or password';
        } else {
          errorMessage = data?.ERROR_DESCRIPTION || err.message || 'Login failed';
        }
      } else {
        errorMessage = err.message || 'Login failed';
      }
      
      // CRITICAL: Don't set isAuthLoading to false here - it wasn't set to true
      // set({ isAuthLoading: false }); // REMOVED
      return { success: false, error: errorMessage };
    }
  },
  
  // Refresh access token
  refreshAccessToken: async () => {
    // Get user_id from localStorage
    const userId = getLocalStorage('user_id');
    if (!userId) {
      return { success: false, error: 'No user ID available' };
    }
    
    try {
      const response = await authApi.refreshToken(userId);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        const { access_token } = data.DB_DATA;
        
        setLocalStorage('access_token', access_token);
        
        set({
          accessToken: access_token,
        });
        
        return { success: true, accessToken: access_token };
      } else {
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Token refresh failed' 
        };
      }
    } catch (err: any) {
      // console.error('Error refreshing token:', err);
      // If refresh fails, logout user
      get().logout();
      return { success: false, error: 'Token refresh failed' };
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await authApi.logout();
    } catch (err: any) {
      // console.error('Error logging out:', err);
    } finally {
      // Clear all auth data
      clearAuthData();
      
      set({
        isAuthenticated: false,
        isAuthLoading: false,
        user: null,
        accessToken: null,
      });
    }
  },
  
  // Initialize auth state from localStorage
  initializeAuth: async () => {
    set({ isAuthLoading: true });
    
    try {
      const accessToken = getLocalStorage('access_token');
      const userData = getLocalStorage('user_data');
      
      // If we have token and user data, restore the session
      if (accessToken && userData) {
        // Check if token is still valid
        const tokenValid = isTokenValid();
        
        if (tokenValid) {
          // Token is valid, restore session
          set({
            isAuthenticated: true,
            isAuthLoading: false,
            user: userData,
            accessToken: accessToken,
          });
        } else {
          // Token expired, try to refresh
          const refreshResult = await get().refreshAccessToken();
          
          if (refreshResult.success) {
            // Refresh successful, restore session
            set({
              isAuthenticated: true,
              isAuthLoading: false,
              user: userData,
              accessToken: refreshResult.accessToken || accessToken,
            });
          } else {
            // Refresh failed, clear auth but don't logout (let user stay on page if already logged in)
            // Only clear if tokens are completely invalid
            set({
              isAuthenticated: false,
              isAuthLoading: false,
              user: null,
              accessToken: null,
            });
          }
        }
      } else {
        // No tokens found
        set({
          isAuthenticated: false,
          isAuthLoading: false,
          user: null,
          accessToken: null,
        });
      }
    } catch (error: any) {
      // console.error('Error initializing auth:', error);
      set({
        isAuthenticated: false,
        isAuthLoading: false,
        user: null,
        accessToken: null,
      });
    }
  },
});

export default authViewModel;

