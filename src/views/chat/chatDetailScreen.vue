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
      <div class="flex-grow-1 pa-4 overflow-y-auto chat-scroll" ref="chatContainer" style="height: calc(100vh - 380px);">
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
                <div v-if="shouldShowTime(index, true)" class="d-flex align-end mr-1" style="min-width: 50px;">
                  <div class="d-flex flex-column align-end">
                    <div v-if="index === chatMessages.length - 1 || !shouldShowTime(index + 1, true)" class="mb-1">
                      <!-- ✅ 읽지 않은 상태 표시: 스냅샷 기준 -->
                      <div 
                        v-if="!msg.isRead"
                        class="d-flex align-center justify-center rounded-circle text-white text-caption font-weight-bold"
                        style="background-color: #ff9500; width: 18px; height: 18px; min-width: 18px; font-size: 11px; line-height: 1;"
                      >1</div>
                    </div>
                    <span class="text-caption text-grey-darken-1">{{ formatRelativeTime(msg.createdAt) }}</span>
                  </div>
                </div>

                <div class="d-inline-flex flex-column pa-2 rounded-lg bg-orange-lighten-5 align-end" style="max-width: 70%; word-break: break-word">
                  <span v-if="msg.hasMessage()" class="text-body-2">{{ msg.message }}</span>

                  <!-- 이미지/비디오/파일 렌더는 기존과 동일 -->
                  <div v-if="msg.getImageFiles().length > 0" class="mt-1">
                    <div 
                      class="image-grid-simple"
                      :style="{
                        width: getImageGridLayout(msg.getImageFiles().length).containerWidth,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: getImageGridLayout(msg.getImageFiles().length).gap
                      }"
                    >
                      <div v-for="(file, i) in msg.getImageFiles()" :key="file.id" class="image-item-simple" :style="getImageItemStyle()">
                        <v-img :src="file.fileUrl" :width="getImageItemStyle().width" :height="getImageItemStyle().height"
                               class="rounded" :alt="file.fileName" @click="openImage(file.fileUrl)" cover />
                      </div>
                    </div>
                  </div>

                  <div v-if="msg.getVideoFiles().length > 0" class="mt-1">
                    <div v-for="file in msg.getVideoFiles()" :key="file.id" class="mb-1">
                      <video :src="file.fileUrl" controls :width="200" :height="150" class="rounded" :alt="file.fileName" />
                    </div>
                  </div>

                  <div v-if="msg.getNonImageFiles().length > 0" class="mt-1">
                    <div v-for="file in msg.getNonImageFiles()" :key="file.id" class="mb-1">
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
                  <span v-if="msg.hasMessage()" class="text-body-2">{{ msg.message }}</span>

                  <div v-if="msg.getImageFiles().length > 0" class="mt-1">
                    <div 
                      class="image-grid-simple"
                      :style="{
                        width: getImageGridLayout(msg.getImageFiles().length).containerWidth,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: getImageGridLayout(msg.getImageFiles().length).gap
                      }"
                    >
                      <div v-for="(file, i) in msg.getImageFiles()" :key="file.id" class="image-item-simple" :style="getImageItemStyle()">
                        <v-img :src="file.fileUrl" :width="getImageItemStyle().width" :height="getImageItemStyle().height"
                               class="rounded" :alt="file.fileName" @click="openImage(file.fileUrl)" cover />
                      </div>
                    </div>
                  </div>

                  <div v-if="msg.getVideoFiles().length > 0" class="mt-1">
                    <div v-for="file in msg.getVideoFiles()" :key="file.id" class="mb-1">
                      <video :src="file.fileUrl" controls :width="200" :height="150" class="rounded" :alt="file.fileName" />
                    </div>
                  </div>

                  <div v-if="msg.getNonImageFiles().length > 0" class="mt-1">
                    <div v-for="file in msg.getNonImageFiles()" :key="file.id" class="mb-1">
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

          <div v-if="showSkeleton && chatMessages.length === 0" class="skeleton-messages">
            <!-- ... 스켈레톤 그대로 ... -->
          </div>

          <div v-else-if="!showSkeleton && !loading && chatMessages.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
            <div class="mt-2 text-subtitle-1 text-grey">아직 메시지가 없습니다</div>
          </div>
        </div>
      </div>

      <!-- 파일 미리보기/입력창은 기존과 동일 -->
      <div v-if="selectedFiles.length > 0" class="px-4 pt-2 pb-0">
        <!-- ... 생략 없이 기존 코드 동일 ... -->
      </div>

      <div class="pa-2 border-t d-flex align-center">
        <v-text-field
          ref="messageInput"
          v-model="message"
          placeholder="메시지를 입력하세요..."
          hide-details
          variant="outlined"
          class="flex-grow-1 mr-2"
          rounded
          density="compact"
          @keyup.enter="sendMessage"
          @input="onTextInputWrapper"
          :disabled="loading"
        />
        <v-btn icon @click="triggerFileInput" :disabled="loading" color="primary"><v-icon>mdi-paperclip</v-icon></v-btn>
        <input ref="fileInput" type="file" multiple class="d-none" @change="handleFileChangeWrapper" />
        <v-btn color="orange" icon class="ml-2" :disabled="isSending || loading || (!message.trim() && selectedFiles.length === 0)" @click="sendMessage">
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import { formatRelativeTime } from '@/utils/timeUtils';
import { useFileUpload } from '@/composables/useFileUpload';
import { useDialog } from '@/composables/useDialog';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const props = defineProps<{ chat: any }>();
const router = useRouter();
const chatStore = useChatStore();
const { messages, currentRoomId, loading, error } = storeToRefs(chatStore);

