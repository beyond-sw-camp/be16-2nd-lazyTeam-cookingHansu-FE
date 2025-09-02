import { apiClient } from '../../utils/interceptor';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
};

export const dashboardService = {
  // 대시보드 데이터 조회
  async getDashboardData() {
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD);
    return response.data;
  },
};
