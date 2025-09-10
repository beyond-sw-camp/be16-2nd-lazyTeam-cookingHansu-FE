<template>
  <div class="notification-page">
    <div class="notification-container">
      <!-- 헤더 -->
      <div class="notification-header">
        <h1>알림</h1>
        <p class="notification-subtitle">새로운 알림과 활동내역을 확인하세요</p>
      </div>

      <!-- 알림 내용 -->
      <div class="notification-content">
        <!-- 알림 필터 및 액션 버튼 -->
        <div class="notification-filters">
          <button 
            v-for="filter in filters" 
            :key="filter.type"
            :class="['filter-btn', { active: activeFilter === filter.type }]"
            @click="setActiveFilter(filter.type)"
          >
            <span class="filter-icon">{{ filter.icon }}</span>
            {{ filter.label }}
          </button>
          
          <!-- 모두 읽음 버튼 -->
          <button 
            v-if="filteredNotifications.length > 0"
            class="mark-all-read-btn"
            @click="handleDeleteAllNotifications"
            :disabled="loading"
          >
            <span class="mark-all-read-icon">✓</span>
            모두 읽음
          </button>
        </div>

        <!-- 알림 목록 -->
        <div class="notification-list">
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <p class="empty-message">수신된 알림이 없습니다</p>
            <p class="empty-description">새로운 활동이 있을 때 알림을 받게 됩니다</p>
          </div>
          
          <div v-else>
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification.id"
              :class="['notification-item', { unread: !notification.isRead }]"
              @click="handleNotificationClick(notification)"
            >
              <!-- 알림 타입별 아이콘 -->
              <div :class="['notification-icon', notification.targetType.toLowerCase()]">
                {{ getNotificationIcon(notification.targetType) }}
              </div>
              
              <!-- 알림 내용 -->
              <div class="notification-detail">
                <div class="notification-main">
                  <div class="notification-badge-row">
                    <span :class="['notification-type-badge', notification.targetType.toLowerCase()]">
                      {{ getTypeName(notification.targetType) }}
                    </span>
                    <!-- 읽지 않음 표시 -->
                    <div v-if="!notification.isRead" class="unread-dot"></div>
                  </div>
                  <p class="notification-message">{{ notification.content }}</p>
                </div>
                <div class="notification-meta">
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
              
              <!-- 삭제 버튼 -->
              <button 
                class="notification-delete-btn"
                @click.stop="handleDeleteNotification(notification.id)"
                title="알림 삭제"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 더보기 버튼 -->
        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" @click="loadMore" :disabled="loading">
            {{ loading ? '로딩 중...' : '더보기' }}
          </button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/store/notification/notification.js'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const router = useRouter()
const notificationStore = useNotificationStore()

// 반응형 데이터
const activeFilter = ref('ALL')
const loading = ref(false)

// computed로 hasMore 상태를 store에서 가져오기
const hasMore = computed(() => notificationStore.hasMore)

// 필터 옵션
const filters = [
  { type: 'ALL', label: '전체', icon: '📋' },
  { type: 'POSTCOMMENT', label: '댓글', icon: '💬' },
  { type: 'QNACOMMENT', label: 'Q&A', icon: '❓' },
  { type: 'REPLY', label: '답글', icon: '↩️' },
  { type: 'APPROVAL', label: '승인', icon: '✅' },
  { type: 'CHAT', label: '채팅', icon: '💬' },
  { type: 'PAYMENT', label: '결제', icon: '💳' },
  { type: 'NOTICE', label: '공지', icon: '📢' }
]

// 컴퓨티드
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'ALL') {
    return notificationStore.notifications
  }
  return notificationStore.notifications.filter(
    notification => notification.targetType === activeFilter.value
  )
})

// 알림이 있는지 확인 (삭제 버튼 표시용)
const hasNotifications = computed(() => {
  return filteredNotifications.value.length > 0
})

// 메서드
const setActiveFilter = (filterType) => {
  activeFilter.value = filterType
  // 선택한 필터를 sessionStorage에 저장
  sessionStorage.setItem('notificationFilter', filterType)
}

const getNotificationIcon = (targetType) => {
  const iconMap = {
    POSTCOMMENT: '💬',
    QNACOMMENT: '❓',
    REPLY: '↩️',
    APPROVAL: '✅',
    CHAT: '💬',
    PAYMENT: '💳',
    NOTICE: '📢'
  }
  return iconMap[targetType] || '🔔'
}

const getTypeName = (targetType) => {
  const typeMap = {
    POSTCOMMENT: '게시글 댓글',
    QNACOMMENT: 'Q&A 댓글',
    REPLY: '답글',
    APPROVAL: '승인',
    CHAT: '채팅',
    PAYMENT: '결제',
    NOTICE: '공지사항'
  }
  return typeMap[targetType] || '알림'
}

const formatTime = (timestamp) => {
  try {
    // timestamp가 유효한지 확인
    if (!timestamp || timestamp === 'Invalid Date' || isNaN(new Date(timestamp).getTime())) {
      return '시간 정보 없음'
    }
    
    const date = new Date(timestamp)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ko 
    })
  } catch (error) {
    console.warn('날짜 파싱 에러:', error, 'timestamp:', timestamp)
    return '시간 정보 없음'
  }
}

