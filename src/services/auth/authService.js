import { 
  apiGet, 
  apiPost,
  apiPostFormData
} from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LOGIN: '/user/login',
  GOOGLE_LOGIN: '/user/google/login',
  GOOGLE_REFRESH: '/user/google/refresh',
  LOGOUT: '/user/logout',
  REGISTER: '/user/register',
  VERIFY_TOKEN: '/user/verify-token',
  ADD_INFO: '/user/add-info',
  AUTH_DETAIL: '/user/auth-detail',
  COMPLETE_REGISTRATION: '/user/complete-registration',
};

export const authService = {
  // 일반 로그인
  async login(loginData) {
    const response = await apiPost(API_ENDPOINTS.LOGIN, loginData);
    return handleApiResponse(response);
  },

  // Google OAuth 로그인
  async googleLogin(authCode) {
    const response = await apiPost(API_ENDPOINTS.GOOGLE_LOGIN, { code: authCode });
    return handleApiResponse(response);
  },

  // Google 토큰 갱신
  async googleRefresh(refreshToken) {
    const response = await apiPost(API_ENDPOINTS.GOOGLE_REFRESH, { refreshToken });
    return handleApiResponse(response);
  },

  // 로그아웃
  async logout() {
    const response = await apiPost(API_ENDPOINTS.LOGOUT);
    return handleApiResponse(response);
  },

  // 회원가입
  async register(userData) {
    const response = await apiPost(API_ENDPOINTS.REGISTER, userData);
    return handleApiResponse(response);
  },

  // 토큰 검증
  async verifyToken(token) {
    const response = await apiGet(`${API_ENDPOINTS.VERIFY_TOKEN}?token=${token}`);
    return handleApiResponse(response);
  },

  // 소셜 로그인 (기존 방식 유지)
  async socialLogin(provider, loginData) {
    const endpoint = provider === 'google' ? API_ENDPOINTS.GOOGLE_LOGIN : API_ENDPOINTS.LOGIN;
    const response = await apiPost(endpoint, loginData);
    return handleApiResponse(response);
  },

  // 추가 정보 입력
  async addUserInfo(userInfo) {
    const response = await apiPost(API_ENDPOINTS.ADD_INFO, userInfo);
    return handleApiResponse(response);
  },

  // 인증 상세 정보 입력 (FormData 지원)
  async addAuthDetail(authDetail) {
    let response;
    
    // FormData인지 확인
    if (authDetail instanceof FormData) {
      response = await apiPostFormData(API_ENDPOINTS.AUTH_DETAIL, authDetail);
    } else {
      response = await apiPost(API_ENDPOINTS.AUTH_DETAIL, authDetail);
    }
    
    return handleApiResponse(response);
  },

  // 최종 회원가입 완료 (localStorage 데이터 기반)
  async completeRegistration(userId) {
    const { getCompleteRegistrationData } = await import('../../utils/userRegistration');
    const registrationData = getCompleteRegistrationData();
    
    // userId를 쿼리 파라미터로 포함
    const endpoint = `${API_ENDPOINTS.ADD_INFO}?userId=${userId}`;
    const response = await apiPost(endpoint, registrationData);
    return handleApiResponse(response);
  }
};
