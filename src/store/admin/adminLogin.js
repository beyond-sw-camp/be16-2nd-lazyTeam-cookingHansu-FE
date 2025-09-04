import { defineStore } from 'pinia'
import { adminLoginService } from '@/services/admin/adminLoginService'
import { useAuthStore } from '@/store/auth/auth'
import router from '@/router'

export const useAdminLoginStore = defineStore('adminLogin', {
  state: () => ({
    admin: null,
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.admin,
    adminName: (state) => state.admin?.adminName || '관리자님',
    adminEmail: (state) => state.admin?.adminEmail || '',
    adminId: (state) => state.admin?.adminId || null
  },

  actions: {
    // 로그인
    async login(email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await adminLoginService.login(email, password)
        
        // 응답 데이터 저장
        const adminData = response.data || response
        
        this.admin = {
          adminId: adminData.adminId,
          adminName: adminData.adminName,
          adminEmail: adminData.adminEmail
        }
        this.accessToken = adminData.accessToken
        this.refreshToken = adminData.refreshToken
        this.expiresIn = adminData.expiresIn
        
        // 로컬 스토리지에 저장
        localStorage.setItem('adminAccessToken', adminData.accessToken)
        localStorage.setItem('adminRefreshToken', adminData.refreshToken)
        localStorage.setItem('adminInfo', JSON.stringify(this.admin))
        
        // useAuthStore의 사용자 정보도 업데이트 (라우터 가드에서 권한 확인용)
        const authStore = useAuthStore()
        authStore.setAdminAuth({
          accessToken: adminData.accessToken,
          refreshToken: adminData.refreshToken,
          expiresIn: adminData.expiresIn,
          user: {
            id: adminData.adminId,
            email: adminData.adminEmail,
            nickname: adminData.adminName,
            role: 'admin'
          }
        })
        
        // 대시보드로 이동
        router.push('/admin')
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || '로그인에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 토큰 재발급
    async refreshToken() {
      if (!this.refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.')
      }

      try {
        const response = await adminLoginService.refreshToken(this.refreshToken)
        
        this.accessToken = response.accessToken
        this.refreshToken = response.refreshToken
        this.expiresIn = response.expiresIn
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('adminAccessToken', response.accessToken)
        localStorage.setItem('adminRefreshToken', response.refreshToken)
        
        return response
      } catch (error) {
        // 토큰 재발급 실패 시 로그아웃
        await this.logout()
        throw error
      }
    },

    // 로그아웃
    async logout() {
      try {
        if (this.refreshToken) {
          await adminLoginService.logout(this.refreshToken)
        }
      } catch (error) {
        console.error('로그아웃 중 오류:', error)
      } finally {
        // 상태 초기화
        this.admin = null
        this.accessToken = null
        this.refreshToken = null
        this.expiresIn = null
        this.error = null
        
        // 로컬 스토리지 클리어
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        localStorage.removeItem('adminInfo')
        
        // useAuthStore의 상태도 정리
        const authStore = useAuthStore()
        authStore.clearAuth()
        
        // 로그인 페이지로 이동
        router.push('/admin-login')
      }
    },

    // 초기화 (페이지 새로고침 시)
    initialize() {
      const accessToken = localStorage.getItem('adminAccessToken')
      const refreshToken = localStorage.getItem('adminRefreshToken')
      const adminInfo = localStorage.getItem('adminInfo')
      
      if (accessToken && refreshToken && adminInfo) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.admin = JSON.parse(adminInfo)
        
        // useAuthStore도 함께 초기화
        const authStore = useAuthStore()
        authStore.setAdminAuth({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresIn: null,
          user: {
            id: JSON.parse(adminInfo).adminId,
            email: JSON.parse(adminInfo).adminEmail,
            nickname: JSON.parse(adminInfo).adminName,
            role: 'admin'
          }
        })
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null
    }
  }
})
