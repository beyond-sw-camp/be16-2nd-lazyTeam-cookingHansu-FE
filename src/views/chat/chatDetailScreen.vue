<template>
  <div class="d-flex flex-column h-100">
    <div v-if="error" class="d-flex justify-center align-center pa-8">
      <div style="max-width: 500px; width: 100%;">
        <ErrorAlert
          title="연결 오류"
          :message="error"
          @close="chatStore.clearError"
        />
      </div>
    </div>

    <template v-else>
      <!-- 헤더 -->
      <div class="d-flex align-center justify-space-between px-4 py-3 border-b grey lighten-4">
        <div class="d-flex align-center">
          <v-avatar color="grey-lighten-2" size="36" class="mr-2">
            <v-img :src="partnerAvatar" />
          </v-avatar>
          <span class="subtitle-1 font-weight-medium">{{ partnerName }}</span>
        </div>
        <div class="d-flex align-center">
          <v-menu v-model="showRoomOptions" :close-on-content-click="false" offset-y>
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="cursor-pointer" style="color: rgba(0, 0, 0, 0.6);">
                mdi-dots-horizontal
              </v-icon>
            </template>
            <v-list>
              <v-list-item @click="editRoomName">
                <v-list-item-title>채팅방 이름 변경</v-list-item-title>
              </v-list-item>
              <v-list-item @click="leaveRoom" class="text-error">
                <v-list-item-title>채팅방 나가기</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- 다이얼로그들 -->
      <v-dialog v-model="showNameEditDialog" max-width="400" persistent>
        <v-card>
          <v-card-title class="text-center">채팅방 이름 변경</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newRoomName"
              label="새로운 채팅방 이름"
              variant="outlined"
              :placeholder="currentRoom?.customRoomName || ''"
              @keyup.enter="confirmRoomNameChange"
              autofocus
            />
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn @click="cancelRoomNameChange">취소</v-btn>
            <v-btn color="primary" @click="confirmRoomNameChange">확인</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <DeleteConfirmModal
        v-model="showLeaveConfirmDialog"
        title="채팅방을 나가시겠습니까?"
        message="채팅방을 나가면 모든 메시지가 유실되며 복구할 수 없습니다."
        :item-info="leaveRoomInfo"
        :loading="leaving"
        @confirm="confirmLeaveRoom"
        @cancel="cancelLeaveRoom"
      />

      <v-dialog v-model="showImageDialog" max-width="90vw" max-height="90vh">
        <v-card>
          <v-card-actions class="justify-end">
            <v-btn icon @click="closeImageDialog"><v-icon>mdi-close</v-icon></v-btn>
          </v-card-actions>
          <v-card-text class="text-center pa-0">
            <v-img :src="selectedImageUrl" max-height="80vh" contain class="mx-auto" />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- 메시지 영역 -->
      <div
        class="flex-grow-1 pa-4 overflow-y-auto chat-scroll"
        ref="chatContainer"
        @scroll="handleScroll"
      >
        <!-- ✅ 상단 프리로드 센티넬: 꼭대기 '전'에 감지 -->
        <div ref="topSentinel" style="height:1px;"></div>

        <!-- 로딩 인디케이터 -->
        <div v-if="isLoadingMore" class="text-center py-4">
          <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
          <div class="text-caption text-grey mt-2">이전 메시지를 불러오는 중...</div>
        </div>
        
        <div>
          <div v-for="(msg, index) in chatMessages" :key="msg.id || index" class="mb-1">
            <!-- 날짜 구분선 -->
            <div v-if="shouldShowDateSeparator(index)" class="text-center my-4">
              <div class="d-flex align-center">
                <div class="flex-grow-1" style="height: 1px; background-color: #e0e0e0;"></div>
                <v-chip size="small" color="grey-darken-1" variant="tonal" class="text-caption mx-3" style="background-color: #f5f5f5;">
                  {{ formatDateSeparator(msg.createdAt) }}
                </v-chip>
                <div class="flex-grow-1" style="height: 1px; background-color: #e0e0e0;"></div>
              </div>
            </div>

            <div :class="['d-flex', msg.senderId === myId ? 'justify-end' : 'justify-start']">
              
              <!-- 내 메시지 -->
              <template v-if="msg.senderId === myId">
                <div class="d-flex align-end mr-1" style="min-width: 50px;">
                  <div class="d-flex flex-column align-end">
                    <div class="mb-1" v-if="msg.unreadCount > 0">
                      <div class="d-flex align-center justify-center rounded-circle text-white text-caption font-weight-bold"
                          style="background-color: #ff9500; width: 18px; height: 18px; min-width: 18px; font-size: 11px; line-height: 1;">
                        {{ msg.unreadCount }}
                      </div>
                    </div>
                    <span class="text-caption text-grey-darken-1" v-if="shouldShowTime(index, true)">
                      {{ formatRelativeTime(msg.createdAt) }}
                    </span>
                  </div>
                </div>

                <div class="d-inline-flex flex-column pa-2 rounded-lg bg-orange-lighten-5 align-end" style="max-width: 70%; word-break: break-word">
                  <span v-if="msg.message" class="text-body-2">{{ msg.message }}</span>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'IMAGE').length > 0" class="mt-1">
                    <div 
                      class="image-grid-simple"
                      :style="{
                        width: getImageGridLayout(msg.files.filter(f => f.fileType === 'IMAGE').length).containerWidth,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: getImageGridLayout(msg.files.filter(f => f.fileType === 'IMAGE').length).gap
                      }"
                    >
                      <div v-for="(file, i) in msg.files.filter(f => f.fileType === 'IMAGE')" :key="file.id" class="image-item-simple" :style="getImageItemStyle()">
                        <v-img :src="file.fileUrl" :width="getImageItemStyle().width" :height="getImageItemStyle().height"
                               class="rounded" :alt="file.fileName" @click="openImage(file.fileUrl)" cover />
                      </div>
                    </div>
                  </div>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'VIDEO').length > 0" class="mt-1">
                    <div v-for="file in msg.files.filter(f => f.fileType === 'VIDEO')" :key="file.id" class="mb-1">
                      <video :src="file.fileUrl" controls :width="120" :height="90" class="rounded" :alt="file.fileName" />
                    </div>
                  </div>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'OTHER').length > 0" class="mt-1">
                    <div v-for="file in msg.files.filter(f => f.fileType === 'OTHER')" :key="file.id" class="mb-1">
                      <v-btn variant="text" color="primary" :href="file.fileUrl" download :title="file.fileName"
                             class="pa-0 text-left" style="min-width: auto; text-transform: none;">
                        <v-icon size="small" class="mr-1">mdi-file</v-icon>
                        {{ file.fileName }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 상대 메시지 -->
              <template v-else>
                <div class="d-inline-flex flex-column pa-2 rounded-lg bg-grey-lighten-4 align-start" style="max-width: 70%; word-break: break-word">
                  <span v-if="msg.message" class="text-body-2">{{ msg.message }}</span>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'IMAGE').length > 0" class="mt-1">
                    <div 
                      class="image-grid-simple"
                      :style="{
                        width: getImageGridLayout(msg.files.filter(f => f.fileType === 'IMAGE').length).containerWidth,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: getImageGridLayout(msg.files.filter(f => f.fileType === 'IMAGE').length).gap
                      }"
                    >
                      <div v-for="(file, i) in msg.files.filter(f => f.fileType === 'IMAGE')" :key="file.id" class="image-item-simple" :style="getImageItemStyle()">
                        <v-img :src="file.fileUrl" :width="getImageItemStyle().width" :height="getImageItemStyle().height"
                               class="rounded" :alt="file.fileName" @click="openImage(file.fileUrl)" cover />
                      </div>
                    </div>
                  </div>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'VIDEO').length > 0" class="mt-1">
                    <div v-for="file in msg.files.filter(f => f.fileType === 'VIDEO')" :key="file.id" class="mb-1">
                      <video :src="file.fileUrl" controls :width="120" :height="90" class="rounded" :alt="file.fileName" />
                    </div>
                  </div>

                  <div v-if="msg.files && msg.files.filter(f => f.fileType === 'OTHER').length > 0" class="mt-1">
                    <div v-for="file in msg.files.filter(f => f.fileType === 'OTHER')" :key="file.id" class="mb-1">
                      <v-btn variant="text" color="primary" :href="file.fileUrl" download :title="file.fileName"
                             class="pa-0 text-left" style="min-width: auto; text-transform: none;">
                        <v-icon size="small" class="mr-1">mdi-file</v-icon>
                        {{ file.fileName }}
                      </v-btn>
                    </div>
                  </div>
                </div>

                <div v-if="shouldShowTime(index, false)" class="d-flex align-end ml-1" style="min-width: 50px;">
                  <span class="text-caption text-grey-darken-1">{{ formatRelativeTime(msg.createdAt) }}</span>
                </div>
              </template>
            </div>
          </div>

          <SkeletonChat 
            v-if="showSkeleton && chatMessages.length === 0"
            :message-count="6"
            :fade-in="true"
          />

          <div v-else-if="!showSkeleton && !loading && chatMessages.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
            <div class="mt-2 text-subtitle-1 text-grey">아직 메시지가 없습니다</div>
          </div>
        </div>
      </div>

      <!-- 파일 미리보기 -->
      <FilePreview
        v-if="selectedFiles.length > 0"
        :selected-files="selectedFiles"
        @remove="removeSelectedFile"
        @remove-all="removeAllFiles"
      />

      <!-- 메시지 입력 영역 -->
      <div class="pa-2 border-t d-flex align-center message-input-area">
        <v-text-field
          ref="messageInput"
          v-model="message"
          :placeholder="hasFiles() ? '파일이 선택되었습니다. 텍스트를 입력하려면 파일을 제거하세요.' : '메시지를 입력하세요...'"
          hide-details
          variant="outlined"
          class="flex-grow-1 mr-2 message-input"
          rounded
          density="compact"
          @keyup.enter="sendMessage"
          @input="onTextInputWrapper"
          :disabled="loading || hasFiles()"
        />
        <v-btn 
          icon 
          @click="triggerFileInput" 
          :disabled="loading || !canAddMoreFiles()" 
          color="primary"
          :title="!canAddMoreFiles() ? '최대 10개까지 선택 가능합니다' : '파일 첨부'"
          class="file-attach-btn"
        >
          <v-icon>mdi-paperclip</v-icon>
        </v-btn>
        <input ref="fileInput" type="file" multiple class="d-none" @change="handleFileChangeWrapper" />
        <v-btn 
          color="orange" 
          icon 
          class="ml-2 send-btn" 
          :disabled="isSending || loading || (!message.trim() && !hasFiles())" 
          @click="sendMessage"
          :title="!message.trim() && !hasFiles() ? '메시지나 파일을 입력해주세요' : '전송'"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import { useAuthStore } from '@/store/auth/auth';
