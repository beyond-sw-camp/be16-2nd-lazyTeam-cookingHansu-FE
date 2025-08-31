import { apiPost, apiGet } from "../../utils/api";
import { handleApiResponse } from "../../models/common/ApiResponse";

// API 엔드포인트 상수
const API_ENDPOINTS = {
  CREATE_REPORT: "/report/create",
  CHECK_REPORT: "/report/check",
};

export const reportService = {
  // 신고 생성
  async createReport(reportData) {
    const response = await apiPost(API_ENDPOINTS.CREATE_REPORT, reportData);
    return handleApiResponse(response);
  },

  // 신고 중복 확인
  async checkReport(targetId) {
    const response = await apiGet(`${API_ENDPOINTS.CHECK_REPORT}/${targetId}`);
    return handleApiResponse(response);
  },
};
