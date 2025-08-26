import { apiPost } from '@/utils/api'

export const adminLoginService = {
  // 관리자 로그인
  async login(email, password) {
    try {
      const response = await apiPost('/admin/login', {
        email,
        password
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '로그인에 실패했습니다.')
      }
      
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  // 토큰 재발급
  async refreshToken(refreshToken) {
    try {
      const response = await apiPost('/admin/refresh', {
        refreshToken
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '토큰 재발급에 실패했습니다.')
      }
      
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  // 로그아웃
  async logout(refreshToken) {
    try {
      const response = await apiPost('/admin/logout', {
        refreshToken
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '로그아웃에 실패했습니다.')
      }
    } catch (error) {
      throw error
    }
  }
}
