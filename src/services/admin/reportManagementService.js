import { apiClient } from '../../utils/interceptor';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LIST: '/admin/report/list',
  APPROVE: '/admin/report/approve',
  REJECT: '/admin/report/reject',
};

export const reportManagementService = {
  // 신고 목록 조회
  async getReportList(page = 0, size = 10) {
    const response = await apiClient.get(`${API_ENDPOINTS.LIST}?page=${page}&size=${size}`);
    return response.data;
  },

  // 신고 승인
  async approveReport(id) {
    const response = await apiClient.patch(`${API_ENDPOINTS.APPROVE}/${id}`);
    return response.data;
  },

  // 신고 거절
  async rejectReport(id, rejectReason) {
    const response = await apiClient.patch(`${API_ENDPOINTS.REJECT}/${id}`, {
      reason: rejectReason
    });
    return response.data;
  },
};
