import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearAuthData as clearLocalStorageAuthData } from '../Authentication/localStorageServices';
import { isTokenValid } from '../Authentication/jwt_decode';

interface AuthErrorResponse {
  ERROR_CODE?: string;
  error_code?: string;
  ERROR_FILTER?: string;
  error_filter?: string;
  ERROR_DESCRIPTION?: string;
}

class AuthErrorHandler {
  private isRedirecting: boolean = false;
  private authErrorCodes: string[] = [
    'VTAPP-AUTH001',
    'VTAPP-AUTH002',
    'VTAPP-AUTH003',
    'VTAPP-AUTH004',
    'VTAPP-AUTH005',
    'VTAPP-AUTH006',
    'VTAPP-AUTH012',
    'VTAPP-AUTH013',
    'USER_NOT_AUTHENTICATED',
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'UNAUTHORIZED'
  ];
  
  isAuthenticationError(error: any): boolean {
    if (!error || !error.response) return false;
    
    const { status, data } = error.response;
    
    // Check for specific error codes
    if (data && typeof data === 'object') {
      const errorCode = data.ERROR_CODE || data.error_code;
      const errorFilter = data.ERROR_FILTER || data.error_filter;
      
      if (errorCode && this.authErrorCodes.includes(errorCode)) {
        return true;
      }
      
      if (errorFilter && errorFilter === 'USER_END_VIOLATION') {
        return true;
      }
    }
    
    // Check HTTP status codes
    if (status === 401 || status === 403) {
      // Verify token is actually expired
      if (!isTokenValid()) {
        return true;
      }
    }
    
    return false;
  }
  
  handleAuthError(error: AxiosError, config: InternalAxiosRequestConfig = {} as InternalAxiosRequestConfig): Promise<never> {
    const errorData = error.response?.data as AuthErrorResponse | undefined;
    // console.warn('Authentication error detected:', {
    //   url: config.url || 'Unknown',
    //   status: error.response?.status,
    //   errorCode: errorData?.ERROR_CODE
    // });
    
    // Show error message
    this.showAuthErrorMessage(error);
    
    // Redirect to login
    this.redirectToLogin();
    
    return Promise.reject(error);
  }
  
  private showAuthErrorMessage(error: AxiosError): void {
    const errorData = error.response?.data as AuthErrorResponse | undefined;
    const errorMessage = errorData?.ERROR_DESCRIPTION || 'Session expired. Please login again.';
    // You can use toast notification here
    // console.error('Auth Error:', errorMessage);
  }
  
  redirectToLogin(reason: string = 'Session expired'): void {
    if (this.isRedirecting) return;
    
    // CRITICAL: Don't redirect if we're already on the login or register page
    // This prevents page reload when login fails
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/register') {
      // console.log('Already on login/register page, skipping redirect to prevent page reload');
      return;
    }
    
    this.isRedirecting = true;
    
    // Only clear auth data and redirect if it's a real auth error
    // Don't auto-logout on page refresh
    this.clearAuthData();
    
    // Use window.location only for actual auth failures, not for token refresh attempts
    setTimeout(() => {
      // Check if we're already on login page to avoid redirect loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 1500);
  }
  
  private clearAuthData(): void {
    clearLocalStorageAuthData();
  }
}

const authErrorHandler = new AuthErrorHandler();
export default authErrorHandler;

