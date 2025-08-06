// Auth 관련 상태 관리 스토어
// OAuth2 소셜 로그인 기반의 토큰 관리, 로그인 상태 관리, 사용자 정보 관리
// 토큰 만료 시간 체크, 토큰 갱신, 로그아웃 처리
// 페이지 새로고침 시 로그인 상태 복원
// Axios 인터셉터 설정 - 401 에러 시 자동 refresh

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State - Access token은 메모리에만 저장 (private 변수 역할)
  const user = ref(null)
  const _accessToken = ref(null) // private 변수로 메모리에만 저장
  const _tokenExpiry = ref(null) // 토큰 만료 시간
  const isAuthenticated = computed(() => !!_accessToken.value)

  // Refresh token 관리 함수들
  const getRefreshToken = () => {
    return sessionStorage.getItem('refreshToken')
  }

  const setRefreshToken = (token) => {
    if (token) {
      sessionStorage.setItem('refreshToken', token)
    } else {
      sessionStorage.removeItem('refreshToken')
    }
  }

  // JWT 토큰 디코딩 함수
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('JWT decode error:', error)
      return null
    }
  }

  // 토큰 만료 시간 체크
  const isTokenExpired = () => {
    if (!_accessToken.value || !_tokenExpiry.value) return true
    
    // 만료 5분 전에 refresh
    const bufferTime = 5 * 60 * 1000 // 5분
    return Date.now() >= (_tokenExpiry.value - bufferTime)
  }

  // Actions
  const setAccessToken = (newToken) => {
    _accessToken.value = newToken
    
    if (newToken) {
      // JWT 토큰에서 만료 시간 추출
      const decoded = decodeJWT(newToken)
      if (decoded && decoded.exp) {
        _tokenExpiry.value = decoded.exp * 1000 // 밀리초로 변환
      }
      
      // axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      _tokenExpiry.value = null
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  // Google OAuth 로그인 처리
  const login = async (authCode) => {
    try {
      console.log('Starting Google OAuth login with code:', authCode)
      
      // 환경 변수가 설정되지 않은 경우 기본값 사용
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      console.log('API Base URL:', apiBaseUrl)
      
      const response = await axios.post(`${apiBaseUrl}/user/google/login`, {
        code: authCode
      })
      
      console.log('Login response:', response.data)
      console.log('Response data type:', typeof response.data)
      console.log('Response data keys:', Object.keys(response.data || {}))
      
      // 응답 데이터 구조 확인 및 안전한 구조 분해 할당
      const responseData = response.data || {}
      console.log('Full response data structure:', JSON.stringify(responseData, null, 2))
      
      // 다양한 가능한 속성명으로 시도 (백엔드 응답 구조에 따라 조정)
      const accessToken = responseData.accessToken || responseData.access_token || responseData.token
      const refreshToken = responseData.refreshToken || responseData.refresh_token
      const userData = responseData.user || responseData.userData || responseData.userInfo
      const isNewUser = responseData.isNewUser || responseData.is_new_user || responseData.newUser
      
      console.log('Extracted data:', { 
        accessToken: accessToken ? 'EXISTS' : 'MISSING', 
        refreshToken: refreshToken ? 'EXISTS' : 'MISSING', 
        userData: userData ? 'EXISTS' : 'MISSING', 
        isNewUser: isNewUser,
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken ? '***' : null,
        userDataValue: userData,
        isNewUserValue: isNewUser
      })
      
      // 각 속성별로 개별 확인
      console.log('Checking individual properties:')
      console.log('- accessToken:', responseData.accessToken ? 'FOUND' : 'NOT FOUND')
      console.log('- access_token:', responseData.access_token ? 'FOUND' : 'NOT FOUND')
      console.log('- token:', responseData.token ? 'FOUND' : 'NOT FOUND')
      console.log('- refreshToken:', responseData.refreshToken ? 'FOUND' : 'NOT FOUND')
      console.log('- refresh_token:', responseData.refresh_token ? 'FOUND' : 'NOT FOUND')
      console.log('- user:', responseData.user ? 'FOUND' : 'NOT FOUND')
      console.log('- userData:', responseData.userData ? 'FOUND' : 'NOT FOUND')
      console.log('- userInfo:', responseData.userInfo ? 'FOUND' : 'NOT FOUND')
      console.log('- isNewUser:', responseData.isNewUser ? 'FOUND' : 'NOT FOUND')
      console.log('- is_new_user:', responseData.is_new_user ? 'FOUND' : 'NOT FOUND')
      console.log('- newUser:', responseData.newUser ? 'FOUND' : 'NOT FOUND')
      
      // Access token은 메모리에만 저장
      console.log('Setting access token:', accessToken ? 'TOKEN_EXISTS' : 'NO_TOKEN')
      setAccessToken(accessToken)
      
      console.log('Setting user data:', userData ? 'USER_EXISTS' : 'NO_USER')
      setUser(userData)
      
      // Refresh token은 sessionStorage에 저장
      console.log('Setting refresh token:', refreshToken ? 'TOKEN_EXISTS' : 'NO_TOKEN')
      setRefreshToken(refreshToken)
      
      console.log('Login successful, tokens stored')
      console.log('Final auth state - isAuthenticated:', !!_accessToken.value)
      console.log('Final auth state - user:', user.value)
      
      return { isNewUser, userData }
    } catch (error) {
      console.error('Google OAuth login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw error
    }
  }

  // 로그아웃 처리
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (refresh token 무효화)
      if (_accessToken.value) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
        await axios.post(`${apiBaseUrl}/user/logout`, {}, {
          headers: { Authorization: `Bearer ${_accessToken.value}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 클라이언트 상태 초기화
      setAccessToken(null)
      setUser(null)
      setRefreshToken(null)
    }
  }

  // Access token 갱신
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken()
      
      if (!refreshToken) {
        console.error('No refresh token available')
        return false
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      const response = await axios.post(`${apiBaseUrl}/user/google/refresh`, {
        refreshToken: refreshToken
      })
      
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data
      
      // 새로운 access token으로 업데이트
      setAccessToken(accessToken)
      setUser(userData)
      
      // 새로운 refresh token이 있다면 업데이트
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken)
      }
      
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      // Refresh 실패 시 로그아웃 처리
      setAccessToken(null)
      setUser(null)
      setRefreshToken(null)
      return false
    }
  }

  // 인증 상태 확인
  const checkAuth = async () => {
    if (!_accessToken.value) return false
    
    // 토큰이 만료되었거나 곧 만료될 예정인 경우 refresh
    if (isTokenExpired()) {
      console.log('Token expired or expiring soon, attempting refresh')
      const refreshSuccess = await refreshAccessToken()
      if (!refreshSuccess) {
        return false
      }
    }
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      const response = await axios.get(`${apiBaseUrl}/user/me`, {
        headers: { Authorization: `Bearer ${_accessToken.value}` }
      })
      setUser(response.data)
      return true
    } catch (error) {
      console.error('Auth check error:', error)
      
      // 401 에러인 경우 refresh token으로 재시도
      if (error.response?.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          return true
        }
      }
      
      // Refresh 실패 또는 다른 에러인 경우 로그아웃
      setAccessToken(null)
      setUser(null)
      setRefreshToken(null)
      return false
    }
  }

  // 페이지 새로고침 시 로그인 상태 복원
  const restoreAuthState = async () => {
    try {
      const refreshToken = getRefreshToken()
      
      if (!refreshToken) {
        console.log('No refresh token found, skipping auth restoration')
        return false
      }

      // Refresh token을 사용하여 새로운 access token 발급 시도
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      const response = await axios.post(`${apiBaseUrl}/user/google/refresh`, {
        refreshToken: refreshToken
      })
      
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data
      
      // 새로운 access token으로 상태 복원
      setAccessToken(accessToken)
      setUser(userData)
      
      // 새로운 refresh token이 있다면 업데이트
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken)
      }
      
      console.log('Auth state restored successfully')
      return true
    } catch (error) {
      console.error('Failed to restore auth state:', error)
      // 실패 시 refresh token 제거
      setRefreshToken(null)
      return false
    }
  }

  // 주기적으로 토큰 만료 시간 체크
  const startTokenExpiryCheck = () => {
    // 1분마다 토큰 만료 시간 체크
    setInterval(async () => {
      if (_accessToken.value && isTokenExpired()) {
        console.log('Token expiring soon, refreshing...')
        await refreshAccessToken()
      }
    }, 60 * 1000) // 1분
  }

  // Axios 인터셉터 설정 - 401 에러 시 자동 refresh
  const setupAxiosInterceptors = () => {
    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        // 401 에러이고 아직 retry하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          // Refresh token으로 새로운 access token 발급
          const refreshSuccess = await refreshAccessToken()
          
          if (refreshSuccess) {
            // 새로운 token으로 원래 요청 재시도
            originalRequest.headers['Authorization'] = `Bearer ${_accessToken.value}`
            return axios(originalRequest)
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  // 초기화 시 인터셉터 설정 및 토큰 만료 체크 시작
  setupAxiosInterceptors()
  startTokenExpiryCheck()

  return {
    user,
    isAuthenticated,
    setAccessToken,
    setUser,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    restoreAuthState,
    isTokenExpired
  }
})
