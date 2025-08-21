import { apiGet, apiPost, apiPostFormData } from "../../utils/api";
import { handleApiResponse } from "../../models/common/ApiResponse";

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LOGIN: "/user/login",
  GOOGLE_LOGIN: "/user/login/google",
  KAKAO_LOGIN: "/user/login/kakao",
  NAVER_LOGIN: "/user/login/naver",
  LOGOUT: "/user/logout",
  PROFILE_INFO: "/user/profile",
  ADD_INFO: "/user/add-info",
  REFRESH: "/user/refresh",
  CURRENT_USER_INFO: "/user/me", 
};

export const authService = {
  // 일반 로그인
  async login(loginData) {
    const response = await apiPost(API_ENDPOINTS.LOGIN, loginData);
    return handleApiResponse(response);
  },

  // Google OAuth 로그인
  async googleLogin(authCode) {
    const response = await apiPost(API_ENDPOINTS.GOOGLE_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // Google 토큰 갱신
  async googleRefresh(refreshToken) {
    const response = await apiPost(API_ENDPOINTS.GOOGLE_REFRESH, {
      refreshToken,
    });
    return handleApiResponse(response);
  },

  // Kakao OAuth 로그인
  async kakaoLogin(authCode) {
    const response = await apiPost(API_ENDPOINTS.KAKAO_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // Kakao 토큰 갱신
  async kakaoRefresh(refreshToken) {
    const response = await apiPost(API_ENDPOINTS.KAKAO_REFRESH, {
      refreshToken,
    });
    return handleApiResponse(response);
  },

  // Naver OAuth 로그인
  async naverLogin(authCode) {
    const response = await apiPost(API_ENDPOINTS.NAVER_LOGIN, {
      code: authCode,
    });
    return handleApiResponse(response);
  },

  // Naver 토큰 갱신
  async naverRefresh(refreshToken) {
    const response = await apiPost(API_ENDPOINTS.NAVER_REFRESH, {
      refreshToken,
    });
    return handleApiResponse(response);
  },

  // 로그아웃
  async logout() {
    const response = await apiPost(API_ENDPOINTS.LOGOUT);
    return handleApiResponse(response);
  },

  // 프로필 정보 조회
  async getProfileInfo() {
    const response = await apiGet(API_ENDPOINTS.PROFILE_INFO);
    return handleApiResponse(response);
  },

  // 소셜 로그인 (기존 방식 유지)
  async socialLogin(provider, loginData) {
    const endpoint =
      provider === "google" ? API_ENDPOINTS.GOOGLE_LOGIN : API_ENDPOINTS.LOGIN;
    const response = await apiPost(endpoint, loginData);
    return handleApiResponse(response);
  },

  // 추가 정보 입력 (통합)
  async addUserInfo(userId, userInfo) {
    const endpoint = `${API_ENDPOINTS.ADD_INFO}?userId=${userId}`;
    const response = await apiPost(endpoint, userInfo);
    return handleApiResponse(response);
  },

  // 회원가입 상태 확인
  async getUserRegistrationStatus(userId) {
    const endpoint = `${API_ENDPOINTS.ADD_INFO}/status?userId=${userId}`;
    const response = await apiGet(endpoint);
    return handleApiResponse(response);
  },

  // 현재 로그인된 사용자 정보 조회
  async getCurrentUserInfo() {
    const response = await apiGet(API_ENDPOINTS.CURRENT_USER_INFO);
    return handleApiResponse(response); 
  }
};
