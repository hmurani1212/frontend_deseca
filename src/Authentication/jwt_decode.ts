import { jwtDecode } from 'jwt-decode';
import { getLocalStorage } from './localStorageServices';

interface DecodedToken {
  user_id: string;
  email: string;
  role: string;
  exp: number;
  iat?: number;
}

interface UserData {
  user_id: string | null;
  email: string | null;
  role: string | null;
}

export const getToken = (): string | null => {
  return getLocalStorage('access_token');
};

export const decodeToken = (): DecodedToken | null => {
  try {
    const token = getToken();
    if (!token) return null;
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    // console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserData = (): UserData => {
  const decoded = decodeToken();
  if (!decoded) {
    // Fallback to localStorage
    return {
      user_id: getLocalStorage('user_id'),
      email: getLocalStorage('user_email'),
      role: getLocalStorage('user_role'),
    };
  }
  
  return {
    user_id: decoded.user_id || getLocalStorage('user_id'),
    email: decoded.email || getLocalStorage('user_email'),
    role: decoded.role || getLocalStorage('user_role'),
  };
};

export const isTokenValid = (): boolean => {
  const decoded = decodeToken();
  if (!decoded) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};