import { formatRelativeTime } from '@/utils/timeUtils';
import { useFileUpload } from '@/composables/useFileUpload';
import { useDialog } from '@/composables/useDialog';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import SkeletonChat from '@/components/common/SkeletonChat.vue';
import FilePreview from '@/components/common/FilePreview.vue';

const props = defineProps({
  chat: { type: Object, default: () => ({}) }
});

const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();
const { messages, currentRoomId, loading, error, onlineUsers } = storeToRefs(chatStore);



const showSkeleton = ref(false);
const skeletonTimer = ref(null);

const chatContainer = ref(null);
const topSentinel = ref(null);
let topObserver = null;

const myId = ref(authStore.user?.id);

// 사용자 ID가 변경될 때마다 업데이트
watch(() => authStore.user?.id, (newId) => {
  if (newId) {
    myId.value = newId;
  } else {
    console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
    router.push('/login');
  }
}, { immediate: true });

/* -----------------------------
 * 스크롤/프리로드 상태
 * ----------------------------- */
const isLoadingMore = ref(false);
const isPrepending = ref(false);
const scrollTimeout = ref(null);
const TOP_PRELOAD_THRESHOLD_PX = 300; // 상단에서 300px 이내에 있을 때 API 호출
const BOTTOM_STICK_THRESHOLD_PX = 80;

