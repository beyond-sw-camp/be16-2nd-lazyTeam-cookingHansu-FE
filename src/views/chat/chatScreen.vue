<template>
  <v-container fluid class="pa-6" style="margin-top: 80px;">
    <!-- 로딩 상태 -->
    <LoadingScreen 
      v-if="loading"
      title="채팅방을 준비하고 있어요"
      description="잠시만 기다려주세요..."
    />

    <!-- 네트워크 연결 오류 -->
    <div v-else-if="error" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="error"
        @close="chatStore.clearError"
      />
    </div>

    <!-- 정상 채팅 화면 -->
    <v-row v-else no-gutters class="chat-wrapper" style="min-height: 600px">
      <!-- 채팅 목록 -->
      <v-col md="1.5" />
      <v-col cols="12" md="3" class="chat-list">
        <v-sheet class="h-100 pa-4" elevation="2">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6 font-weight-bold">채팅 목록</h3>
            <v-chip 
              v-if="totalUnreadCount > 0" 
              color="orange" 
              size="small"
              class="text-white"
            >
              {{ totalUnreadCount }}
            </v-chip>
          </div>
        
          <!-- 에러 상태 -->
          <div v-if="loadError" class="text-center pa-8">
            <ErrorAlert
              title="로딩 오류"
              :message="loadError"
              @close="chatStore.clearError"
            />
          </div>

          <!-- 채팅방 목록 -->
          <div
            v-else
            ref="chatScroll"
            class="chat-scroll-wrapper"
            @scroll.passive="onScroll"
            style="max-height: calc(100vh - 200px); overflow-y: auto"
          >
            <v-list dense nav>
              <v-list-item
                v-for="chat in visibleChats"
                :key="chat.chatRoomId"
                @click="selectChat(chat.chatRoomId)"
                :class="{ 'bg-grey-lighten-4': chat.chatRoomId === selectedChatId }"
                class="py-4 px-3"
              >
                <div class="d-flex w-100 align-start">
                  <!-- 아바타 -->
                  <v-avatar size="48" class="mr-4 flex-shrink-0">
                    <template v-if="chat.otherUserProfileImage">
                      <v-img :src="chat.otherUserProfileImage" />
                    </template>
                    <template v-else>
                      <span class="text-h6 font-weight-bold">{{ chat.otherUserNickname?.charAt(0) || 'U' }}</span>
                    </template>
                  </v-avatar>
                  <!-- 텍스트+시간+뱃지 영역 -->
                  <div class="flex-grow-1 min-width-0 d-flex flex-column" style="width: 0;">
                    <!-- 상단: 채팅방 이름 + 시간 + 읽지 않은 메시지 수 -->
                    <div class="d-flex justify-space-between align-start mb-1">
                      <div class="text-subtitle-1 font-weight-bold text-truncate" style="flex: 1; margin-right: 8px;">
                        {{ chat.customRoomName || chat.otherUserName }}
                      </div>
                      <!-- 시간+뱃지 묶음 -->
                      <div class="d-flex align-center flex-shrink-0">
                        <span class="text-caption text-grey-darken-1 mr-1">
                          {{ formatChatTime(chat.lastMessageTime) }}
                        </span>
                        <div v-if="chat.unreadCount > 0"
                          class="rounded-circle text-white text-caption font-weight-bold d-flex align-center justify-center flex-shrink-0"
                          style="background-color: orange; width: 20px; height: 20px; min-width: 20px;">
                          {{ chat.unreadCount }}
                        </div>
                      </div>
                    </div>
                    <!-- 하단: 마지막 메시지 -->
                    <div
                      class="text-body-2 text-grey-darken-1 text-truncate"
                      style="line-height: 1.2;"
                    >
                      {{ chat.lastMessage }}
                    </div>
                  </div>
                </div>
              </v-list-item>
              
              <!-- 개선된 빈 상태 -->
              <div v-if="!loadError && rooms.length === 0" class="empty-chat-state">
                <div class="empty-chat-content">
                  <div class="empty-chat-icon">
                    <v-icon size="64" color="orange lighten-3">mdi-chat-outline</v-icon>
                  </div>
                  <h3 class="empty-chat-title">아직 대화가 없어요</h3>
                  <p class="empty-chat-description">
                    게시글이나 강의에서 상대방 프로필을 클릭하여<br>
                    1:1 대화를 시작해보세요
                  </p>
                  <div class="empty-chat-features">
                    <div class="feature-item">
                      <v-icon size="20" color="orange">mdi-account-circle</v-icon>
                      <span>레시피 게시글에서 요리사 프로필 클릭</span>
                    </div>
                    <div class="feature-item">
                      <v-icon size="20" color="orange">mdi-play-circle</v-icon>
                      <span>강의에서 강사 프로필 클릭</span>
                    </div>
                    <div class="feature-item">
                      <v-icon size="20" color="orange">mdi-message-text</v-icon>
                      <span>1:1 대화하기 버튼으로 채팅 시작</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-list>
          </div>
        </v-sheet>
      </v-col>

      <!-- 채팅 상세 -->
      <v-col cols="12" md="6" class="chat-detail">
        <v-sheet
          class="h-100 d-flex flex-column justify-space-between"
          elevation="2"
        >
          <template v-if="selectedChatId === null">
            <div class="empty-chat-detail">
              <div class="empty-chat-detail-content">
                <div class="empty-chat-detail-icon">
                  <v-icon size="80" color="orange lighten-4">mdi-chat-bubble-outline</v-icon>
                </div>
                <h3 class="empty-chat-detail-title">채팅방을 선택해보세요</h3>
                <p class="empty-chat-detail-description">
                  왼쪽에서 채팅방을 선택하면 여기에 대화가 표시됩니다
                </p>
                <div class="empty-chat-detail-features">
                  <div class="feature-item">
                    <v-icon size="20" color="orange">mdi-check-circle</v-icon>
                    <span>실시간 메시지 전송</span>
                  </div>
                  <div class="feature-item">
                    <v-icon size="20" color="orange">mdi-check-circle</v-icon>
                    <span>파일 및 이미지 공유</span>
                  </div>
                  <div class="feature-item">
                    <v-icon size="20" color="orange">mdi-check-circle</v-icon>
                    <span>읽음 확인 기능</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <ChatDetailView v-else :chat="selectedChat" />
        </v-sheet>
      </v-col>
      <v-col md="1.5" />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import ChatDetailView from "@/views/chat/chatDetailScreen.vue";
