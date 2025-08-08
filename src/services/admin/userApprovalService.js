import { 
  apiGet, 
  apiPatch 
} from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  WAITING_CHEFS: '/admin/user/waiting/chef',
  WAITING_BUSINESSES: '/admin/user/waiting/business',
  APPROVE_USER: '/admin/user/approve',
  REJECT_USER: '/admin/user/reject',
};

export const userApprovalService = {
  // 요리사 승인 대기 목록 조회
  async getWaitingChefs(page = 0, size = 10) {
    const response = await apiGet(`${API_ENDPOINTS.WAITING_CHEFS}?page=${page}&size=${size}`);
    return handleApiResponse(response);
  },

  // 자영업자 승인 대기 목록 조회
  async getWaitingBusinesses(page = 0, size = 10) {
    const response = await apiGet(`${API_ENDPOINTS.WAITING_BUSINESSES}?page=${page}&size=${size}`);
    return handleApiResponse(response);
  },

  // 사용자 승인
  async approveUser(userId) {
    const response = await apiPatch(`${API_ENDPOINTS.APPROVE_USER}/${userId}`);
    return handleApiResponse(response);
  },

  // 사용자 거절
  async rejectUser(userId, rejectReason) {
    const response = await apiPatch(`${API_ENDPOINTS.REJECT_USER}/${userId}`, {
      reason: rejectReason
    });
    return handleApiResponse(response);
  },
};