// 하단 고정 여부(사용자가 하단 근처일 때만 true)
const shouldStickToBottom = ref(true);

// 최초 1회 instant 하단 점프 처리 여부
const didInitialBottomScroll = ref(false);

const isNearBottom = () => {
  const el = chatContainer.value;
  if (!el) return true;
  const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
  return gap <= BOTTOM_STICK_THRESHOLD_PX;
};
const updateStickiness = () => { shouldStickToBottom.value = isNearBottom(); };

// 스크롤 이벤트(백업 프리로드 & stickiness 갱신)
const handleScroll = (event) => {
  updateStickiness();
  if (scrollTimeout.value) clearTimeout(scrollTimeout.value);
  scrollTimeout.value = setTimeout(async () => {
    const { scrollTop } = event.target;
    if (scrollTop <= TOP_PRELOAD_THRESHOLD_PX) {
      await maybeLoadMore("fallback-scroll-top");
    }
  }, 100);
};

// 맨 아래로 이동하는 통합 함수
const scrollToBottom = (behavior = "auto") => {
  const el = chatContainer.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight - el.clientHeight, behavior });
};

// 초기 로딩 시 즉시 맨 아래로 이동 (모션 없음)
const jumpToBottomInstant = () => {
  const el = chatContainer.value;
  if (!el) return;
  const prev = el.style.scrollBehavior;
  el.style.scrollBehavior = 'auto';
  el.scrollTop = el.scrollHeight;
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
    el.style.scrollBehavior = prev || '';
  });
};

