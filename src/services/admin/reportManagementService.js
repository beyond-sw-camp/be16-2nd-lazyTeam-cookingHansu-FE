import { 
  apiGet, 
  apiPatch,
} from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LIST: '/admin/report/list',
  APPROVE: '/admin/report/approve',
  REJECT: '/admin/report/reject',
};

export const reportManagementService = {
  // 신고 목록 조회
  async getReportList(page = 0, size = 10) {
    const response = await apiGet(`${API_ENDPOINTS.LIST}?page=${page}&size=${size}`);
    return handleApiResponse(response);
  },

  // 신고 승인
  async approveReport(id) {
    const response = await apiPatch(`${API_ENDPOINTS.APPROVE}/${id}`);
    return handleApiResponse(response);
  },

  // 신고 거절
  async rejectReport(id, rejectReason) {
    const response = await apiPatch(`${API_ENDPOINTS.REJECT}/${id}`, {
      reason: rejectReason
    });
    return handleApiResponse(response);
  },
};
