import { defineStore } from 'pinia';
import { notificationService } from '@/services/notification/notificationService';
import { ssePolyfillService } from '@/services/notification/ssePolyfillService';
import { useAuthStore } from '@/store/auth/auth';

export const useNotificationStore = defineStore('notification', {
  state: () => {
    console.log('🔍 Notification Store 초기화');
    return {
      // 알림 목록
      notifications: [],
      
      // 로딩 상태
      loading: false,
      
      // 에러 상태
      error: null,
      
      // 읽지 않은 알림 개수
      unreadCount: 0,
      
      // 페이지네이션
      currentPage: 0,
      totalPages: 1,
      hasMore: true,
      pageSize: 10,
      
      // SSE 연결 상태
      isConnected: false,
      eventSource: null,
      
      // 구독 시도 중인지 여부 (중복 구독 방지)
      isSubscribing: false,
      
      // 마지막 연결 시도 시간
      lastConnectionAttempt: 0
    };
  },

  getters: {
    // getters는 사용되지 않으므로 제거
    // 직접 state 속성에 접근하거나 computed 사용
  },

  actions: {
    // 에러 처리 헬퍼
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      this.error = error.message || defaultMessage;
    },

    // 로딩 상태 관리
    _setLoading(loading) {
      this.loading = loading;
    },

    // 알림 목록 조회
    async fetchNotifications() {
      this._setLoading(true);
      this.error = null;
      
      try {
        console.log('🔍 알림 목록 조회 시작');
        const response = await notificationService.getNotifications();
        console.log('🔍 알림 서비스 응답:', response);
        
        this.notifications = response.notifications || [];
        console.log('🔍 스토어에 설정된 알림:', this.notifications);
        
        // 중복 알림 정리
        this._cleanupDuplicateNotifications();
        
        this._updateUnreadCount();
        console.log('🔍 읽지 않은 알림 개수:', this.unreadCount);
      } catch (error) {
        this._handleError(error, '알림 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 추가 알림 로드 (페이지네이션)
    async loadMoreNotifications() {
      if (!this.hasMore || this.loading) {
        return { hasMore: this.hasMore };
      }

      this._setLoading(true);
      this.error = null;

      try {
        const response = await notificationService.getNotifications({
          page: this.currentPage + 1,
          size: this.pageSize
        });

        // 새로운 알림을 기존 목록에 추가
        this.notifications.push(...response.notifications);
        
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.hasMore = response.hasNext;
        this._updateUnreadCount();

        return { hasMore: this.hasMore };
      } catch (error) {
        this._handleError(error, '추가 알림을 불러오는데 실패했습니다.');
        return { hasMore: this.hasMore };
      } finally {
        this._setLoading(false);
      }
    },

    // 알림 읽음 처리
    async markAsRead(notificationId) {
      try {
        await notificationService.markAsRead(notificationId);
        
        // 로컬 상태 업데이트
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this._updateUnreadCount();
        }
      } catch (error) {
        this._handleError(error, '알림 읽음 처리에 실패했습니다.');
      }
    },

    // 알림 삭제
    async deleteNotification(notificationId) {
      try {
        await notificationService.deleteNotification(notificationId);
        
        // 로컬 상태에서 제거
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this._updateUnreadCount();
      } catch (error) {
        this._handleError(error, '알림 삭제에 실패했습니다.');
      }
    },

    // 새 알림 처리 헬퍼 메서드
    _processNewNotification(notification) {
      // 중복 알림 방지: 동일한 ID의 알림이 이미 존재하는지 확인
      const isDuplicate = this.notifications.some(n => n.id === notification.id);
      if (isDuplicate) {
        console.log('🔍 중복 알림 감지, 건너뜀:', notification.id);
        return;
      }
      
      // targetId를 id로 사용 (서버에서 id 필드가 없는 경우)
      if (!notification.id && notification.targetId) {
        notification.id = notification.targetId;
      }
      
      // 새 알림을 목록 맨 앞에 추가
      this.notifications.unshift(notification);
      console.log('🔍 새 알림 추가됨:', notification.id || notification.targetId);
      console.log('🔍 알림 목록 업데이트:', this.notifications);
      
      this._updateUnreadCount();
      console.log('🔍 읽지 않은 알림 개수 업데이트:', this.unreadCount);
      
      // 브라우저 알림 표시 (사용자가 허용한 경우)
      this._showBrowserNotification(notification);
    },

    // 읽지 않은 알림 개수 업데이트
    _updateUnreadCount() {
      const unreadCount = this.notifications.filter(n => {
        // isRead가 undefined, null, false인 경우 모두 읽지 않은 것으로 처리
        return n && (n.isRead === false || n.isRead === null || n.isRead === undefined);
      }).length;
      
      const previousCount = this.unreadCount;
      this.unreadCount = unreadCount;
      
      console.log('🔍 _updateUnreadCount 호출:', {
        totalNotifications: this.notifications.length,
        notifications: this.notifications.map(n => ({ id: n.id, isRead: n.isRead })),
        calculatedUnreadCount: unreadCount,
        previousUnreadCount: previousCount,
        change: unreadCount - previousCount
      });
      
      // 카운트 변화가 예상과 다른 경우 경고
      if (unreadCount > previousCount + 1) {
        console.warn('🔍 ⚠️ 읽지 않은 알림 개수가 예상보다 많이 증가했습니다:', {
          previous: previousCount,
          current: unreadCount,
          increase: unreadCount - previousCount
        });
      }
    },

    // SSE Polyfill 연결 시작 (중복 구독 방지)
    async startNotificationSubscription() {
      // 이미 연결되어 있거나 구독 중인 경우 중지
      if (this.isConnected && this.eventSource) {
        console.log('🔍 SSE 연결이 이미 활성화되어 있습니다.');
        return;
      }

      // 구독 시도 중인 경우 중지
      if (this.isSubscribing) {
        console.log('🔍 이미 구독 시도 중입니다.');
        return;
      }

      // 인증 상태 확인
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.accessToken) {
        console.log('🔍 사용자가 인증되지 않았습니다. 알림 구독을 건너뜁니다.');
        return;
      }

      // 마지막 연결 시도로부터 1초 이내인 경우 중지 (연속 시도 방지)
      const now = Date.now();
      if (now - this.lastConnectionAttempt < 1000) {
        console.log('🔍 너무 빠른 재연결 시도입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      this.lastConnectionAttempt = now;
      this.isSubscribing = true;

      try {
        // 기존 연결이 있다면 정리
        if (this.eventSource) {
          this.stopNotificationSubscription();
        }

        console.log('🔍 SSE Polyfill 연결 시작...');
        console.log('🔍 API URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/notifications/subscribe`);
        
        // SSE Polyfill을 사용하여 JWT 토큰을 헤더에 포함
        this.eventSource = ssePolyfillService.createAuthenticatedEventSource(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/notifications/subscribe`
        );
        this.isConnected = true;

        // 연결 성공 이벤트
        this.eventSource.addEventListener('connect', (event) => {
          console.log('🔍 알림 SSE Polyfill 연결 성공:', event.data);
        });



        // 메시지 이벤트 처리 (알림 및 connect 이벤트)
        this.eventSource.addEventListener('message', (event) => {
          try {
            // connect 이벤트인지 확인
            if (event.data === 'ok') {
              console.log('🔍 SSE 연결 성공 확인');
              return;
            }
            
            // notify 이벤트 처리
            if (event.type === 'notify' && event.data) {
              try {
                const notification = JSON.parse(event.data);
                if (notification.recipientId || notification.content) {
                  console.log('🔍 새 알림 수신:', notification);
                  this._processNewNotification(notification);
                }
              } catch (parseError) {
                console.log('🔍 알림 데이터 파싱 실패:', event.data);
              }
            }
          } catch (error) {
            console.error('🔍 SSE 메시지 처리 실패:', error);
          }
        });

        // 에러 처리
        this.eventSource.onerror = (error) => {
          console.error('알림 SSE Polyfill 연결 에러:', error);
          this.isConnected = false;
          this.isSubscribing = false;
          
          // 401 에러인 경우 재연결 시도하지 않음
          if (error.message && error.message.includes('401')) {
            console.warn('🔍 인증 실패 (401). SSE 연결을 중단합니다.');
            this._handleAuthError();
            return;
          }
          
          // 다른 에러인 경우에도 재연결 시도하지 않음 (로그아웃 시 재연결 방지)
          console.warn('🔍 SSE 연결 에러로 인해 연결을 중단합니다.');
        };

        console.log('알림 SSE Polyfill 구독 시작됨');
      } catch (error) {
        console.error('알림 SSE Polyfill 구독 시작 실패:', error);
        this.isConnected = false;
        this.isSubscribing = false;
      } finally {
        this.isSubscribing = false;
      }
    },

    // SSE Polyfill 연결 중지
    stopNotificationSubscription() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
        this.isConnected = false;
        this.isSubscribing = false;
        console.log('알림 SSE Polyfill 구독 중지됨');
      }
    },

    // 인증 에러 처리
    _handleAuthError() {
      console.warn('🔍 SSE 인증 에러로 인해 알림 구독을 중단합니다.');
      this.isConnected = false;
      this.isSubscribing = false;
      
      // auth store에서 토큰 상태 확인
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        console.error('🔍 액세스 토큰이 없습니다. 사용자 재로그인이 필요합니다.');
        // 사용자에게 로그인 상태 확인을 안내
        return;
      }
      
      // 토큰이 있지만 401 에러가 발생한 경우
      console.warn('🔍 토큰이 있지만 인증에 실패했습니다. 토큰이 만료되었을 수 있습니다.');
      
      // 필요시 토큰 갱신 시도 (auth store에 토큰 갱신 메서드가 있다면)
      // try {
      //   await authStore.refreshToken();
      //   // 토큰 갱신 성공 시 SSE 연결 재시도
      //   this.reconnectAttempts = 0;
      //   this.startNotificationSubscription();
      // } catch (error) {
      //   console.error('🔍 토큰 갱신 실패:', error);
      // }
    },

    // 브라우저 알림 표시
    _showBrowserNotification(notification) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('새 알림', {
          body: notification.content,
          icon: '/favicon.ico'
        });
      }
    },

    // 브라우저 알림 권한 요청
    async requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    },

    // 스토어 초기화
    $reset() {
      this.notifications = [];
      this.loading = false;
      this.error = null;
      this.unreadCount = 0;
      this.currentPage = 0;
      this.totalPages = 1;
      this.hasMore = true;
      this.stopNotificationSubscription();
      this.isSubscribing = false;
      this.lastConnectionAttempt = 0;
    },

    // 컴포넌트 마운트 시 SSE 연결 상태 확인 및 재연결
    ensureNotificationSubscription() {
      // 이미 연결되어 있으면 재연결하지 않음
      if (this.isConnected && this.eventSource) {
        console.log('🔍 SSE 연결이 이미 활성화되어 있습니다.');
        return;
      }

      // 연결이 끊어져 있으면 재연결
      if (!this.isConnected) {
        console.log('🔍 SSE 연결이 끊어져 있습니다. 재연결을 시도합니다.');
        this.startNotificationSubscription();
      }
    },

    // 중복 알림 제거 및 목록 정리
    _cleanupDuplicateNotifications() {
      const seenIds = new Set();
      const uniqueNotifications = [];
      
      for (const notification of this.notifications) {
        // id 또는 targetId를 사용하여 중복 체크
        const notificationId = notification.id || notification.targetId;
        
        if (notificationId && !seenIds.has(notificationId)) {
          seenIds.add(notificationId);
          uniqueNotifications.push(notification);
        } else if (!notificationId) {
          // ID가 없는 알림은 내용으로 중복 체크
          const contentKey = `${notification.content}_${notification.recipientId}_${notification.createdAt}`;
          if (!seenIds.has(contentKey)) {
            seenIds.add(contentKey);
            uniqueNotifications.push(notification);
          }
        }
      }
      
      if (uniqueNotifications.length !== this.notifications.length) {
        console.log('🔍 중복 알림 정리:', {
          before: this.notifications.length,
          after: uniqueNotifications.length,
          removed: this.notifications.length - uniqueNotifications.length
        });
        this.notifications = uniqueNotifications;
        this._updateUnreadCount();
      }
    },

    // 로그아웃 시 완전한 정리
    clearAllData() {
      console.log('🔍 알림 스토어 데이터 완전 정리');
      this.notifications = [];
      this.loading = false;
      this.error = null;
      this.unreadCount = 0;
      this.currentPage = 0;
      this.totalPages = 1;
      this.hasMore = true;
      this.stopNotificationSubscription();
      this.isSubscribing = false;
      this.lastConnectionAttempt = 0;
    }
  }
});