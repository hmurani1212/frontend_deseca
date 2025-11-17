import axiosInstance from '../../base';
import { API_ENDPOINTS } from '../../BaseUri';
import { AxiosPromise } from 'axios';

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

interface RefreshTokenData {
  user_id: string;
}

const authApi = {
  // Register new user
  register: function (data: RegisterData): AxiosPromise {
    return axiosInstance.request({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.REGISTER,
      data: data
    });
  },
  
  // Login user
  login: function (data: LoginData): AxiosPromise {
    return axiosInstance.request({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.LOGIN,
      data: data
    });
  },
  
  // Refresh access token
  refreshToken: function (userId: string): AxiosPromise {
    return axiosInstance.request({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.REFRESH,
      data: {
        user_id: userId
      } as RefreshTokenData
    });
  },
  
  // Logout user
  logout: function (): AxiosPromise {
    return axiosInstance.request({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.LOGOUT
    });
  }
};

export default authApi;