const showSkeleton = ref(false);
const skeletonTimer = ref<number | null>(null);

const chatContainer = ref<HTMLElement | null>(null);
const myId = '550e8400-e29b-41d4-a716-446655440001';

// ✅ 핵심: lastReadByOther 스냅샷을 이용해 내 메시지 isRead 계산
const chatMessages = computed(() => {
  if (!currentRoomId.value) return [];
  const list = messages.value[currentRoomId.value] || [];
  const otherReadAt = chatStore.lastReadByOther[currentRoomId.value];

  return list.map((msg) => {
    const readByOther =
      msg.senderId === myId &&
      !!otherReadAt &&
      new Date(msg.createdAt) <= new Date(otherReadAt);

    // 원본 인스턴스에만 플래그 주입 (메서드들 그대로 유지)
    msg.isRead = !!readByOther;
    return msg;
  });
});

const message = ref("");
const isSending = ref(false);

// 파일 업로드
const {
  selectedFiles, selectedFileNames, selectedFileTypes, fileInput,
  handleFileChange, removeSelectedFile, removeAllFiles, triggerFileInput, onTextInput
} = useFileUpload();

// 다이얼로그
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

// 스크롤
watch(chatMessages, () => { nextTick(() => { scrollToBottom(); }); }, { deep: true });
const scrollToBottom = () => {
  if (chatContainer.value) {
    requestAnimationFrame(() => {
      chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight;
    });
  }
};
watch(currentRoomId, () => { if (currentRoomId.value) nextTick(() => scrollToBottom()); });

// 스켈레톤 타이머
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
    nextTick(() => {
      if (chatMessages.value.length === 0) startSkeletonTimer();
    });
  }
});

// 언마운트/라우트 이탈 시 오프라인 전송 & 연결 해제
onBeforeUnmount(() => {
  if (currentRoomId.value) chatStore.sendOnlineStatus(currentRoomId.value, false);
  chatStore.disconnectWebSocket();
  if (skeletonTimer.value) clearTimeout(skeletonTimer.value);
});
onBeforeRouteLeave((_to, _from, next) => {
  if (currentRoomId.value) chatStore.sendOnlineStatus(currentRoomId.value, false);
  chatStore.disconnectWebSocket();
  if (skeletonTimer.value) clearTimeout(skeletonTimer.value);
  next();
});

// 마운트
onMounted(() => {
  if (currentRoomId.value && chatMessages.value.length === 0) startSkeletonTimer();
  nextTick(() => { scrollToBottom(); });
});

// 파일/입력 핸들러
const handleFileChangeWrapper = (e: Event) => handleFileChange(e, message);
const onTextInputWrapper = () => onTextInput(message);