// 상단 프리로드: 조건 검사 후 로드
const maybeLoadMore = async () => {
  if (!currentRoomId.value) return;
  const pagination = chatStore.pagination?.[currentRoomId.value];
  if (!pagination || !pagination.hasNext || pagination.isLoading || isLoadingMore.value) return;
  await loadMoreMessages();
};

// 이전 메시지 로드(프리펜드) + 위치 보정
const loadMoreMessages = async () => {
  if (!currentRoomId.value) return;

  const el = chatContainer.value;
  const beforeScrollTop = el?.scrollTop ?? 0;
  const beforeScrollHeight = el?.scrollHeight ?? 0;

  isLoadingMore.value = true;
  isPrepending.value = true;
  try {
    await chatStore.loadMoreMessages(currentRoomId.value);
    await nextTick();
    if (el) {
      const afterScrollHeight = el.scrollHeight;
      const delta = afterScrollHeight - beforeScrollHeight;
      el.scrollTop = beforeScrollTop + delta; // 눈앞 메시지 유지
    }
  } finally {
    isLoadingMore.value = false;
    requestAnimationFrame(() => { isPrepending.value = false; });
  }
};

/* -----------------------------
 * 메시지/읽음 계산
 * ----------------------------- */
// 각 메시지별 unreadCount 계산 (Store의 실시간 계산 사용)
const chatMessages = computed(() => {
  const list = chatStore.messages[currentRoomId.value] || [];
  if (list.length === 0) return [];
  
  // Store의 실시간 unread count 계산 사용
  const totalUnreadCount = chatStore.getUnreadCount(currentRoomId.value);
  
  
  return list.map((msg) => {
    // ✅ 수정: 각 메시지별로 개별 unread count 계산
    let unreadCount = 0;
    
          if (msg.senderId === myId.value) {
      // 내 메시지: 상대방이 읽었으면 0, 읽지 않았으면 1
      // ✅ 수정: Store의 개별 메시지 unread count 계산 함수 사용
      unreadCount = chatStore.getMessageUnreadCount(currentRoomId.value, msg.id);
    } else {
      // 상대방 메시지: 내가 읽었으면 0, 읽지 않았으면 1
      // ✅ 수정: 상대방 메시지는 항상 0 (내가 읽은 상태)
      unreadCount = 0;
    }
    
    // ✅ Store에서 이미 온라인 상태를 고려하여 계산했으므로 그대로 사용
    const displayUnreadCount = unreadCount;
    
    

    
    return {
      ...msg,
      unreadCount: displayUnreadCount
    };
  });
});

// ✅ 수정: Store의 실시간 unread count 계산 사용
watch(
  currentRoomId,
  async (newRoomId, oldRoomId) => {
    if (newRoomId && newRoomId !== oldRoomId) {
      
      // 메시지가 로드될 때까지 잠시 대기
      await nextTick();
      

    }
  }
);

