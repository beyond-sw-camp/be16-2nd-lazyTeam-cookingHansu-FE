import { defineStore } from 'pinia';
import { notificationService } from '@/services/notification/notificationService';
import { ssePolyfillService } from '@/services/notification/ssePolyfillService';
import { useAuthStore } from '@/store/auth/auth';

export const useNotificationStore = defineStore('notification', {
  state: () => {
    return {
      // 알림 목록
      notifications: [],
      
      // 로딩 상태
      loading: false,
      
      // 에러 상태
      error: null,
      
      // 읽지 않은 알림 개수 (헤더용)
      unreadCount: 0,
      
      // 커서 기반 페이지네이션
      nextCursor: null,
      hasMore: true,
      pageSize: 10, // 백엔드 기본값과 일치
      
      // SSE 연결 상태
      isConnected: false,
      eventSource: null,
      
      // 구독 시도 중인지 여부 (중복 구독 방지)
      isSubscribing: false,
      
      // 마지막 연결 시도 시간
      lastConnectionAttempt: 0,
      
      // 승인 알림 모달 상태
      showApprovalModal: false,
      approvalNotification: null
    };
  },

  getters: {
    // getters는 사용되지 않으므로 제거
    // 직접 state 속성에 접근하거나 computed 사용
  },

  actions: {
    // 에러 처리 헬퍼
    _handleError(error, defaultMessage) {
      this.error = error.message || defaultMessage;
    },

    // 로딩 상태 관리
    _setLoading(loading) {
      this.loading = loading;
    },

    // 헤더용: 읽지 않은 알림 개수만 조회 (가벼운 API)
    async fetchUnreadCount() {
      try {
        const count = await notificationService.getUnreadCount();
        this.unreadCount = count;
        return count;
      } catch (error) {
        console.error('읽지 않은 알림 개수 조회 실패:', error);
        this.unreadCount = 0;
        return 0;
      }
    },

    // 알림 목록 조회 (커서 기반 페이지네이션)
    async fetchNotifications(cursor = null, size = 10) {
      // 관리자는 알림 목록 조회하지 않음
      const authStore = useAuthStore();
      if (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'admin') {
        return;
      }
      
      this._setLoading(true);
      this.error = null;
      
      try {
        const response = await notificationService.getNotifications({ cursor, size });
        
        // 첫 페이지인 경우 기존 목록 교체, 그 외에는 추가
        if (!cursor) {
          this.notifications = response.notifications || [];
          this.nextCursor = response.nextCursor;
        } else {
          this.notifications.push(...(response.notifications || []));
          this.nextCursor = response.nextCursor;
        }
        
        // 페이지네이션 정보 업데이트
        this.hasMore = response.hasNext;
        this.pageSize = response.size;
        
        // 중복 알림 정리
        this._cleanupDuplicateNotifications();
        
        // 읽지 않은 개수는 서버에서 받은 전체 개수를 유지 (페이지네이션과 무관)
        // this._updateUnreadCount(); // 제거 - 헤더 개수는 서버 전체 개수 유지
        
        return response;
      } catch (error) {
        this._handleError(error, '알림 목록을 불러오는데 실패했습니다.');
        throw error;
      } finally {
        this._setLoading(false);
      }
    },

    // 추가 알림 로드 (페이지네이션)
    async loadMoreNotifications() {
      if (!this.hasMore || this.loading) {
        return { hasMore: this.hasMore };
      }

      try {
        const response = await this.fetchNotifications(this.nextCursor, this.pageSize);
        return { hasMore: this.hasMore };
      } catch (error) {
        return { hasMore: this.hasMore };
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
        }
        
        // 헤더의 읽지 않은 개수는 서버에서 전체 개수를 다시 가져와서 업데이트
        await this.fetchUnreadCount();
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
        
        // 헤더의 읽지 않은 개수는 서버에서 전체 개수를 다시 가져와서 업데이트
        await this.fetchUnreadCount();
      } catch (error) {
        this._handleError(error, '알림 삭제에 실패했습니다.');
      }
    },

    // 새 알림 처리 헬퍼 메서드
    _processNewNotification(notification) {
      // 중복 알림 방지: ID 기반으로만 체크
      const now = new Date();
      
      const isDuplicate = this.notifications.some(n => {
        // ID가 있는 경우 ID로만 체크
        if (notification.id && n.id === notification.id) {
          return true;
        }
        
        // ID가 없는 경우 1초 이내의 완전히 동일한 알림만 중복으로 간주
        if (n.content === notification.content && 
            n.recipientId === notification.recipientId &&
            n.targetType === notification.targetType &&
            n.targetId === notification.targetId) {
          
          // 시간 차이 계산 (1초로 단축)
          const notificationTime = n.createdAt ? new Date(n.createdAt) : now;
          const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
          
          if (timeDiff < 1000) {
            return true;
          }
        }
        
        return false;
      });
      
      if (isDuplicate) {
        return;
      }
      
      // targetId를 id로 사용 (서버에서 id 필드가 없는 경우)
      if (!notification.id && notification.targetId) {
        notification.id = notification.targetId;
      }
      
      if (!notification.createdAt) {
        notification.createdAt = new Date().toISOString();
      }
      
      // 새 알림을 목록 맨 앞에 추가
      this.notifications.unshift(notification);
      
      // 알림 타입에 따른 처리
      if (notification.chatRoomId) {
        // 채팅 메시지인 경우 - 채팅방 목록 실시간 업데이트
        this._updateChatRoomList(notification);
      }
      
      // 사용자 승인 알림인 경우에만 모달 표시
      if (this._isUserApprovalNotification(notification)) {
        this._showApprovalModal(notification);
      }
      // 강의 승인 알림은 일반 알림으로만 처리 (모달 표시 안함)
      
      // 헤더의 읽지 않은 알림 개수 즉시 업데이트
      this.unreadCount += 1;

      
      // 브라우저 알림 비활성화
      // this._showBrowserNotification(notification);
    },

    // 채팅방 목록 실시간 업데이트
    _updateChatRoomList(notification) {
      try {
        // chat store를 동적으로 import하여 순환 참조 방지
        import('@/store/chat/chat').then(({ useChatStore }) => {
          const chatStore = useChatStore();
          
          // 채팅방 목록에서 해당 채팅방 찾기
          const chatRoom = chatStore.rooms.find(room => room.roomId === notification.chatRoomId);
          
          if (chatRoom) {
            // 현재 사용자 ID 가져오기
            const authStore = useAuthStore();
            const currentUserId = authStore.user?.id;
            
            // 상대방이 보낸 메시지인지 확인
            const isFromOtherUser = notification.senderId !== currentUserId;
            
            // 현재 선택된 채팅방인지 확인
            const isCurrentRoom = chatStore.currentRoomId === notification.chatRoomId;
            
            // 채팅방 정보 실시간 업데이트
            const updatedRoom = {
              ...chatRoom,
              lastMessage: notification.content,
              lastMessageTime: new Date().toISOString()
            };
            
            // newMessageCount 처리 로직
            if (isFromOtherUser) {
              if (isCurrentRoom) {
                // 현재 채팅 중인 채팅방에서는 newMessageCount를 0으로 유지
                updatedRoom.newMessageCount = 0;
              } else {
                // 다른 채팅방에서는 newMessageCount 증가
                updatedRoom.newMessageCount = (chatRoom.newMessageCount || 0) + 1;
              }
            } else {
              // 내가 보낸 메시지인 경우 newMessageCount는 그대로 유지
              updatedRoom.newMessageCount = chatRoom.newMessageCount || 0;
            }
            
            // 채팅방 목록에서 해당 채팅방 업데이트
            const roomIndex = chatStore.rooms.findIndex(room => room.roomId === notification.chatRoomId);
            if (roomIndex !== -1) {
              chatStore.rooms[roomIndex] = updatedRoom;
              
              // 채팅방을 목록 맨 위로 이동 (최신 메시지가 온 채팅방)
              chatStore.rooms.splice(roomIndex, 1);
              chatStore.rooms.unshift(updatedRoom);
            }
          }
        }).catch(error => {
          console.error('🔍 chat store import 실패:', error);
        });
      } catch (error) {
        console.error('🔍 채팅방 목록 업데이트 실패:', error);
      }
    },

    // 읽지 않은 알림 개수 업데이트 (로컬 상태 기반)
    _updateUnreadCount() {
      // 로컬 알림 목록에서 읽지 않은 개수 계산 (페이지네이션과 무관하게)
      const localUnreadCount = this.notifications.filter(n => {
        // isRead가 undefined, null, false인 경우 모두 읽지 않은 것으로 처리
        return n && (n.isRead === false || n.isRead === null || n.isRead === undefined);
      }).length;
      
      // 헤더의 unreadCount는 서버에서 받은 전체 개수를 유지
      // 로컬 계산은 목록 페이지에서만 사용
    },

    // SSE Polyfill 연결 시작 (중복 구독 방지)
    async startNotificationSubscription() {
      // 이미 연결되어 있거나 구독 중인 경우 중지
      if (this.isConnected && this.eventSource) {
        return;
      }

      // 구독 시도 중인 경우 중지
      if (this.isSubscribing) {
        return;
      }

      // 인증 상태 확인
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.accessToken) {
        return;
      }

      // 관리자는 알림 구독하지 않음
      if (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'admin') {
        return;
      }

      // 마지막 연결 시도로부터 1초 이내인 경우 중지 (연속 시도 방지)
      const now = Date.now();
      if (now - this.lastConnectionAttempt < 1000) {
        return;
      }

      this.lastConnectionAttempt = now;
      this.isSubscribing = true;

      try {
        // 기존 연결이 있다면 정리
        if (this.eventSource) {
          this.stopNotificationSubscription();
        }

        // SSE Polyfill을 사용하여 JWT 토큰을 헤더에 포함
        this.eventSource = ssePolyfillService.createAuthenticatedEventSource(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`
        );
        this.isConnected = true;

        // 연결 성공 이벤트
        this.eventSource.addEventListener('connect', (event) => {
          // 연결 성공 처리
        });

        // 메시지 이벤트 처리 (알림 및 connect 이벤트)
        this.eventSource.addEventListener('message', (event) => {
          try {
            // connect 이벤트인지 확인
            if (event.data === 'ok') {
              return;
            }
           
            // notify 이벤트 처리
            if (event.type === 'notify' && event.data) {
              try {
                const notification = JSON.parse(event.data);
                if (notification.recipientId || notification.content) {
                  this._processNewNotification(notification);
                  
                  // 헤더의 읽지 않은 개수도 실시간 업데이트
                  this.fetchUnreadCount();
                }
              } catch (parseError) {
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
            this._handleAuthError();
            return;
          }
          
          // 다른 에러인 경우에도 재연결 시도하지 않음 (로그아웃 시 재연결 방지)
          console.warn('🔍 SSE 연결 에러로 인해 연결을 중단합니다.');
        };

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
      }
    },

    // 인증 에러 처리
    _handleAuthError() {
      this.isConnected = false;
      this.isSubscribing = false;
      
      // auth store에서 토큰 상태 확인
      const authStore = useAuthStore();
      if (!authStore.accessToken) {
        console.error('🔍 액세스 토큰이 없습니다. 사용자 재로그인이 필요합니다.');
        return;
      }
      
      // 토큰이 있지만 401 에러가 발생한 경우
      console.warn('🔍 토큰이 있지만 인증에 실패했습니다. 토큰이 만료되었을 수 있습니다.');
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
      this.nextCursor = null;
      this.hasMore = true;
      this.pageSize = 10;
      this.stopNotificationSubscription();
      this.isSubscribing = false;
      this.lastConnectionAttempt = 0;
    },

    // 컴포넌트 마운트 시 SSE 연결 상태 확인 및 재연결
    ensureNotificationSubscription() {
      // 이미 연결되어 있으면 재연결하지 않음
      if (this.isConnected && this.eventSource) {
        return;
      }

      // 연결이 끊어져 있으면 재연결
      if (!this.isConnected) {
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
        this.notifications = uniqueNotifications;
        // 중복 제거 시에는 헤더 개수를 변경하지 않음 (서버 전체 개수 유지)
      }
      
      // 메모리 정리: Set 객체 해제
      seenIds.clear();
    },

    // 공지사항 관련 알림 처리 (관리자가 공지사항 작성/수정/삭제 시)
    async handleNoticeNotification(noticeData, action = 'create') {
      try {
        // NoticeResDto 구조: { id, title, content, imageUrl, createdAt }
        // 필수 필드 검증
        if (!noticeData.id || !noticeData.title) {
          console.warn('공지사항 알림 처리 실패: 필수 필드가 없습니다:', noticeData);
          return;
        }
        
        // 공지사항 알림을 notifications 배열에 추가
        const notification = {
          id: `notice_${Date.now()}`,
          type: 'notice',
          content: `새로운 공지사항이 ${action === 'create' ? '작성' : action === 'update' ? '수정' : '삭제'}되었습니다: ${noticeData.title}`,
          recipientId: 'all', // 모든 사용자에게
          createdAt: new Date().toISOString(),
          isRead: false,
          noticeId: noticeData.id
        };
        
        // 새 알림 처리
        this._processNewNotification(notification);
        
        // 헤더의 읽지 않은 개수 즉시 업데이트
        await this.fetchUnreadCount(true);
        
      } catch (error) {
        console.warn('공지사항 알림 처리 실패:', error);
      }
    },

    // 사용자 승인 알림인지 확인 (모달 표시용)
    _isUserApprovalNotification(notification) {
      // 사용자 승인 관련 키워드가 포함된 알림인지 확인
      const userApprovalKeywords = ['회원가입', '가입', '사용자', 'chef', 'business'];
      const content = notification.content?.toLowerCase() || '';
      
      return userApprovalKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      ) && content.includes('승인');
    },

    // 강의 승인 알림인지 확인 (일반 알림용)
    _isLectureApprovalNotification(notification) {
      // 강의 승인 관련 키워드가 포함된 알림인지 확인
      const lectureApprovalKeywords = ['강의', 'lecture', '온라인'];
      const content = notification.content?.toLowerCase() || '';
      
      return lectureApprovalKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      ) && content.includes('승인');
    },

    // 승인 알림인지 확인 (기존 호환성 유지)
    _isApprovalNotification(notification) {
      return this._isUserApprovalNotification(notification) || 
             this._isLectureApprovalNotification(notification);
    },

    // 승인 알림 모달 표시
    _showApprovalModal(notification) {
      this.approvalNotification = notification;
      this.showApprovalModal = true;
    },

    // 승인 알림 모달 닫기
    closeApprovalModal() {
      this.showApprovalModal = false;
      this.approvalNotification = null;
    },

    // 로그아웃 시 완전한 정리
    clearAllData() {
      this.notifications = [];
      this.loading = false;
      this.error = null;
      this.unreadCount = 0;
      this.nextCursor = null;
      this.hasMore = true;
      this.pageSize = 10;
      this.stopNotificationSubscription();
      this.isSubscribing = false;
      this.lastConnectionAttempt = 0;
      this.showApprovalModal = false;
      this.approvalNotification = null;
    }
  }
});