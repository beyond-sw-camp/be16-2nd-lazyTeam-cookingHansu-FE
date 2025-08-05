import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const login = async (authCode) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/user/google/login`, {
        code: authCode
      })
      
      const { accessToken, refreshToken, user: userData, isNewUser } = response.data
      
      setToken(accessToken)
      setUser(userData)
      
      // axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      return { isNewUser, userData }
    } catch (error) {
      console.error('Google OAuth login error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      setUser(response.data)
      return true
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
      return false
    }
  }

  // Initialize axios header if token exists
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    user,
    token,
    isAuthenticated,
    setToken,
    setUser,
    login,
    logout,
    checkAuth
  }
}) 