// 메시지 로드 완료 후 unread count 확인
watch(
  () => chatStore.messages[currentRoomId.value],
  (newMessages, oldMessages) => {
    if (!newMessages || !currentRoomId.value) return;
    

    
    // 새로운 메시지가 추가되었는지 확인
    if (oldMessages && newMessages.length > oldMessages.length) {
      const newMessage = newMessages[newMessages.length - 1];
      
              // 상대방 메시지이고 현재 방에 있을 때만 읽음처리
        if (newMessage.senderId !== myId.value && newMessage.roomId === currentRoomId.value) {
        
        // ✅ 수정: Store의 디바운스된 읽음 처리 사용
        chatStore.queueReadForRoom(currentRoomId.value, newMessage.id);
      }
    }
  },
  { deep: true }
);

/* -----------------------------
 * 자동 하단 스크롤 정책
 * ----------------------------- */
watch(
  [currentRoomId, () => chatMessages.value.length],
  async ([rid, len], [_pr, _pl]) => {
    if (!rid) return;
    if (!didInitialBottomScroll.value && len > 0) {
      await nextTick();
      // 메시지 로드 완료 후 즉시 스크롤
      jumpToBottomInstant();
      didInitialBottomScroll.value = true;
      updateStickiness();
    }
  }
);

// 메시지 변경 시 스크롤 (중복 제거)
watch(
  chatMessages,
  async () => {
    await nextTick();
    if (!didInitialBottomScroll.value) return;
    if (isPrepending.value) return;
    if (shouldStickToBottom.value) {
      scrollToBottom("auto");
    }
  },
  { deep: true }
);

/* -----------------------------
 * 스켈레톤 표시
 * ----------------------------- */
const startSkeletonTimer = () => {
  if (skeletonTimer.value) clearTimeout(skeletonTimer.value);
  showSkeleton.value = true;
  skeletonTimer.value = window.setTimeout(() => {
    if (!loading.value) showSkeleton.value = false;
  }, 300);
};
const stopSkeletonTimer = () => {
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
    skeletonTimer.value = null;
  }
  setTimeout(() => { showSkeleton.value = false; }, 100);
};
watch(loading, (n, o) => {
  if (n && !o) startSkeletonTimer();
  else if (!n && o) stopSkeletonTimer();
});
watch(currentRoomId, (n, o) => {
  if (n && n !== o) {
    didInitialBottomScroll.value = false;
    nextTick(() => {
      if (chatMessages.value.length === 0) startSkeletonTimer();
    });
  }
});

/* -----------------------------
 * 라우트 이탈/언마운트 정리
 * ----------------------------- */
onBeforeRouteLeave(async (_to, _from, next) => {
  if (currentRoomId.value) {
    // ✅ 제거: 라우트 이탈 전 읽음 처리 제거 (상대방 기준으로 관리)
    await chatStore.disconnectWebSocket(currentRoomId.value);
  }
  next();
});

// 채팅방을 나갈 때 정리 (onBeforeUnmount에서 통합 처리)

/* -----------------------------
 * 마운트: 프리로드 옵저버 세팅
 * ----------------------------- */
onMounted(() => {
  chatStore.initPresenceLifecycle();

  // ✅ 제거: 페이지 가시성 변경 시 읽음 처리 제거 (상대방 기준으로 관리)

  const mountObserver = () => {
    if (!chatContainer.value || !topSentinel.value) return;
    if (topObserver) {
      try { topObserver.disconnect(); } catch {}
      topObserver = null;
    }
    topObserver = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          await maybeLoadMore();
        }
      },
      {
        root: chatContainer.value,
        rootMargin: '400px 0px 0px 0px',
        threshold: 0.0,
      }
    );
    topObserver.observe(topSentinel.value);
  };

  mountObserver();

  watch(currentRoomId, () => {
    nextTick(() => mountObserver());
  });

  if (currentRoomId.value && chatMessages.value.length === 0) {
    startSkeletonTimer();
  }

  // ✅ 추가: 개발자 도구에서 테스트할 수 있도록 전역 함수로 노출


  // ✅ 제거: 컴포넌트 언마운트 시 이벤트 리스너 정리 (읽음 처리 제거)
});

