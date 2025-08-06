<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // 앱 시작 시 인증 상태 초기화
  if (authStore.token && !authStore.user) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.error('Failed to initialize auth state:', error)
    }
  }
})
</script>