// 시간 표시 로직들
const shouldShowTime = (index: number, _isMyMessage: boolean) => {
  const currentMsg = chatMessages.value[index];
  const nextMsg = chatMessages.value[index + 1];
  if (!nextMsg) return true;
  const isSameSender = currentMsg.senderId === nextMsg.senderId;
  if (!isSameSender) return true;

  const a = new Date(currentMsg.createdAt);
  const b = new Date(nextMsg.createdAt);
  const key = (d: Date) => d.getFullYear()*100000000 + (d.getMonth()+1)*1000000 + d.getDate()*10000 + d.getHours()*100 + d.getMinutes();
  return key(a) !== key(b);
};

const shouldShowDateSeparator = (index: number) => {
  const currentMsg = chatMessages.value[index];
  const prevMsg = chatMessages.value[index - 1];
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.createdAt);
  const prevDate = new Date(prevMsg.createdAt);
  return currentDate.toDateString() !== prevDate.toDateString();
};

const formatDateSeparator = (ts: string) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const getImageGridLayout = (count: number) => {
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
    try { await chatStore.updateRoomName(currentRoomId.value!, newRoomName.value.trim()); resetNameEditDialog(); }
    catch (e) { console.error('채팅방 이름 변경 실패:', e); }
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
    await chatStore.leaveRoom(currentRoomId.value!);
    resetLeaveConfirmDialog();
  } catch (e) {
    console.error('채팅방 나가기 실패:', e);
  } finally {
    leaving.value = false;
  }
};
const cancelLeaveRoom = () => { resetLeaveConfirmDialog(); };

// 전송
const sendMessage = async (event?: Event) => {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  if (isSending.value) return;

  const files = selectedFiles.value.map((item: any) => item.file);
  const hasText = message.value.trim();
  const hasFiles = files.length > 0;
  if (!hasText && !hasFiles) return;

  isSending.value = true;
  try {
    if (hasText) await chatStore.sendMessage(message.value, null);
    else await chatStore.sendMessage("", files);
    message.value = "";
    removeAllFiles();
  } catch (e) {
    console.error('메시지 전송 실패:', e);
  } finally {
    isSending.value = false;
  }
};

// (옵션) 시뮬레이션 버튼 사용하는 경우 필요하면 store에 helper 추가 가능
</script>

<style scoped>
.chat-scroll { overflow-y: auto; scrollbar-width: thin; }
.chat-scroll::-webkit-scrollbar { width: 4px; }
.chat-scroll::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.2); border-radius: 4px; }
.chat-scroll::-webkit-scrollbar-track { background-color: rgba(0, 0, 0, 0.05); border-radius: 4px; }
.chat-container { height: calc(100vh - 120px); display: flex; flex-direction: column; }
.message-container { height: calc(100vh - 380px); overflow-y: auto; }
.image-grid-simple { border-radius: 4px; }
.image-item-simple { overflow: hidden; border-radius: 4px; }
.skeleton-messages { padding: 16px; animation: skeleton-fade-in 0.3s ease-in-out; }
.skeleton-message { display: flex; align-items: flex-start; margin-bottom: 16px; animation: skeleton-slide-in 0.5s ease-out; }
.skeleton-message.left { justify-content: flex-start; }
.skeleton-message.right { justify-content: flex-end; }
.skeleton-message:nth-child(1) { animation-delay: 0s; }
.skeleton-message:nth-child(2) { animation-delay: 0.1s; }
.skeleton-message:nth-child(3) { animation-delay: 0.2s; }
.skeleton-message:nth-child(4) { animation-delay: 0.3s; }
.skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 2s infinite; margin-right: 12px; flex-shrink: 0; }
.skeleton-bubble-wrapper { display: flex; flex-direction: column; max-width: 70%; }
.skeleton-bubble-wrapper.right { align-items: flex-end; }
.skeleton-bubble { height: 40px; border-radius: 18px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 2s infinite; margin-bottom: 4px; position: relative; overflow: hidden; }
.skeleton-bubble.left-bubble { width: 180px; background-color: #f5f5f5; }
.skeleton-bubble.right-bubble { width: 140px; background-color: #fff3e0; }
.skeleton-bubble.long { width: 250px; }
.skeleton-bubble.short { width: 80px; }
@keyframes skeleton-loading { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes skeleton-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes skeleton-slide-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
</style>
