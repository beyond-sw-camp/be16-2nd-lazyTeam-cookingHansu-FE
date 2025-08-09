import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import notificationService from '@/services/notification/notificationService.js'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const hasMore = ref(true)

  // 알림 설정
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
    notifications.value.filter(n => !n.isRead)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.isRead)
  )

  const notificationsByType = computed(() => (type) => 
    notifications.value.filter(n => n.targetType === type)
  )

  /**
   * 알림 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.userId - 사용자 ID
   * @param {number} params.page - 페이지 번호 (선택)
   * @param {number} params.size - 페이지 크기 (선택)
   */
  const fetchNotifications = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const { userId } = params
      
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.')
      }
      
      const response = await notificationService.getNotifications({ userId })
      
      // 알림 정렬: 읽지 않은 알림 -> 읽은 알림 순서
      const sortedNotifications = response.notifications.sort((a, b) => {
        // 1순위: 읽음 상태 (읽지 않은 것이 위로)
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1
        }
        // 2순위: 생성 시간 (최신 순)
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      
      notifications.value = sortedNotifications
      currentPage.value = response.currentPage
      totalPages.value = response.totalPages
      hasMore.value = response.hasNext
      
      // 읽지 않은 알림 개수 업데이트
      const unreadNotifications = response.notifications.filter(n => !n.isRead)
      unreadCount.value = unreadNotifications.length
      
    } catch (err) {
      error.value = err.message
      console.error('알림 조회 실패:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 더 많은 알림 로드 (페이지네이션)
   * @returns {Promise<Object>} 로드 결과
   */
  const loadMoreNotifications = async () => {
    if (!hasMore.value || loading.value) {
      return { hasMore: hasMore.value }
    }

    loading.value = true
    error.value = null

    try {
      const response = await notificationService.getNotifications({
        page: currentPage.value + 1,
        size: 10
      })

      // 새로운 알림을 기존 목록에 추가
      notifications.value.push(...response.notifications)
      
      currentPage.value = response.currentPage
      totalPages.value = response.totalPages
      hasMore.value = response.hasNext

      return { hasMore: hasMore.value }
    } catch (err) {
      error.value = err.message
      console.error('추가 알림 로드 실패:', err)
      return { hasMore: hasMore.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 특정 알림을 읽음으로 표시
   * @param {number} notificationId - 알림 ID
   * @param {string} userId - 사용자 ID
   */
  const markAsRead = async (notificationId, userId) => {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.')
      }
      
      // 백엔드 API 호출
      await notificationService.markAsRead(notificationId, userId)
      
      // 로컬 상태 업데이트
      const notification = notifications.value.find(n => n.id === notificationId)
      
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        
        // 읽음 처리 후 알림 목록 재정렬
        notifications.value.sort((a, b) => {
          // 1순위: 읽음 상태 (읽지 않은 것이 위로)
          if (a.isRead !== b.isRead) {
            return a.isRead ? 1 : -1
          }
          // 2순위: 생성 시간 (최신 순)
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
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
  const deleteNotification = async (notificationId, userId) => {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.')
      }
      
      // 백엔드 API 호출
      await notificationService.deleteNotification(notificationId, userId)
      
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
   * @param {number} count - 새로운 개수
   */
  const updateUnreadCount = (count) => {
    unreadCount.value = Math.max(0, count)
  }

  /**
   * 알림 설정 조회
   * @returns {Promise<Object>} 알림 설정
   */
  const fetchNotificationSettings = async () => {
    try {
      const settings = await notificationService.getNotificationSettings()
      notificationSettings.value = { ...notificationSettings.value, ...settings }
      return settings
    } catch (err) {
      error.value = err.message
      console.error('알림 설정 조회 실패:', err)
      throw err
    }
  }

  /**
   * 알림 설정 업데이트
   * @param {Object} settings - 새로운 설정
   * @returns {Promise<void>}
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
   * 실시간 알림 스트림 연결
   * @param {string} userId - 사용자 ID
   */
  const connectToNotificationStream = (userId) => {
    if (!userId) {
      console.error('실시간 알림 연결 실패: 사용자 ID가 필요합니다.')
      return
    }

    if (eventSource.value) {
      disconnectFromNotificationStream()
    }

    eventSource.value = notificationService.connectToNotificationStream(
      userId,
      // 새 알림 수신 콜백
      (notification) => {
        // 새 알림을 목록에 추가
        notifications.value.unshift(notification)
        
        // 알림 목록 재정렬: 읽지 않은 알림이 위로
        notifications.value.sort((a, b) => {
          // 1순위: 읽음 상태 (읽지 않은 것이 위로)
          if (a.isRead !== b.isRead) {
            return a.isRead ? 1 : -1
          }
          // 2순위: 생성 시간 (최신 순)
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        
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
            connectToNotificationStream(userId)
          }
        }, 3000)
      }
    )

    isConnected.value = true
  }

  /**
   * 실시간 알림 스트림 연결 해제
   */
  const disconnectFromNotificationStream = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
    }
  }

  /**
   * 브라우저 알림 표시
   * @param {Object} notification - 알림 객체
   */
  const showBrowserNotification = (notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    try {
      const browserNotification = new Notification(getNotificationTitle(notification), {
        body: notification.content,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      })

      // 5초 후 자동 닫기
      setTimeout(() => {
        browserNotification.close()
      }, 5000)

      // 클릭 시 알림을 읽음으로 표시하고 관련 페이지로 이동
      browserNotification.onclick = () => {
        markAsRead(notification.id)
        browserNotification.close()
      }
    } catch (error) {
      console.error('브라우저 알림 표시 실패:', error)
    }
  }

  /**
   * 알림 타입별 제목 생성
   * @param {Object} notification - 알림 객체
   * @returns {string} 알림 제목
   */
  const getNotificationTitle = (notification) => {
    const typeMap = {
      POSTCOMMENT: '새 댓글',
      QNACOMMENT: 'Q&A 댓글',
      REPLY: '새 답글',
      APPROVAL: '승인 알림',
      CHAT: '새 메시지',
      PAYMENT: '결제 알림',
      NOTICE: '새 공지사항'
    }
    return typeMap[notification.targetType] || '새 알림'
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
    const newNotification = {
      id: Date.now(),
      ...notification,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    notifications.value.unshift(newNotification)
    if (!newNotification.isRead) {
      unreadCount.value += 1
    }
  }

  /**
   * 알림 상태 초기화
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
    resetState
  }
})

export default useNotificationStore