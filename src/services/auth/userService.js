import { API_BASE_URL, apiDelete, apiPost } from "../../utils/api";
import { handleApiResponse } from "../../models/common/ApiResponse";
import { OAUTH_CONFIG, API_CONFIG } from "../../constants/oauth";

// API 엔드포인트 상수
const API_ENDPOINTS = {
  DELETE_USER: "/user/delete",
  RESTORE_USER: "/user/restore",
};

export const userService = {
  // 통합된 회원 탈퇴 (soft delete)
  async deleteUser() {
    try {
      const response = await apiDelete(API_ENDPOINTS.DELETE_USER);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // 회원 복구
  async restoreUser(confirmMessage = "회원 복구를 확인합니다.") {
    const response = await apiPost(API_ENDPOINTS.RESTORE_USER, {
      confirmMessage
    });
    return handleApiResponse(response);
  },
};
