import { apiClient } from "../../utils/interceptor";
import { handleApiResponse } from "../../models/common/ApiResponse";

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LOGIN: "/user/login",
  GOOGLE_LOGIN: "/user/login/google",
  KAKAO_LOGIN: "/user/login/kakao",
  NAVER_LOGIN: "/user/login/naver",
  LOGOUT: "/user/logout",

  ADD_INFO: "/user/add-info",
  REFRESH: "/user/refresh",
  CURRENT_USER_INFO: "/user/me",
  RESTORE_USER: "/user/restore",
};

export const authService = {
  // 일반 로그인
  async login(loginData) {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, loginData);
    return handleApiResponse(response);
  },

  // Google OAuth 로그인
  async googleLogin(authCode) {
    const response = await apiClient.post(API_ENDPOINTS.GOOGLE_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // Kakao OAuth 로그인
  async kakaoLogin(authCode) {
    const response = await apiClient.post(API_ENDPOINTS.KAKAO_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // Naver OAuth 로그인
  async naverLogin(authCode) {
    const response = await apiClient.post(API_ENDPOINTS.NAVER_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // 로그아웃
  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT);
    return handleApiResponse(response);
  },



  // 추가 정보 입력 (통합)
  async addUserInfo(userId, userInfo) {
    const endpoint = `${API_ENDPOINTS.ADD_INFO}?userId=${userId}`;
    const response = await apiClient.post(endpoint, userInfo);
    return handleApiResponse(response);
  },

  // 추가 정보 입력 (FormData - multipart 방식)
  async addUserInfoFormData(userId, formData) {
    const endpoint = `${API_ENDPOINTS.ADD_INFO}?userId=${userId}`;
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse(response);
  },

  // 회원가입 상태 확인
  async getUserRegistrationStatus(userId) {
    const endpoint = `${API_ENDPOINTS.ADD_INFO}/status?userId=${userId}`;
    const response = await apiClient.get(endpoint);
    return handleApiResponse(response);
  },

  // 현재 로그인된 사용자 정보 조회
  async getCurrentUserInfo() {
    const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER_INFO);
    return handleApiResponse(response); 
  },

  // 회원 복구
  async restoreUser(restoreData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RESTORE_USER, restoreData);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Failed to restore user:', error);
      throw error;
    }
  }
};
