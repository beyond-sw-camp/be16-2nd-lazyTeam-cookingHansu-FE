import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/store/notification/notification.js'

export function useNotifications() {
  const notificationStore = useNotificationStore()
  const isConnected = ref(false)
  
    // 임시 사용자 ID
  const getCurrentUserId = () => {
    // return useAuthStore().user?.id
    
    // 결제 알림 테스트를 위한 사용자 ID
    return '00000000-0000-0000-0000-000000000000'
  }


  // 실시간 알림 연결 시작 (SSE Polyfill 사용)
  const startNotificationStream = () => {
    try {
      // 이미 연결되어 있는지 확인
      if (notificationStore.isConnected) {
        console.log('🔍 이미 SSE 연결이 활성화되어 있습니다.');
        isConnected.value = true;
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
    console.log('🔍 컴포넌트 언마운트: 로컬 연결 상태만 업데이트');
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
      console.log('브라우저 알림 권한:', permission)
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // 컴포넌트 마운트시 자동 연결
  onMounted(async () => {
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
