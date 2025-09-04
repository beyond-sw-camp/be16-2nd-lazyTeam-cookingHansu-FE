import { apiClient } from '../../utils/interceptor';

export const adminLoginService = {
  // 관리자 로그인
  async login(email, password) {
    const response = await apiClient.post('/admin/login', { email, password });
    return response.data;
  },

  // 토큰 재발급
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/admin/refresh', { refreshToken });
    return response.data;
  },

  // 로그아웃
  async logout(refreshToken) {
    await apiClient.post('/admin/logout', { refreshToken });
  }
};
