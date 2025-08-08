import { apiGet } from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
};

export const dashboardService = {
  // 대시보드 데이터 조회
  async getDashboardData() {
    const response = await apiGet(API_ENDPOINTS.DASHBOARD);
    return handleApiResponse(response);
  },
};
