<template>
  <v-app>
    <router-view />
    
    <!-- 전역 승인 알림 모달 -->
    <ApprovalNotificationModal 
      :isVisible="notificationStore.showApprovalModal"
      @close="notificationStore.closeApprovalModal"
    />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth/auth'
import { useNotificationStore } from '@/store/notification/notification'
import ApprovalNotificationModal from '@/components/notification/ApprovalNotificationModal.vue'

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
</script>