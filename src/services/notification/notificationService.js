import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '@/utils/api.js'

export const notificationService = {
  /**
   * 알림 목록 조회
   * @param {Object} params - 페이징 및 필터 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지 크기 (기본값: 20)
   * @param {string} params.targetType - 알림 타입 필터
   * @param {boolean} params.isRead - 읽음 상태 필터터
   * @returns {Promise<Object>} 알림 목록과 페이징 정보
   */
  async getNotifications(params = {}) {
    try {
      const {
        page = 1,
        size = 20,
        targetType,
        isRead
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      if (targetType && targetType !== 'ALL') {
        queryParams.append('targetType', targetType)
      }

      if (typeof isRead === 'boolean') {
        queryParams.append('isRead', isRead.toString())
      }

      const response = await apiGet(`/notifications?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        notifications: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number + 1,
        hasNext: !data.last,
        hasPrevious: !data.first
      }
    } catch (error) {
      console.error('알림 목록 조회 실패:', error)
      throw new Error('알림을 불러오는데 실패했습니다.')
    }
  },

  /**
   * 특정 알림을 읽음으로 표시
   * @param {number} notificationId
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiPatch(`/notifications/${notificationId}/read`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      throw new Error('알림 상태 업데이트에 실패했습니다.')
    }
  },

  /**
   * 모든 알림을 읽음으로 표시
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    try {
      const response = await apiPatch('/notifications/read-all')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error)
      throw new Error('알림 상태 업데이트에 실패했습니다.')
    }
  },

  /**
   * 특정 알림 삭제
   * @param {number} notificationId
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiDelete(`/notifications/${notificationId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      throw new Error('알림 삭제에 실패했습니다.')
    }
  },

  /**
   * 읽지 않은 알림 개수 조회
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    try {
      const response = await apiGet('/notifications/unread-count')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.count || 0
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
      return 0
    }
  },

  /**
   * 알림 설정 조회
   * @returns {Promise<Object>}
   */
  async getNotificationSettings() {
    try {
      const response = await apiGet('/notifications/settings')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data || {}
    } catch (error) {
      console.error('알림 설정 조회 실패:', error)
      throw new Error('알림 설정을 불러오는데 실패했습니다.')
    }
  },

  /**
   * 알림 설정 업데이트
   * @param {Object} settings - 업데이트할 알림 설정
   * @param {boolean} settings.postCommentEnabled - 게시글 댓글 알림 활성화
   * @param {boolean} settings.qnaCommentEnabled - Q&A 댓글 알림 활성화
   * @param {boolean} settings.replyEnabled - 답글 알림 활성화
   * @param {boolean} settings.approvalEnabled - 승인 알림 활성화
   * @param {boolean} settings.chatEnabled - 채팅 알림 활성화
   * @param {boolean} settings.paymentEnabled - 결제 알림 활성화
   * @param {boolean} settings.noticeEnabled - 공지사항 알림 활성화
   * @returns {Promise<void>}
   */
  async updateNotificationSettings(settings) {
    try {
      const response = await apiPut('/notifications/settings', settings)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error)
      throw new Error('알림 설정 저장에 실패했습니다.')
    }
  },

  /**
   * 실시간 알림을 위한 SSE 연결
   * @param {Function} onMessage - 새 알림을 받았을 때 실행될 콜백
   * @param {Function} onError - 에러 발생 시 실행될 콜백
   * @returns {EventSource} SSE 연결 객체
   */
  connectToNotificationStream(onMessage, onError) {
    try {
      const eventSource = new EventSource('/api/notifications/stream', {
        withCredentials: true
      })

      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          onMessage(notification)
        } catch (error) {
          console.error('실시간 알림 파싱 실패:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('실시간 알림 연결 에러:', error)
        if (onError) {
          onError(error)
        }
      }

      return eventSource
    } catch (error) {
      console.error('실시간 알림 연결 실패:', error)
      if (onError) {
        onError(error)
      }
      return null
    }
  }
}

/**
 * 알림 타입별 메타데이터
 */
export const NOTIFICATION_TYPES = {
  POSTCOMMENT: {
    name: '게시글 댓글',
    icon: '💬',
    color: '#1976d2',
    description: '게시글에 새로운 댓글이 달렸을 때'
  },
  QNACOMMENT: {
    name: 'Q&A 댓글',
    icon: '❓',
    color: '#1976d2',
    description: 'Q&A에 새로운 댓글이 달렸을 때'
  },
  REPLY: {
    name: '답글',
    icon: '↩️',
    color: '#1976d2',
    description: '내 댓글에 답글이 달렸을 때'
  },
  APPROVAL: {
    name: '승인',
    icon: '✅',
    color: '#388e3c',
    description: '회원가입이 승인되었을 때'
  },
  CHAT: {
    name: '채팅',
    icon: '💬',
    color: '#1976d2',
    description: '새로운 채팅 메시지가 도착했을 때'
  },
  PAYMENT: {
    name: '결제',
    icon: '💳',
    color: '#f57c00',
    description: '강의 결제가 완료되었을 때'
  },
  NOTICE: {
    name: '공지사항',
    icon: '📢',
    color: '#7b1fa2',
    description: '새로운 공지사항이 등록되었을 때'
  }
}

export default notificationService
