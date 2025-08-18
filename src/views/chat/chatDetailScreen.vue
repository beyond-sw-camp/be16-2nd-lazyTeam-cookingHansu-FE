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
                      <video :src="file.fileUrl" controls :width="200" :height="150" class="rounded" :alt="file.fileName" />
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
                      <video :src="file.fileUrl" controls :width="200" :height="150" class="rounded" :alt="file.fileName" />
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
          :disabled="loading || (hasFiles() && message.trim())" 
          color="primary"
          :title="hasFiles() && message.trim() ? '텍스트를 입력하려면 파일을 제거하세요' : '파일 첨부'"
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
const { messages, currentRoomId, loading, error } = storeToRefs(chatStore);

const showSkeleton = ref(false);
const skeletonTimer = ref(null);

const chatContainer = ref(null);
const topSentinel = ref(null);
let topObserver = null;

const myId = '550e8400-e29b-41d4-a716-446655440001';

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
// ✅ 수정: Store의 lastReadTimestamps 사용

// 각 메시지별 unreadCount 계산 (Store의 lastReadTimestamps 사용)
const chatMessages = computed(() => {
  // Store의 lastReadTimestamp 사용
  const lastReadTimestamp = chatStore.lastReadTimestamps[currentRoomId.value];
  
  // onlineUsers 상태도 의존성에 추가하여 온라인 상태 변경 감지
  const onlineUsers = chatStore.onlineUsers[currentRoomId.value];
  const isOtherOnline = onlineUsers && onlineUsers.some(user => user.userId !== myId);
  
  const list = chatStore.messages[currentRoomId.value] || [];
  if (list.length === 0) return [];
  
  // 디버깅: lastReadTimestamp 상태 확인
  console.log(`🔍 chatMessages computed 실행:`, {
    roomId: currentRoomId.value,
    messageCount: list.length,
    lastReadTimestamp: lastReadTimestamp,
    hasLastReadTimestamp: !!lastReadTimestamp,
    onlineUsers: onlineUsers,
    isOtherOnline: isOtherOnline,
    currentTime: new Date().toISOString()
  });
  
  // lastReadTimestamp가 없으면 모든 메시지를 읽지 않음
  if (!lastReadTimestamp) {
    console.log(`⚠️ lastReadTimestamp가 설정되지 않음 - 모든 메시지를 읽지 않은 상태로 표시`);
    return list.map(msg => ({
      ...msg,
      unreadCount: 1
    }));
  }
  
  const lastReadTime = new Date(lastReadTimestamp).getTime();
  console.log(`✅ lastReadTimestamp 기준 시간: ${lastReadTimestamp} (원본)`);
  
  // 상대방이 온라인이고 lastReadTimestamp가 현재 시간에 가깝다면 모든 메시지를 읽은 것으로 간주
  if (isOtherOnline) {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastReadTime;
    const isRecent = timeDiff < 60000; // 1분 이내
    
    if (isRecent) {
      console.log(`🟢 상대방이 온라인이고 최근 시간: 모든 메시지를 읽은 상태로 표시`);
      return list.map(msg => ({
        ...msg,
        unreadCount: 0
      }));
    }
  }
  
  return list.map((msg) => {
    let unreadCount = 0;
    
    // ✅ 수정: 시간대 통일 (한국 시간으로 변환)
    // 백엔드는 한국 시간, 프론트는 UTC 시간이므로 9시간 차이 보정
    const msgTime = new Date(msg.createdAt).getTime();
    const lastReadTime = new Date(lastReadTimestamp).getTime();
    
    // 한국 시간대 보정 (UTC+9)
    const koreaTimeOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
    const adjustedMsgTime = msgTime + koreaTimeOffset;
    const adjustedLastReadTime = lastReadTime + koreaTimeOffset;
    
    // ✅ 핵심 로직: 보정된 시간으로 비교
    if (msg.senderId === myId) {
      // 내 메시지: 상대방이 읽었으면 0, 읽지 않았으면 1
      unreadCount = adjustedMsgTime > adjustedLastReadTime ? 1 : 0;
    } else {
      // 상대방 메시지: 내가 읽었으면 0, 읽지 않았으면 1
      unreadCount = adjustedMsgTime > adjustedLastReadTime ? 1 : 0;
    }
    
    // 디버깅: 개별 메시지 unreadCount 계산 결과
    if (unreadCount === 1) {
      console.log(`📝 메시지 ${msg.id} unreadCount: 1`, {
        senderId: msg.senderId,
        isMyMessage: msg.senderId === myId,
        messageTime: msg.createdAt,
        lastReadTime: lastReadTimestamp,
        diff: msgTime - lastReadTime,
        isOtherOnline: isOtherOnline
      });
    }
    
    return {
      ...msg,
      unreadCount
    };
  });
});

