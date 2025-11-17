import axiosInstance from '../../base';
import { API_ENDPOINTS } from '../../BaseUri';
import { AxiosPromise } from 'axios';

const dashboardApi = {
  // Get dashboard overview
  getOverview: function (): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.DASHBOARD.OVERVIEW
    });
  }
};

export default dashboardApi;

