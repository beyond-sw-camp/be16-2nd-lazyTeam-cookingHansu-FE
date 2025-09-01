export const adminLoginService = {
  // 관리자 로그인 (토큰 불필요)
  async login(email, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          email,
          password
        })
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

  // 토큰 재발급 (관리자 토큰 사용)
  async refreshToken(refreshToken) {
    try {
      const adminAccessToken = localStorage.getItem('adminAccessToken')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/admin/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${adminAccessToken}`
        },
        body: JSON.stringify({
          refreshToken
        })
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

  // 로그아웃 (관리자 토큰 사용)
  async logout(refreshToken) {
    try {
      const adminAccessToken = localStorage.getItem('adminAccessToken')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${adminAccessToken}`
        },
        body: JSON.stringify({
          refreshToken
        })
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
