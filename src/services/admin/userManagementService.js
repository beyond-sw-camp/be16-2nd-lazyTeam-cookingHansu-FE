import { apiClient } from '../../utils/interceptor';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  USER_LIST: '/admin/user/list',
  ACTIVATE_USER: '/admin/user/active',
  INACTIVE_USER: '/admin/user/inactive',
};

export const userManagementService = {
  // 사용자 전체 목록 조회
  async getUserList(page = 0, size = 10) {
    const response = await apiClient.get(`${API_ENDPOINTS.USER_LIST}?page=${page}&size=${size}`);
    return response.data;
  },

  // 사용자 활성화
  async activateUser(userId) {
    const response = await apiClient.patch(`${API_ENDPOINTS.ACTIVATE_USER}/${userId}`);
    return response.data;
  },

  // 사용자 비활성화
  async inactiveUser(userId) {
    const response = await apiClient.patch(`${API_ENDPOINTS.INACTIVE_USER}/${userId}`);
    return response.data;
  },
};
