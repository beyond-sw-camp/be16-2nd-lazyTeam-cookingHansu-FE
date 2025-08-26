<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth/auth'
import { useNotificationStore } from '@/store/notification/notification.js'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

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

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && authStore.user?.id) {
    console.log('사용자 로그인, 알림 연결 시작:', authStore.user.id)
    notificationStore.connectToNotificationStream(authStore.user.id)
  } else if (!isAuthenticated) {
    console.log(' 사용자 로그아웃, 알림 연결 해제')
    notificationStore.disconnectFromNotificationStream()
  }
}, { immediate: true })
</script>