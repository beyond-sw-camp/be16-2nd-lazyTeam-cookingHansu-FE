import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notification/notificationService.js'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const hasMore = ref(true)
  const notificationSettings = ref({
    postCommentEnabled: true,
    qnaCommentEnabled: true,
    replyEnabled: true,
    approvalEnabled: true,
    chatEnabled: true,
    paymentEnabled: true,
    noticeEnabled: true
  })

  // 실시간 알림 연결
  const eventSource = ref(null)
  const isConnected = ref(false)

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(notification => !notification.isRead)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(notification => notification.isRead)
  )

  const notificationsByType = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      const type = notification.targetType
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(notification)
    })
    return grouped
  })

  // Actions
  
  /**
   * 알림 목록 조회
   * @param {Object} params - 조회 파라미터
   */
  const fetchNotifications = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await notificationService.getNotifications({
        page: 1,
        size: 20,
        ...params
      })
      
      notifications.value = response.notifications
      currentPage.value = response.currentPage
      totalPages.value = response.totalPages
      hasMore.value = response.hasNext
      
      // 읽지 않은 알림 개수 업데이트
      await updateUnreadCount()
      
    } catch (err) {
      error.value = err.message
      console.error('알림 조회 실패:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 더 많은 알림 로드 (페이지네이션)
   */
  const loadMoreNotifications = async () => {
    if (!hasMore.value || loading.value) return

    loading.value = true
    
    try {
      const response = await notificationService.getNotifications({
        page: currentPage.value + 1,
        size: 20
      })
      
      // 기존 알림에 추가
      notifications.value.push(...response.notifications)
      currentPage.value = response.currentPage
      hasMore.value = response.hasNext
      
      return { hasMore: hasMore.value }
    } catch (err) {
      error.value = err.message
      console.error('추가 알림 로드 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 특정 알림을 읽음으로 표시
   * @param {number} notificationId - 알림 ID
   */
  const markAsRead = async (notificationId) => {
    try {
      // 개발 중에는 서비스 호출 스킵
      // await notificationService.markAsRead(notificationId)
      
      // 로컬 상태 업데이트
      const notification = notifications.value.find(n => n.id === notificationId)
      
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      error.value = err.message
      console.error('알림 읽음 처리 실패:', err)
      throw err
    }
  }

  /**
   * 모든 알림을 읽음으로 표시
   */
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      
      // 로컬 상태 업데이트
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
      unreadCount.value = 0
    } catch (err) {
      error.value = err.message
      console.error('전체 알림 읽음 처리 실패:', err)
      throw err
    }
  }

  /**
   * 특정 알림 삭제
   * @param {number} notificationId - 알림 ID
   */
  const deleteNotification = async (notificationId) => {
    try {
      // 개발 중에는 서비스 호출 스킵
      // await notificationService.deleteNotification(notificationId)
      
      // 로컬 상태에서 제거
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      console.error('알림 삭제 실패:', err)
      throw err
    }
  }

  /**
   * 읽지 않은 알림 개수 업데이트
   */
  const updateUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      unreadCount.value = count
    } catch (err) {
      console.error('읽지 않은 알림 개수 조회 실패:', err)
    }
  }

  /**
   * 알림 설정 조회
   */
  const fetchNotificationSettings = async () => {
    try {
      const settings = await notificationService.getNotificationSettings()
      notificationSettings.value = { ...notificationSettings.value, ...settings }
    } catch (err) {
      error.value = err.message
      console.error('알림 설정 조회 실패:', err)
      throw err
    }
  }

  /**
   * 알림 설정 업데이트
   * @param {Object} settings - 업데이트할 설정
   */
  const updateNotificationSettings = async (settings) => {
    try {
      await notificationService.updateNotificationSettings(settings)
      notificationSettings.value = { ...notificationSettings.value, ...settings }
    } catch (err) {
      error.value = err.message
      console.error('알림 설정 업데이트 실패:', err)
      throw err
    }
  }

  /**
   * 실시간 알림 연결 시작
   */
  const connectToNotificationStream = () => {
    if (eventSource.value) {
      disconnectFromNotificationStream()
    }

    eventSource.value = notificationService.connectToNotificationStream(
      // 새 알림 수신 콜백
      (notification) => {
        // 새 알림을 목록 맨 앞에 추가
        notifications.value.unshift(notification)
        
        // 읽지 않은 알림 개수 증가
        if (!notification.isRead) {
          unreadCount.value += 1
        }
        
        // 브라우저 알림 표시 (권한이 있는 경우)
        showBrowserNotification(notification)
      },
      // 에러 콜백
      (error) => {
        console.error('실시간 알림 연결 에러:', error)
        isConnected.value = false
        
        // 재연결 시도 (3초 후)
        setTimeout(() => {
          if (!isConnected.value) {
            connectToNotificationStream()
          }
        }, 3000)
      }
    )

    if (eventSource.value) {
      isConnected.value = true
      
      // 연결 상태 모니터링
      eventSource.value.onopen = () => {
        isConnected.value = true
        console.log('실시간 알림 연결됨')
      }
    }
  }

  /**
   * 실시간 알림 연결 해제
   */
  const disconnectFromNotificationStream = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
      console.log('실시간 알림 연결 해제됨')
    }
  }

  /**
   * 브라우저 알림 표시
   * @param {Object} notification - 알림 객체
   */
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      }

      const browserNotification = new Notification(notification.title, options)
      
      // 3초 후 자동 닫기
      setTimeout(() => {
        browserNotification.close()
      }, 3000)
      
      // 클릭 시 해당 페이지로 이동
      browserNotification.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        browserNotification.close()
      }
    }
  }

  /**
   * 브라우저 알림 권한 요청
   */
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  /**
   * 새 알림 추가 (테스트용)
   * @param {Object} notification - 알림 객체
   */
  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification
    })
    
    if (!notification.isRead) {
      unreadCount.value += 1
    }
  }

  /**
   * 상태 초기화
   */
  const resetState = () => {
    notifications.value = []
    unreadCount.value = 0
    loading.value = false
    error.value = null
    currentPage.value = 1
    totalPages.value = 0
    hasMore.value = true
    disconnectFromNotificationStream()
  }

  /**
   * 테스트용 더미 데이터 초기화
   */
  const initTestData = () => {
    // 이미 데이터가 있으면 초기화하지 않음
    if (notifications.value.length > 0) {
      return
    }
    const testNotifications = [
      {
        id: 1,
        title: '새로운 댓글이 달렸습니다',
        message: '김요리님이 "맛있는 김치찌개 만들기" 레시피에 댓글을 남겼습니다: "정말 맛있어 보여요!"',
        targetType: 'POSTCOMMENT',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
        relatedId: 123
      },
      {
        id: 2,
        title: '회원가입이 승인되었습니다',
        message: '쿠킹한수 회원가입이 승인되었습니다. 이제 모든 서비스를 이용하실 수 있습니다.',
        targetType: 'APPROVAL',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
        relatedId: null
      },
      {
        id: 3,
        title: '새로운 채팅 메시지',
        message: '홍길동님으로부터 새로운 메시지가 도착했습니다.',
        targetType: 'CHAT',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전
        relatedId: null
      },
      {
        id: 4,
        title: '강의 결제가 완료되었습니다',
        message: '"프로 셰프의 파스타 클래스" 강의 결제가 성공적으로 완료되었습니다.',
        targetType: 'PAYMENT',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
        relatedId: 456
      },
      {
        id: 5,
        title: '새로운 공지사항',
        message: '서비스 이용약관이 업데이트되었습니다. 확인해주세요.',
        targetType: 'NOTICE',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
        relatedId: 789
      },
      {
        id: 6,
        title: '답글이 달렸습니다',
        message: '이수진님이 회원님의 댓글에 답글을 남겼습니다.',
        targetType: 'REPLY',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
        relatedId: 321
      },
      {
        id: 7,
        title: 'Q&A에 답변이 달렸습니다',
        message: '관리자가 "강의 환불 관련 문의"에 답변을 남겼습니다.',
        targetType: 'QNACOMMENT',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
        relatedId: 654
      }
    ]
    
    notifications.value = testNotifications
    unreadCount.value = testNotifications.filter(n => !n.isRead).length
  }

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,
    hasMore,
    notificationSettings,
    isConnected,
    
    // Getters
    unreadNotifications,
    readNotifications,
    notificationsByType,
    
    // Actions
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateUnreadCount,
    fetchNotificationSettings,
    updateNotificationSettings,
    connectToNotificationStream,
    disconnectFromNotificationStream,
    requestNotificationPermission,
    addNotification,
    resetState,
    initTestData
  }
})

export default useNotificationStore
