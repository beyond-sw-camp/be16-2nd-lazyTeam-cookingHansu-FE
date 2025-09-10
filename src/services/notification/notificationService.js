import { apiClient } from '@/utils/interceptor';
import { ssePolyfillService } from './ssePolyfillService';

export const notificationService = {
  /**
   * 읽지 않은 알림 개수 조회
   * @returns {Promise<number>} 읽지 않은 알림 개수
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/api/notifications/unread/count')
      
      
      // 백엔드 응답 구조에 맞게 수정
      return response.data.data || 0
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
   * 
   * @returns {Promise<Object>} 알림 목록 및 커서 정보
   */
  async getNotifications(params = {}) {
    try {
      const { cursor = null, size = 10 } = params;
      
      let endpoint = `/api/notifications?size=${size}`;
      if (cursor) {
        endpoint += `&cursor=${cursor}`;
      }

      const response = await apiClient.get(endpoint)
      
      // 백엔드 응답 구조에 맞게 수정 (커서 기반)
      const responseData = response.data.data || {}
      
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
      await apiClient.patch(`/api/notifications/${notificationId}/read`)
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
      await apiClient.delete(`/api/notifications/${notificationId}`)
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      throw new Error('알림 삭제에 실패했습니다.')
    }
  },


  /**
   * 모든 알림 삭제
   * @returns {Promise<void>}
   */
  async deleteAllNotifications() {
    try {
      await apiClient.delete('/api/notifications/delete-all')
    } catch (error) {
      console.error('모든 알림 삭제 실패:', error)
      throw new Error('알림 삭제에 실패했습니다.')
    }
  },

  /**
   * 알림 설정 조회
   * @returns {Promise<Object>} 알림 설정
   */
  async getNotificationSettings() {
    try {
      const response = await apiClient.get('/api/notifications/settings')
      return response.data.data || {}
    } catch (error) {
      console.error('알림 설정 조회 실패:', error)
      return {}
    }
  },

  /**
   * 알림 설정 업데이트
   * @param {Object} settings - 알림 설정
   * @returns {Promise<void>}
   */
  async updateNotificationSettings(settings) {
    try {
      await apiClient.put('/api/notifications/settings', settings)
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error)
      throw new Error('알림 설정 업데이트에 실패했습니다.')
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
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`
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
  },

  /**
   * SSE Polyfill 구독 시작 (JWT 토큰 포함)
   * @returns {EventSourcePolyfill} SSE Polyfill 연결 객체
   */
  subscribeToNotifications() {
    try {
      // SSE Polyfill을 사용하여 JWT 토큰을 헤더에 포함
      return ssePolyfillService.createAuthenticatedEventSource(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`
      )
    } catch (error) {
      console.error('SSE 구독 시작 실패:', error)
      throw error
    }
  },

  /**
   * SSE 연결 해제
   * @returns {Promise<void>}
   */
  async disconnectNotifications() {
    try {
      await apiClient.post('/api/notifications/disconnect')
      console.log('SSE 연결이 서버에서 해제되었습니다.')
    } catch (error) {
      console.error('SSE 연결 해제 실패:', error)
      // 에러가 발생해도 클라이언트에서는 연결을 정리
    }
  }
};

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
    color: '#4caf50',
    description: '요청한 작업이 승인되었을 때'
  },
  REJECTION: {
    name: '거절',
    icon: '❌',
    color: '#f44336',
    description: '요청한 작업이 거절되었을 때'
  },
  PAYMENT: {
    name: '결제',
    icon: '💳',
    color: '#ff9800',
    description: '결제 관련 알림'
  },
  SYSTEM: {
    name: '시스템',
    icon: '🔔',
    color: '#9c27b0',
    description: '시스템 공지사항'
  }
};