// 중복된 메시지 스크롤 이벤트 제거 (위의 watch에서 처리)

// 채팅방 변경 시 초기화 및 즉시 스크롤
watch(currentRoomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    // 채팅방 변경 시 초기화
    didInitialBottomScroll.value = false;
    shouldStickToBottom.value = true;
    
    // 채팅방 입장 시 즉시 맨 아래로 스크롤 (지연 없이)
    await nextTick();
    jumpToBottomInstant();
    didInitialBottomScroll.value = true;
    updateStickiness();
  }
});

/* -----------------------------
 * 파일/입력/다이얼로그
 * ----------------------------- */
const message = ref("");
const isSending = ref(false);
const {
  selectedFiles, selectedFileNames, selectedFileTypes, fileInput,
  handleFileChange, removeSelectedFile, removeAllFiles, triggerFileInput, onTextInput,
  hasFiles, canInputText, canAddMoreFiles
} = useFileUpload();

const {
  showImageDialog, selectedImageUrl,
  showNameEditDialog, newRoomName,
  openImage, closeImageDialog,
  resetNameEditDialog, resetLeaveConfirmDialog
} = useDialog();

const showRoomOptions = ref(false);
const currentRoom = computed(() => chatStore.currentRoom);
const partnerName = computed(() => currentRoom.value?.otherUserNickname || currentRoom.value?.otherUserName || '상대방');
const partnerAvatar = computed(() => currentRoom.value?.otherUserProfileImage || '');

const handleFileChangeWrapper = (e) => handleFileChange(e, message);
const onTextInputWrapper = () => {
  if (message.value.trim() && hasFiles()) {
    removeAllFiles();
  }
};

// 시간/구분선 표시
const shouldShowTime = (index, _isMyMessage) => {
  const currentMsg = chatMessages.value[index];
  const nextMsg = chatMessages.value[index + 1];
  if (!nextMsg) return true;
  const isSameSender = currentMsg.senderId === nextMsg.senderId;
  if (!isSameSender) return true;

  const a = new Date(currentMsg.createdAt);
  const b = new Date(nextMsg.createdAt);
  const key = (d) => d.getFullYear()*100000000 + (d.getMonth()+1)*1000000 + d.getDate()*10000 + d.getHours()*100 + d.getMinutes();
  return key(a) !== key(b);
};

const shouldShowDateSeparator = (index) => {
  const currentMsg = chatMessages.value[index];
  const prevMsg = chatMessages.value[index - 1];
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.createdAt);
  const prevDate = new Date(prevMsg.createdAt);
  return currentDate.toDateString() !== prevDate.toDateString();
};

const formatDateSeparator = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const getImageGridLayout = (count) => {
  const imageSize = '48px';
  const gap = '3px';
  const maxPerRow = 5;
  const widthPx = (48 * Math.min(count, maxPerRow)) + (3 * (Math.min(count, maxPerRow) - 1));
  return { imageSize, gap, maxPerRow, containerWidth: `${widthPx}px` };
};
const getImageItemStyle = () => ({ width: '48px', height: '48px' });

// 방 이름 변경/나가기
const editRoomName = () => {
  newRoomName.value = currentRoom.value?.customRoomName || '';
  showNameEditDialog.value = true;
  showRoomOptions.value = false;
};
const confirmRoomNameChange = async () => {
  if (newRoomName.value.trim()) {
    try { 
      if (currentRoomId.value) {
        await chatStore.updateRoomName(currentRoomId.value, newRoomName.value.trim()); 
        resetNameEditDialog(); 
      }
    } catch (e) { console.error('채팅방 이름 변경 실패:', e); }
  }
};
const cancelRoomNameChange = () => { resetNameEditDialog(); };

const showLeaveConfirmDialog = ref(false);
const leaving = ref(false);
const leaveRoomInfo = computed(() => ({ title: currentRoom.value?.customRoomName || '채팅방' }));