import ErrorAlert from "@/components/common/ErrorAlert.vue";
import LoadingScreen from "@/components/common/LoadingScreen.vue";
import { formatChatTime } from '@/utils/timeUtils';

const chatStore = useChatStore();
const { rooms, currentRoomId, loading, totalUnreadCount, error, loadError } = storeToRefs(chatStore);

const selectChat = (roomId) => {
  chatStore.selectRoom(roomId);
};

const selectedChatId = computed(() => chatStore.currentRoomId);
const selectedChat = computed(() => chatStore.currentRoom);

const chatScroll = ref(null);
const visibleCount = ref(10);
const visibleChats = computed(() => rooms.value.slice(0, visibleCount.value));

const onScroll = () => {
  const el = chatScroll.value;
  if (!el) return;
  const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  if (bottom && visibleCount.value < rooms.value.length) {
    visibleCount.value += 5;
  }
};



onMounted(() => {
  chatStore.fetchMyChatRooms();
});
</script>

<style scoped>
/* 에러 컨테이너 스타일 */
.error-container {
  max-width: 1400px;
  margin: 0 auto 20px auto;
}

/* 빈 채팅 상태 스타일 */
.empty-chat-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.empty-chat-content {
  text-align: center;
  max-width: 300px;
}

.empty-chat-icon {
  margin-bottom: 24px;
}

.empty-chat-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.empty-chat-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.empty-chat-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34495e;
  font-size: 0.9rem;
  padding: 8px 16px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

/* 빈 채팅 상세 상태 스타일 */
.empty-chat-detail {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  padding: 40px;
  padding-top: 80px;
}

.empty-chat-detail-content {
  text-align: center;
  max-width: 400px;
}

.empty-chat-detail-icon {
  margin-bottom: 32px;
}

.empty-chat-detail-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.empty-chat-detail-description {
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.empty-chat-detail-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34495e;
  font-size: 0.9rem;
}

/* 채팅 목록 스타일 */
.chat-list {
  height: calc(100vh - 120px);
}

.chat-scroll-wrapper {
  height: calc(100vh - 200px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .empty-chat-title {
    font-size: 1.25rem;
  }
  
  .empty-chat-detail-title {
    font-size: 1.5rem;
  }
  
  .empty-chat-detail {
    padding: 20px;
  }
}
</style>
