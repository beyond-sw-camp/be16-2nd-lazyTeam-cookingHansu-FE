<template>
  <v-container fluid class="pa-6" style="margin-top: 80px;">
    <!-- 로딩 상태 -->
    <LoadingScreen 
      v-if="loading"
      title="채팅 목록을 불러오는 중"
      description="채팅 정보를 확인하고 있어요..."
    />

    <!-- 에러 상태 -->
    <v-row v-else-if="error" justify="center" class="mt-10 mb-10">
      <v-col cols="12" md="6" class="text-center">
        <ErrorAlert
          title="연결 오류"
          :message="error"
          @close="chatStore.clearError"
        />
      </v-col>
    </v-row>

    <!-- 채팅 화면 -->
    <template v-else-if="hasRooms">
      <v-row no-gutters class="chat-wrapper" style="height: calc(100vh - 270px);">
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
          
            <div
              ref="chatScroll"
              class="chat-scroll-wrapper"
              @scroll.passive="onScroll"
              style="height: calc(100vh - 280px); overflow-y: auto; direction: ltr;"
            >
              <v-list dense nav>
                <transition-group name="chat-list" tag="div">
                  <v-list-item
                    v-for="chat in visibleChats"
                    :key="chat.chatRoomId"
                    @click="selectChat(chat.chatRoomId)"
                    :class="{ 'bg-grey-lighten-4': chat.chatRoomId === selectedChatId }"
                    class="py-4 px-3 chat-item"
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
                </transition-group>
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
              <div
                class="fill-height d-flex flex-column align-center justify-center text-grey"
              >
                <v-icon size="48">mdi-chat-outline</v-icon>
                <div class="mt-2 text-subtitle-1">
                  채팅을 선택하여 대화를 시작하세요
                </div>
              </div>
            </template>

            <ChatDetailView v-else :chat="selectedChat" />
          </v-sheet>
        </v-col>
        <v-col md="1.5" />
      </v-row>
    </template>

    <!-- 채팅방이 없을 경우 -->
    <template v-else>
      <v-row justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-chat-outline</v-icon>
          <h3 class="mt-4">채팅방이 없습니다</h3>
          <p class="mt-2">다른 사용자와 대화를 시작해보세요!</p>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import ChatDetailView from "@/views/chat/chatDetailScreen.vue";
import { formatChatTime } from '@/utils/timeUtils';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const chatStore = useChatStore();
const { rooms, currentRoomId, loading, totalUnreadCount, error, hasRooms } = storeToRefs(chatStore);

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
.chat-scroll-wrapper {
  scrollbar-width: thin;
}

.chat-scroll-wrapper::-webkit-scrollbar {
  width: 4px;
}

.chat-scroll-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.chat-scroll-wrapper::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/* 채팅 컨테이너 전체 높이 고정 */
.chat-wrapper {
  height: calc(100vh - 200px);
}

/* 채팅 목록 영역 고정 높이 */
.chat-list {
  height: 100%;
}

/* 채팅 상세 영역 고정 높이 */
.chat-detail {
  height: 100%;
}

/* 채팅 목록 애니메이션 */
.chat-list-move,
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.3s ease;
}

.chat-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.chat-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.chat-item {
  transition: all 0.3s ease;
}

.chat-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>