// ✅ 수정: Store의 lastReadTimestamps 변경 감지
watch(
  () => chatStore.lastReadTimestamps[currentRoomId.value],
  (newTimestamp, oldTimestamp) => {
    if (newTimestamp && newTimestamp !== oldTimestamp) {
      console.log(`🔄 lastReadTimestamp 변경됨: ${oldTimestamp} → ${newTimestamp}`);
      
      // 강제로 computed 재계산을 위해 $forceUpdate와 유사한 효과
      // Vue 3에서는 nextTick으로 처리
      nextTick(() => {
        console.log(`✅ unreadCount 재계산 완료`);
      });
    }
  }
);

// ✅ 추가: 상대방 온라인 상태 변경 감지하여 자동 읽음 처리
watch(
  () => chatStore.onlineUsers[currentRoomId.value],
  (newOnlineUsers, oldOnlineUsers) => {
    if (!currentRoomId.value || !newOnlineUsers) return;
    
    const prev = Array.isArray(oldOnlineUsers) ? oldOnlineUsers : [];
    const wasOnline = prev.some((user) => user.userId !== myId);
    const nowOnline = newOnlineUsers.some((user) => user.userId !== myId);
    
    console.log(`🔍 온라인 상태 변경 감지:`, {
      roomId: currentRoomId.value,
      wasOnline,
      nowOnline
    });
    
    // 상대방이 오프라인에서 온라인으로 변경된 경우
    if (!wasOnline && nowOnline) {
      console.log(`🟢 상대방이 온라인되었습니다. 자동 읽음 처리 시작`);
      
      // 상대방이 온라인이 되면 자동으로 읽음 처리
      setTimeout(async () => {
        await chatStore.markMessagesAsRead(currentRoomId.value);
        console.log(`✅ 상대방 온라인으로 인한 자동 읽음 처리 완료`);
      }, 100);
    }
  },
  { deep: true, immediate: true }
);

// 채팅방 입장 시 lastMessageTimestamp 초기화
watch(
  currentRoomId,
  async (newRoomId, oldRoomId) => {
    if (newRoomId && newRoomId !== oldRoomId) {
      console.log(`🚪 채팅방 ${newRoomId} 입장`);
      
      // 메시지가 로드될 때까지 잠시 대기
      await nextTick();
      
      // ✅ 수정: Store에서 lastReadTimestamp 확인
      const lastReadTimestamp = chatStore.lastReadTimestamps[newRoomId];
      if (lastReadTimestamp) {
        console.log(`✅ Store에서 lastReadTimestamp 확인: ${lastReadTimestamp}`);
      } else {
        console.log(`⚠️ Store에 lastReadTimestamp가 없음`);
      }
    }
  }
);