const handleNotificationClick = async (notification) => {
  // 읽음 처리
  try {
    await notificationStore.markAsRead(notification.id)
  } catch (error) {
    console.error('읽음 처리 실패:', error)
  }
  
  // 알림 타입에 따라 해당 페이지로 이동
  switch (notification.targetType) {
    case 'POSTCOMMENT':
    case 'REPLY':
      // 댓글/답글 알림의 경우 게시글 상세 페이지로 이동
      if (notification.targetId) {
        router.push(`/recipes/${notification.targetId}`)
      } else {
        router.push('/recipes')
      }
      break
    case 'QNACOMMENT':
      // 강의 상세 페이지로 이동 (targetId가 강의 ID)
      if (notification.targetId) {
        router.push(`/lectures/${notification.targetId}?tab=qa`)
      } else {
        router.push('/lectures')
      }
      break
    case 'CHAT':
      router.push('/chat')
      break
    case 'PAYMENT':
      router.push('/mypage?tab=lectures')
      break
    case 'APPROVAL':
      // 강의 승인 알림인지 확인
      if (notification.content && notification.content.includes('강의')) {
        // 강의 승인 알림의 경우 해당 강의로 이동
        if (notification.targetId) {
          router.push(`/lectures/${notification.targetId}`)
        } else if (notification.relatedId) {
          router.push(`/lectures/${notification.relatedId}`)
        } else {
          router.push('/lectures')
        }
      } else {
        // 일반 승인 알림은 읽음 처리만 (모달은 자동으로 표시됨)
        break
      }
      break
    case 'NOTICE':
      if (notification.relatedId) {
        router.push(`/notice/${notification.relatedId}`)
      } else {
        router.push('/notice')
      }
      break
    default:
      break
  }
}



// 알림 삭제 처리
const handleDeleteNotification = async (notificationId) => {
  try {
    await notificationStore.deleteNotification(notificationId)
  } catch (error) {
    console.error('❌ 알림 삭제 실패:', error)
  }
}

// 모든 알림 삭제 처리
const handleDeleteAllNotifications = async () => {
  if (!confirm('모든 알림을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    await notificationStore.deleteAllNotifications()
  } catch (error) {
    console.error('❌ 모든 알림 삭제 실패:', error)
  }
}

const loadMore = async () => {
  loading.value = true
  try {
    await notificationStore.loadMoreNotifications()
    // hasMore는 computed 속성에 의해 자동으로 관리됨
  } catch (error) {
    console.error('알림 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  loading.value = true
  try {
    // 백엔드의 새로운 커서 기반 페이지네이션 API로 첫 페이지 알림 로드 (10개씩)
    await notificationStore.fetchNotifications(null, 10)
    
    // SSE 연결 상태 확인 및 재연결
    notificationStore.ensureNotificationSubscription()
    
    // 이전 필터 상태 복원
    const savedFilter = sessionStorage.getItem('notificationFilter')
    if (savedFilter) {
      activeFilter.value = savedFilter
    }
  } catch (error) {
    console.error('알림 로드 실패:', error)
    // API 실패시에도 더미데이터 사용하지 않음
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px; /* 헤더 높이만큼 상단 여백 추가 */
}

.notification-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.notification-header {
  text-align: center;
  margin-bottom: 40px;
}

.notification-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.notification-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.notification-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 0 4px;
  flex-wrap: wrap;
}

.notification-filters::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
}

.filter-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.filter-btn.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.filter-icon {
  font-size: 1rem;
}

.mark-all-read-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 2px solid #4caf50;
  border-radius: 25px;
  background: white;
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: #4caf50;
  color: white;
}

.mark-all-read-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mark-all-read-icon {
  font-size: 1rem;
  font-weight: bold;
}

.notification-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.notification-list {
  background: transparent;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-message {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  background: transparent;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: #fff8f6;
  border-left: 4px solid #ff6b35;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-left: 16px;
}

.notification-icon.postcomment,
.notification-icon.qnacomment,
.notification-icon.reply,
.notification-icon.chat {
  background: #e3f2fd;
}

.notification-icon.approval {
  background: #e8f5e8;
}

.notification-icon.payment {
  background: #fff3e0;
}

.notification-icon.notice {
  background: #f3e5f5;
}

.notification-detail {
  flex: 1;
  min-width: 0;
}

.notification-main {
  margin-bottom: 8px;
}

.notification-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 8px 0 4px 0;
  line-height: 1.4;
}

.notification-message {
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
}

.notification-time {
  font-size: 0.9rem;
  color: #999;
}

.notification-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
  margin-top: 4px;
  margin-bottom: 6px;
}

.notification-type-badge.postcomment,
.notification-type-badge.qnacomment,
.notification-type-badge.reply,
.notification-type-badge.chat {
  background: #e3f2fd;
  color: #1976d2;
}

.notification-type-badge.approval {
  background: #e8f5e8;
  color: #388e3c;
}

.notification-type-badge.payment {
  background: #fff3e0;
  color: #f57c00;
}

.notification-type-badge.notice {
  background: #f3e5f5;
  color: #7b1fa2;
}

.notification-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff6b35;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-delete-btn {
  position: absolute;
  top: 16px;
  right: 15px;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-delete-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.load-more {
  text-align: center;
  margin-top: 24px;
}

.load-more-btn {
  padding: 12px 32px;
  border: 2px solid #ff6b35;
  border-radius: 25px;
  background: white;
  color: #ff6b35;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #ff6b35;
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .notification-container {
    padding: 20px 15px;
  }

  .notification-header h1 {
    font-size: 2rem;
  }

  .notification-content {
    padding: 20px;
  }

  .notification-item {
    padding: 16px 0;
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .filter-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .notification-header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .mark-all-read-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
    justify-content: center;
  }
}
</style>