import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/store/notification/notification.js'
import { useAuthStore } from '@/store/auth/auth.js'

export function useNotifications() {
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const isConnected = ref(false)
  
  // 실제 사용자 ID 반환
  const getCurrentUserId = () => {
    return authStore.user?.id
  }


  // 실시간 알림 연결 시작 (SSE Polyfill 사용)
  const startNotificationStream = () => {
    try {
      // 이미 연결되어 있는지 확인
      if (notificationStore.isConnected) {
        return;
      }
      
      // SSE Polyfill을 사용하여 JWT 토큰으로 인증
      notificationStore.startNotificationSubscription()
      isConnected.value = true
    } catch (error) {
      console.error('알림 스트림 시작 실패:', error)
      isConnected.value = false
    }
  }

  // 실시간 알림 연결 중지
  const stopNotificationStream = () => {
    // 전역 SSE 연결은 중지하지 않고 로컬 상태만 업데이트
    isConnected.value = false
  }

  // 알림 목록 불러오기
  const loadNotifications = async () => {
    try {
      await notificationStore.fetchNotifications()
    } catch (error) {
      console.error('알림 목록 로드 실패:', error)
    }
  }

  // 알림 읽음 처리
  const markNotificationAsRead = async (notificationId) => {
    if (notificationId) {
      try {
        await notificationStore.markAsRead(notificationId)
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
      }
    }
  }

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // 컴포넌트 마운트시 자동 연결
  onMounted(async () => {
    // 로그인한 사용자만 알림 구독 (관리자 제외)
    const currentUserId = getCurrentUserId()
    const userRole = authStore.user?.role
    
    if (!currentUserId) {
      console.log('비회원 - 알림 구독 건너뜀')
      return
    }
    
    if (userRole === 'ADMIN' || userRole === 'admin') {
      console.log('관리자 - 알림 구독 건너뜀')
      return
    }

    await requestNotificationPermission()
    await loadNotifications()

    // 이미 연결되어 있는지 확인하고, 연결 상태 동기화
    isConnected.value = notificationStore.isConnected;

    // 연결이 안 되어 있다면 연결 시도 (하지만 중복 방지 로직이 있음)
    if (!isConnected.value) {
      startNotificationStream()
    }
  })

  // 컴포넌트 언마운트시 연결 해제
  onUnmounted(() => {
    stopNotificationStream()
  })

  return {
    isConnected,
    notifications: notificationStore.notifications,
    unreadCount: notificationStore.unreadCount,
    loading: notificationStore.loading,
    
    startNotificationStream,
    stopNotificationStream,
    loadNotifications,
    markNotificationAsRead,
    requestNotificationPermission
  }
}