<template>
  <v-container fluid class="pa-6 chat-container">
    <LoadingScreen 
      v-if="loading && !hasRooms"
      title="채팅 목록을 불러오는 중"
      description="채팅 정보를 확인하고 있어요..."
    />

    <v-row v-else-if="error" justify="center" class="mt-10 mb-10">
      <v-col cols="12" md="6" class="text-center">
        <ErrorAlert
          title="연결 오류"
          :message="error"
          @close="chatStore.clearError"
        />
      </v-col>
    </v-row>

    <template v-else>
      <v-row no-gutters class="chat-wrapper">
        <!-- 데스크탑에서는 좌측 여백, 모바일에서는 제거 -->
        <v-col md="1.5" class="d-none d-md-block" />
        
        <!-- 채팅 목록 -->
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
              @scroll="onScroll"
            >
              <div v-if="loading && rooms.length === 0" class="pa-4">
                <div class="text-center">
                  <v-progress-circular indeterminate color="primary" size="24" />
                  <div class="mt-2 text-caption text-grey">
                    채팅 목록을 불러오는 중...
                  </div>
                </div>
              </div>
              
              <!-- 추가 로딩 인디케이터 -->
              <div v-if="isLoadingMore" class="pa-4">
                <div class="text-center">
                  <v-progress-circular indeterminate color="primary" size="24" />
                  <div class="mt-2 text-caption text-grey">
                    더 많은 채팅방을 불러오는 중...
                  </div>
                </div>
              </div>
              
              <v-list v-else dense nav>
                <transition-group name="chat-list" tag="div">
                  <v-list-item
                    v-for="chat in rooms"
                    :key="chat.roomId"
                    @click="selectChat(chat.roomId)"
                    :class="{ 'bg-grey-lighten-4': chat.roomId === selectedChatId }"
                    class="py-4 px-3 chat-item"
                  >
                    <div class="d-flex w-100 align-start">
                      <v-avatar size="48" class="mr-4 flex-shrink-0">
                        <template v-if="chat.otherUserProfileImage">
                          <v-img :src="chat.otherUserProfileImage" />
                        </template>
                        <template v-else>
                          <span class="text-h6 font-weight-bold">{{ chat.otherUserNickname?.charAt(0) || 'U' }}</span>
                        </template>
                      </v-avatar>

                      <div class="flex-grow-1 min-width-0 d-flex flex-column" style="width: 0;">
                        <div class="d-flex justify-space-between align-start mb-1">
                          <div class="text-subtitle-1 font-weight-bold text-truncate" style="flex: 1; margin-right: 8px;">
                            {{ chat.customRoomName || chat.otherUserName }}
                          </div>
                          <div class="d-flex align-center flex-shrink-0">
                            <span class="text-caption text-grey-darken-1 mr-1">
                              {{ formatChatTime(chat.lastMessageTime) }}
                            </span>
                            <div v-if="chat.newMessageCount > 0"
                              class="rounded-circle text-white text-caption font-weight-bold d-flex align-center justify-center flex-shrink-0"
                              style="background-color: orange; width: 20px; height: 20px; min-width: 20px;">
                              {{ chat.newMessageCount }}
                            </div>
                          </div>
                        </div>

                        <div class="text-body-2 text-grey-darken-1 text-truncate" style="line-height: 1.2;">
                          {{ chat.lastMessage }}
                        </div>
                      </div>
                    </div>
                  </v-list-item>
                </transition-group>

                <v-list-item v-if="!loading && rooms.length === 0" class="text-center">
                  <div class="d-flex flex-column align-center justify-center py-8">
                    <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
                    <div class="mt-2 text-subtitle-1 text-grey">
                      아직 채팅방이 없습니다
                    </div>
                  </div>
                </v-list-item>
              </v-list>
            </div>
          </v-sheet>
        </v-col>

        <!-- 채팅 상세 화면 -->
        <v-col cols="12" md="6" class="chat-detail">
          <v-sheet class="h-100 d-flex flex-column justify-space-between" elevation="2">
            <template v-if="selectedChatId === null">
              <div class="fill-height d-flex flex-column align-center justify-center text-grey">
                <v-icon size="48">mdi-chat-outline</v-icon>
                <div class="mt-2 text-subtitle-1">
                  채팅을 선택하여 대화를 시작하세요
                </div>
              </div>
            </template>
            <ChatDetailView v-else :chat="selectedChat" />
          </v-sheet>
        </v-col>
        
        <!-- 데스크탑에서는 우측 여백, 모바일에서는 제거 -->
        <v-col md="1.5" class="d-none d-md-block" />
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import { useAuthStore } from '@/store/auth/auth';
import ChatDetailView from "@/views/chat/chatDetailScreen.vue";
import { formatChatTime } from '@/utils/timeUtils';
import LoadingScreen from '@/components/common/LoadingScreen.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();
const { rooms, currentRoomId, loading, totalUnreadCount, error } = storeToRefs(chatStore);
const hasRooms = computed(() => chatStore.hasRooms);

// ✅ 추가: 채팅방 선택 시 읽음 처리
const selectChat = async (roomId) => {
  // 채팅방 선택 시 URL을 깔끔하게 정리 (autoSelect 파라미터 제거)
  if (route.query.autoSelect || route.query.roomId) {
    router.replace('/chat');
  }
  
  // ✅ 제거: 이전 채팅방 읽음 처리 제거 (상대방 기준으로 관리)
  
  chatStore.selectRoom(roomId);
};

const selectedChatId = computed(() => chatStore.currentRoomId);
const selectedChat = computed(() => chatStore.currentRoom);

