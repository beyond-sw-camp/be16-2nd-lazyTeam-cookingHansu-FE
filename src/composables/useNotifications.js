import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/store/notification/notification.js'

export function useNotifications() {
  const notificationStore = useNotificationStore()
  const isConnected = ref(false)
  
    // 임시 사용자 ID
  const getCurrentUserId = () => {
    // return useAuthStore().user?.id
    // 실제 생성된 사용자 ID
  }


  // 실시간 알림 연결 시작
  const startNotificationStream = () => {
    const userId = getCurrentUserId()
    if (userId) {
      notificationStore.connectToNotificationStream(userId)
      isConnected.value = true
    }
  }

  // 실시간 알림 연결 중지
  const stopNotificationStream = () => {
    notificationStore.disconnectFromNotificationStream()
          isConnected.value = false
  }

  // 알림 목록 불러오기
  const loadNotifications = async () => {
    const userId = getCurrentUserId()
    if (userId) {
      try {
        await notificationStore.fetchNotifications({ userId })
      } catch (error) {
        console.error('알림 목록 로드 실패:', error)
      }
    }
  }

  // 알림 읽음 처리
  const markNotificationAsRead = async (notificationId) => {
    const userId = getCurrentUserId()
    if (userId && notificationId) {
      try {
        await notificationStore.markAsRead(notificationId, userId)
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
      }
    }
  }

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      console.log('브라우저 알림 권한:', permission)
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // 컴포넌트 마운트시 자동 연결
  onMounted(async () => {
    await requestNotificationPermission()
    await loadNotifications()
    startNotificationStream()
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