// 메시지 로드 완료 후 lastMessageTimestamp 설정
watch(
  () => chatStore.messages[currentRoomId.value],
  (newMessages, oldMessages) => {
    if (!newMessages || !currentRoomId.value) return;
    
    // ✅ 수정: Store의 lastReadTimestamps 사용하므로 별도 설정 불필요
    // 메시지가 처음 로드되었거나 새로 추가된 경우
    if (!oldMessages || newMessages.length !== oldMessages.length) {
      // Store에서 lastReadTimestamp 확인
      const lastReadTimestamp = chatStore.lastReadTimestamps[currentRoomId.value];
      if (lastReadTimestamp) {
        console.log(`✅ Store에서 lastReadTimestamp 확인: ${lastReadTimestamp}`);
      } else {
        console.log(`⚠️ Store에 lastReadTimestamp가 없음`);
      }
    }
    
    // 새로운 메시지가 추가되었는지 확인
    if (oldMessages && newMessages.length > oldMessages.length) {
      const newMessage = newMessages[newMessages.length - 1];
      
      // 상대방 메시지이고 현재 방에 있을 때만 읽음처리
      if (newMessage.senderId !== myId && newMessage.roomId === currentRoomId.value) {
        console.log(`📥 상대방 메시지 수신: 자동 읽음 처리`);
        
        // 약간의 지연 후 읽음 처리 (UI 렌더링 완료 후)
        setTimeout(async () => {
          await chatStore.markMessagesAsRead(currentRoomId.value);
          
          // ✅ 수정: Store에서 자동으로 lastReadTimestamp 업데이트됨
          console.log(`✅ 상대방 메시지 수신 후 읽음 처리 완료`);
        }, 100);
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
      jumpToBottomInstant();      // ✅ 모션 없이 즉시 바닥
      didInitialBottomScroll.value = true;
    }
  }
);

watch(
  chatMessages,
  async () => {
    await nextTick();
    if (!didInitialBottomScroll.value) return;
    if (isPrepending.value) return;
    if (shouldStickToBottom.value) scrollToBottom("auto");
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
    await chatStore.disconnectWebSocket(currentRoomId.value);
  }
  next();
});

// 채팅방을 나갈 때 정리
onBeforeUnmount(() => {
  // lastMessageTimestamp 정리
  // lastMessageTimestamp.value = null; // 로컬 상태 제거
  
  // WebSocket 연결 해제
  if (currentRoomId.value) {
    chatStore.disconnectWebSocket(currentRoomId.value);
  }
  
  // 스크롤 타이머 정리
  if (scrollTimeout.value) clearTimeout(scrollTimeout.value);
  
  console.log(`🧹 채팅방 상세 컴포넌트 정리 완료`);
});

/* -----------------------------
 * 마운트: 프리로드 옵저버 세팅
 * ----------------------------- */
onMounted(() => {
  chatStore.initPresenceLifecycle();

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
});

// 메시지가 새로 도착했을 때 자동 스크롤
watch(chatMessages, (newMessages, oldMessages) => {
  if (!oldMessages || newMessages.length === 0) return;
  if (newMessages.length > oldMessages.length) {
    nextTick(() => {
      if (shouldStickToBottom.value) {
        scrollToBottom("auto");
      }
    });
  }
}, { deep: true });

// 채팅방이 변경되거나 초기 로딩 시 스크롤을 맨 아래로 이동
watch(currentRoomId, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    await nextTick();
    setTimeout(() => {
      scrollToBottom("auto");
      updateStickiness();
    }, 100);
  }
});

// 메시지가 처음 로드되었을 때 스크롤을 맨 아래로 이동
watch(() => chatMessages.value.length, (newLength, oldLength) => {
  if (oldLength === 0 && newLength > 0) {
    nextTick(() => {
      scrollToBottom("auto");
      updateStickiness();
    });
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
  hasFiles, canInputText
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
  const imageSize = '72px';
  const gap = '3px';
  const maxPerRow = 4;
  const widthPx = (72 * Math.min(count, maxPerRow)) + (3 * (Math.min(count, maxPerRow) - 1));
  return { imageSize, gap, maxPerRow, containerWidth: `${widthPx}px` };
};
const getImageItemStyle = () => ({ width: '72px', height: '72px' });

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