const chatScroll = ref(null);
const isLoadingMore = ref(false);

const onScroll = async (event) => {
  const el = event.target;
  if (!el) return;
  
  // 스크롤이 하단에 가까워지면 더 많은 채팅방을 로드
  const scrollBottom = el.scrollTop + el.clientHeight;
  const scrollHeight = el.scrollHeight;
  
  if (scrollBottom >= scrollHeight - 20 && !isLoadingMore.value) {
    const pagination = chatStore.roomsPagination;
    if (pagination.hasNext && !pagination.isLoading) {
      await loadMoreChatRooms();
    }
  }
};

// ✅ [NEW] 더 많은 채팅방 로드
const loadMoreChatRooms = async () => {
  if (isLoadingMore.value) return;
  
  isLoadingMore.value = true;
  try {
    await chatStore.loadMoreChatRooms();
  } finally {
    isLoadingMore.value = false;
  }
};

// ✅ [NEW] autoSelect 파라미터 감지하여 새로 생성된 채팅방 자동 선택
const checkAutoSelect = () => {
  if (route.query.autoSelect === 'true' && rooms.value.length > 0) {
    
    // roomId 파라미터가 있으면 해당 ID의 채팅방을 선택
    if (route.query.roomId) {
      const targetRoomId = parseInt(route.query.roomId);
      const targetRoom = rooms.value.find(room => room.roomId === targetRoomId);
      
      if (targetRoom) {
        chatStore.selectRoom(targetRoom.roomId);
        
        // ✅ 수정: URL 파라미터는 유지하고 채팅방만 선택
        // router.replace('/chat'); // 이 줄 제거
      } else {
        // 에러가 있어도 URL은 정리
        router.replace('/chat');
      }
    } else {
      // roomId가 없으면 첫 번째 채팅방을 선택 (fallback)
      const firstRoom = rooms.value[0];
      if (firstRoom) {
        chatStore.selectRoom(firstRoom.roomId);
        
        // ✅ 수정: URL 파라미터는 유지하고 채팅방만 선택
        // router.replace('/chat'); // 이 줄 제거
      }
    }
  }
};

// ✅ 추가: 채팅방 목록이 변경될 때마다 autoSelect 체크
watch(rooms, (newRooms) => {
  if (newRooms.length > 0) {
    checkAutoSelect();
  }
}, { immediate: false });

// ✅ 추가: 라우터 변경 감지하여 채팅방 선택 초기화 (autoSelect가 아닌 경우만)
watch(() => route.path, (newPath) => {
  if (newPath === '/chat') {
    // autoSelect가 있으면 채팅방 선택 유지, 없으면 초기화
    if (chatStore.currentRoomId && !route.query.autoSelect) {
      chatStore.currentRoomId = null;
    } else if (route.query.autoSelect) {
    }
  }
});

// ✅ 추가: route.query 변경 감지 (더 정확한 감지)
watch(() => route.query, (newQuery, oldQuery) => {
  if (route.path === '/chat') {
    
    // autoSelect가 사라졌을 때만 채팅방 선택 초기화
    if (oldQuery?.autoSelect && !newQuery.autoSelect && chatStore.currentRoomId) {
      chatStore.currentRoomId = null;
    }
  }
}, { deep: true });

// ✅ 추가: onMounted 복원
onMounted(async () => {
  // 로그인 상태 확인
  if (!authStore.getIsAuthenticated || !authStore.user?.id) {
    router.push('/login');
    return;
  }
  
  // ✅ 추가: 페이지 진입 시 채팅방 선택 상태 초기화 (autoSelect가 아닌 경우만)
  if (chatStore.currentRoomId && !route.query.autoSelect) {
    chatStore.currentRoomId = null;
  } else if (route.query.autoSelect) {
  }
  
  await chatStore.fetchMyChatRooms();
  
  // 채팅방 목록 로드 완료 후 autoSelect 체크
  checkAutoSelect();
});

// ✅ 제거: 현재 선택된 채팅방 변경 시 읽음 처리 제거 (상대방 기준으로 관리)
</script>

<style scoped>
.chat-container {
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}

.chat-scroll-wrapper { 
  scrollbar-width: thin; 
  height: calc(100vh - 350px);
  overflow-y: auto; 
  direction: ltr;
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

.chat-wrapper { 
  height: calc(100vh - 200px); 
}

.chat-list { 
  height: 100%; 
}

.chat-detail { 
  height: 100%; 
}

.chat-list-move, .chat-list-enter-active, .chat-list-leave-active { 
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

/* 모바일 반응형 스타일 */
@media (max-width: 960px) {
  .chat-container {
    margin-top: 80px;
    padding: 16px !important;
  }
  
  .chat-wrapper {
    height: auto;
    min-height: calc(100vh - 200px);
  }
  
  .chat-list {
    margin-bottom: 16px;
    height: auto;
    min-height: 400px;
  }
  
  .chat-detail {
    height: auto;
    min-height: 500px;
  }
  
  .chat-scroll-wrapper {
    height: 350px;
  }
  
  /* 모바일에서 채팅 목록과 상세 화면을 세로로 배치 */
  .chat-list, .chat-detail {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .chat-container {
    margin-top: 80px;
    padding: 12px !important;
  }
  
  .chat-scroll-wrapper {
    height: 300px;
  }
  
  .chat-list {
    min-height: 350px;
    margin-bottom: 12px;
  }
  
  .chat-detail {
    min-height: 450px;
  }
  
  /* 모바일에서 패딩 조정 */
  .chat-list .v-sheet,
  .chat-detail .v-sheet {
    padding: 12px !important;
  }
}
</style>