const leaveRoom = () => { showLeaveConfirmDialog.value = true; showRoomOptions.value = false; };
const confirmLeaveRoom = async () => {
  try {
    leaving.value = true;
    if (currentRoomId.value) {
      await chatStore.leaveRoom(currentRoomId.value);
    }
    resetLeaveConfirmDialog();
  } catch (e) {
    console.error('채팅방 나가기 실패:', e);
  } finally {
    leaving.value = false;
  }
};
const cancelLeaveRoom = () => { resetLeaveConfirmDialog(); };

// 전송
const sendMessage = async (event) => {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  if (isSending.value) return;

  const files = selectedFiles.value.map((item) => item.file);
  const hasText = message.value.trim();
  const hasFiles = files.length > 0;
  if (!hasText && !hasFiles) return;

  isSending.value = true;
  try {
    if (hasText) await chatStore.sendMessage(message.value, null);
    else await chatStore.sendMessage("", files);
    message.value = "";
    removeAllFiles();
    
    await nextTick();
    requestAnimationFrame(() => {
      scrollToBottom("auto");
      updateStickiness();
    });
  } catch (e) {
    console.error('메시지 전송 실패:', e);
  } finally {
    isSending.value = false;
  }
};



// ✅ 추가: 컴포넌트 언마운트 시 전역 함수 제거
onBeforeUnmount(() => {
  if (import.meta.env.DEV) {
    delete window.debugChatRoom;
    delete window.testUnreadCount;
    delete window.simulateOtherUserRead;
  }
  
  // ✅ 제거: 컴포넌트 언마운트 전 읽음 처리 제거 (상대방 기준으로 관리)
  
  // WebSocket 연결 해제
  if (currentRoomId.value) {
    chatStore.disconnectWebSocket(currentRoomId.value);
  }
  
  // 스크롤 타이머 정리
  if (scrollTimeout.value) clearTimeout(scrollTimeout.value);
  
});
</script>

<style scoped>
/* 공통 높이 변수 */
.chat-scroll { 
  --chat-scroll-height: calc(100vh - 380px);
  --chat-scroll-height-tablet: calc(100vh - 320px);
  --chat-scroll-height-mobile: calc(100vh - 280px);
  
  overflow-y: auto; 
  scrollbar-width: thin; 
  scroll-behavior: auto;
  height: var(--chat-scroll-height);
}

.chat-scroll::-webkit-scrollbar { 
  width: 4px; 
}

.chat-scroll::-webkit-scrollbar-thumb { 
  background-color: rgba(0, 0, 0, 0.2); 
  border-radius: 4px; 
}

.chat-scroll::-webkit-scrollbar-track { 
  background-color: rgba(0, 0, 0, 0.05); 
  border-radius: 4px; 
}

.chat-container { 
  height: calc(100vh - 120px); 
  display: flex; 
  flex-direction: column; 
}

.message-container { 
  height: var(--chat-scroll-height); 
  overflow-y: auto; 
}

.image-grid-simple { 
  border-radius: 4px; 
}

.image-item-simple { 
  overflow: hidden; 
  border-radius: 4px; 
}

/* 모바일 반응형 스타일 */
@media (max-width: 960px) {
  .chat-scroll {
    height: var(--chat-scroll-height-tablet);
  }
  
  .message-container {
    height: var(--chat-scroll-height-tablet);
  }
  
  .message-input-area {
    padding: 12px !important;
  }
  
  .message-input {
    font-size: 14px;
  }
  
  .file-attach-btn,
  .send-btn {
    flex-shrink: 0;
  }
}

@media (max-width: 600px) {
  .chat-scroll {
    height: var(--chat-scroll-height-mobile);
    padding: 12px !important;
  }
  
  .message-container {
    height: var(--chat-scroll-height-mobile);
  }
  
  .message-input-area {
    padding: 8px !important;
    gap: 8px;
  }
  
  .message-input {
    font-size: 14px;
    margin-right: 8px !important;
  }
  
  .file-attach-btn,
  .send-btn {
    flex-shrink: 0;
    min-width: 40px;
    height: 40px;
  }
  
  .file-attach-btn {
    margin-left: 0;
  }
  
  .send-btn {
    margin-left: 8px !important;
  }
}
</style>
