import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '@/utils/api.js'
import { ssePolyfillService } from './ssePolyfillService'

export const notificationService = {
  /**
   * 읽지 않은 알림 개수 조회 (헤더용 - 가벼운 API)
   * @returns {Promise<number>} 읽지 않은 알림 개수
   */
  async getUnreadCount() {
    try {
      const response = await apiGet('/api/notifications/unread/count')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 백엔드 응답 구조에 맞게 수정
      return result.data || 0
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
      return 0
    }
  },

  /**
   * 알림 목록 조회 (커서 기반 페이지네이션)
   * @param {Object} params - 조회 파라미터
   * @param {string} params.cursor - 커서 (첫 페이지는 null)
   * @param {number} params.size - 페이지 크기 (기본값: 10)
   * @returns {Promise<Object>} 알림 목록 및 커서 정보
   */
  async getNotifications(params = {}) {
    try {
      const { cursor = null, size = 10 } = params;
      
      let endpoint = `/api/notifications?size=${size}`;
      if (cursor) {
        endpoint += `&cursor=${cursor}`;
      }

      const response = await apiGet(endpoint)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 백엔드 응답 구조에 맞게 수정 (커서 기반)
      const responseData = result.data || {}
      
      return {
        notifications: responseData.notifications || [],
        nextCursor: responseData.nextCursor || null,
        hasNext: responseData.hasNext || false,
        size: size
      }
    } catch (error) {
      console.error('알림 목록 조회 실패:', error)
      throw new Error('알림을 불러오는데 실패했습니다.')
    }
  },

  /**
   * 특정 알림을 읽음으로 표시
   * @param {string} notificationId - 알림 ID
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiPatch(`/api/notifications/${notificationId}/read`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      throw new Error('알림 상태 업데이트에 실패했습니다.')
    }
  },

  /**
   * 특정 알림 삭제
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiDelete(`/api/notifications/${notificationId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      throw new Error('알림 삭제에 실패했습니다.')
    }
  },

  /**
   * SSE 연결 및 알림 구독
   * @returns {EventSourcePolyfill} SSE 연결 객체
   */
  subscribeToNotifications() {
    try {
      return ssePolyfillService.createAuthenticatedEventSource(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/notifications/subscribe`
      )
    } catch (error) {
      console.error('SSE 구독 시작 실패:', error)
      throw error
    }
  },

  /**
   * 실시간 알림을 위한 SSE Polyfill 연결 (JWT 토큰 인증 포함)
   * @param {Function} onMessage - 새 알림을 받았을 때 실행될 콜백
   * @param {Function} onError - 에러 발생 시 실행될 콜백
   * @returns {EventSourcePolyfill} SSE Polyfill 연결 객체
   */
  connectToNotificationStream(onMessage, onError) {
    try {
      // SSE Polyfill을 사용하여 JWT 토큰을 헤더에 포함
      const eventSource = ssePolyfillService.createAuthenticatedEventSource(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/notifications/subscribe`
      )

      // 연결 성공 이벤트
      eventSource.addEventListener('connect', (event) => {
        console.log('SSE Polyfill 연결 성공:', event.data)
      })

      // 실시간 알림 수신 이벤트
      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data)
          onMessage(notification)
        } catch (error) {
          console.error('실시간 알림 파싱 실패:', error)
        }
      })

      eventSource.onerror = (error) => {
        console.error('SSE Polyfill 연결 에러:', error)
        if (onError) {
          onError(error)
        }
      }

      return eventSource
    } catch (error) {
      console.error('SSE Polyfill 연결 실패:', error)
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
