import { apiClient } from '../../utils/interceptor';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  WAITING_LECTURES: '/admin/lecture/list',
  APPROVE_LECTURE: '/admin/lecture/approve',
  REJECT_LECTURE: '/admin/lecture/reject',
};

export const lectureApprovalService = {
  // 승인 대기 강의 목록 조회
  async getWaitingLectures(page = 0, size = 10) {
    const response = await apiClient.get(`${API_ENDPOINTS.WAITING_LECTURES}?page=${page}&size=${size}`);
    return response.data;
  },

  // 강의 승인
  async approveLecture(lectureId) {
    const response = await apiClient.patch(`${API_ENDPOINTS.APPROVE_LECTURE}/${lectureId}`);
    return response.data;
  },

  // 강의 거절
  async rejectLecture(lectureId, rejectReason) {
    const response = await apiClient.patch(`${API_ENDPOINTS.REJECT_LECTURE}/${lectureId}`, {
      reason: rejectReason
    });
    return response.data;
  },
};
