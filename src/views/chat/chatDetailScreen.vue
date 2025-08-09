<template>
  <div class="d-flex flex-column h-100">
    <!-- 에러 상태 -->
    <div v-if="error" class="d-flex justify-center align-center pa-8">
      <div style="max-width: 500px; width: 100%;">
        <ErrorAlert
          title="연결 오류"
          :message="error"
          @close="chatStore.clearError"
        />
      </div>
    </div>

    <!-- 채팅 화면 (로딩 중이어도 기본 UI는 표시) -->
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
          <template v-slot:activator="{ props }">
            <v-icon 
              v-bind="props" 
              size="small" 
              class="cursor-pointer"
              style="color: rgba(0, 0, 0, 0.6);"
            >
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
    
    <!-- 채팅방 이름 변경 다이얼로그 -->
    <v-dialog v-model="showNameEditDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-center">
          채팅방 이름 변경
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newRoomName"
            label="새로운 채팅방 이름"
            variant="outlined"
            :placeholder="currentRoom?.chatRoomName || ''"
            @keyup.enter="confirmRoomNameChange"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn @click="cancelRoomNameChange">취소</v-btn>
          <v-btn color="primary" @click="confirmRoomNameChange">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 채팅방 나가기 확인 다이얼로그 -->
    <DeleteConfirmModal
      v-model="showLeaveConfirmDialog"
      title="채팅방을 나가시겠습니까?"
      message="채팅방을 나가면 모든 메시지가 유실되며 복구할 수 없습니다."
      :item-info="leaveRoomInfo"
      :loading="leaving"
      @confirm="confirmLeaveRoom"
      @cancel="cancelLeaveRoom"
    />
    
    <!-- 이미지 확대 보기 다이얼로그 -->
    <v-dialog v-model="showImageDialog" max-width="90vw" max-height="90vh">
      <v-card>
        <v-card-actions class="justify-end">
          <v-btn icon @click="closeImageDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="text-center pa-0">
          <v-img 
            :src="selectedImageUrl" 
            max-height="80vh" 
            contain 
            class="mx-auto"
          />
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
              <v-chip 
                size="small" 
                color="grey-darken-1" 
                variant="tonal"
                class="text-caption mx-3"
                style="background-color: #f5f5f5;"
              >
                {{ formatDateSeparator(msg.createdAt) }}
              </v-chip>
              <div class="flex-grow-1" style="height: 1px; background-color: #e0e0e0;"></div>
            </div>
          </div>
          
          <div :class="['d-flex', msg.senderId === myId ? 'justify-end' : 'justify-start']">
            
            <!-- 내 메시지 (오른쪽) -->
            <template v-if="msg.senderId === myId">
              <!-- 시간 (왼쪽) - 연속된 메시지에서 마지막에만 표시 -->
              <div v-if="shouldShowTime(index, true)" class="d-flex align-end mr-1" style="min-width: 50px;">
                <span class="text-caption text-grey-darken-1">
                  {{ formatRelativeTime(msg.createdAt) }}
                </span>
              </div>
              
              <!-- 메시지 내용 (오른쪽) -->
              <div class="d-inline-flex flex-column pa-2 rounded-lg bg-orange-lighten-5 align-end" style="max-width: 70%; word-break: break-word">
                
                <!-- 텍스트 메시지 -->
                <span v-if="msg.hasMessage()" class="text-body-2">{{ msg.message }}</span>
                
                <!-- 이미지 파일들 (간단한 그리드) -->
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
                    <div 
                      v-for="(file, index) in msg.getImageFiles()" 
                      :key="file.id" 
                      class="image-item-simple"
                      :style="getImageItemStyle()"
                    >
                      <v-img 
                        :src="file.fileUrl" 
                        :width="getImageItemStyle().width"
                        :height="getImageItemStyle().height"
                        class="rounded" 
                        :alt="file.fileName"
                        @click="openImage(file.fileUrl)"
                        style="cursor: pointer; object-fit: cover;"
                        cover
                      />
                    </div>
                  </div>
                </div>
                
                <!-- 일반 파일들 -->
                <div v-if="msg.getNonImageFiles().length > 0" class="mt-1">
                  <div v-for="file in msg.getNonImageFiles()" :key="file.id" class="mb-1">
                    <v-btn 
                      variant="text" 
                      color="primary" 
                      :href="file.fileUrl" 
                      download 
                      :title="file.fileName"
                      class="pa-0 text-left"
                      style="min-width: auto; text-transform: none;"
                    >
                      <v-icon size="small" class="mr-1">mdi-file</v-icon>
                      {{ file.fileName }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </template>
            
            <!-- 상대방 메시지 (왼쪽) -->
            <template v-else>
              <!-- 메시지 내용 (왼쪽) -->
              <div class="d-inline-flex flex-column pa-2 rounded-lg bg-grey-lighten-4 align-start" style="max-width: 70%; word-break: break-word">
                
                <!-- 텍스트 메시지 -->
                <span v-if="msg.hasMessage()" class="text-body-2">{{ msg.message }}</span>
                
                <!-- 이미지 파일들 (간단한 그리드) -->
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
                    <div 
                      v-for="(file, index) in msg.getImageFiles()" 
                      :key="file.id" 
                      class="image-item-simple"
                      :style="getImageItemStyle()"
                    >
                      <v-img 
                        :src="file.fileUrl" 
                        :width="getImageItemStyle().width"
                        :height="getImageItemStyle().height"
                        class="rounded" 
                        :alt="file.fileName"
                        @click="openImage(file.fileUrl)"
                        style="cursor: pointer; object-fit: cover;"
                        cover
                      />
                    </div>
                  </div>
                </div>
                
                <!-- 일반 파일들 -->
                <div v-if="msg.getNonImageFiles().length > 0" class="mt-1">
                  <div v-for="file in msg.getNonImageFiles()" :key="file.id" class="mb-1">
                    <v-btn 
                      variant="text" 
                      color="primary" 
                      :href="file.fileUrl" 
                      download 
                      :title="file.fileName"
                      class="pa-0 text-left"
                      style="min-width: auto; text-transform: none;"
                    >
                      <v-icon size="small" class="mr-1">mdi-file</v-icon>
                      {{ file.fileName }}
                    </v-btn>
                  </div>
                </div>
              </div>
              
              <!-- 시간 (오른쪽) - 연속된 메시지에서 마지막에만 표시 -->
              <div v-if="shouldShowTime(index, false)" class="d-flex align-end ml-1" style="min-width: 50px;">
                <span class="text-caption text-grey-darken-1">
                  {{ formatRelativeTime(msg.createdAt) }}
                </span>
              </div>
            </template>
            
          </div>
        </div>
        
        <!-- 로딩 중일 때 스켈레톤 UI -->
        <div v-if="showSkeleton && chatMessages.length === 0" class="skeleton-messages">
          <!-- 상대방 메시지 스켈레톤 -->
          <div class="skeleton-message left mb-4">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-bubble-wrapper">
              <div class="skeleton-bubble left-bubble"></div>
            </div>
          </div>
          
          <!-- 내 메시지 스켈레톤 -->
          <div class="skeleton-message right mb-4">
            <div class="skeleton-bubble-wrapper right">
              <div class="skeleton-bubble right-bubble"></div>
            </div>
          </div>
          
          <!-- 상대방 긴 메시지 스켈레톤 -->
          <div class="skeleton-message left mb-4">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-bubble-wrapper">
              <div class="skeleton-bubble left-bubble long"></div>
            </div>
          </div>
          
          <!-- 내 짧은 메시지 스켈레톤 -->
          <div class="skeleton-message right mb-4">
            <div class="skeleton-bubble-wrapper right">
              <div class="skeleton-bubble right-bubble short"></div>
            </div>
          </div>
        </div>
        
        <!-- 빈 상태 -->
        <div v-else-if="!showSkeleton && !loading && chatMessages.length === 0" class="text-center py-8">
          <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
          <div class="mt-2 text-subtitle-1 text-grey">
            아직 메시지가 없습니다
          </div>
        </div>
      </div>
    </div>
    
    <!-- 파일 미리보기 -->
    <div v-if="selectedFiles.length > 0" class="px-4 pt-2 pb-0">
      <div class="d-flex flex-wrap gap-2">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="pa-3 rounded-lg border d-flex align-center" 
          style="max-width: 200px;"
        >
          <div class="text-caption text-grey-darken-1 font-weight-medium">
            📎 {{ selectedFileNames[index] }}
          </div>
          <v-img 
            v-if="selectedFileTypes[index] && selectedFileTypes[index].startsWith('image/')" 
            :src="file.preview" 
            max-width="60" 
            class="ml-2 rounded" 
          />
          <v-btn 
            icon 
            size="small" 
            class="ml-2" 
            @click="removeSelectedFile(index)"
            color="error"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="d-flex justify-space-between align-center mt-2">
        <span class="text-caption text-grey-darken-1">
          선택된 파일: {{ selectedFiles.length }}/10
        </span>
        <v-btn 
          variant="text" 
          size="small" 
          color="error" 
          @click="removeAllFiles"
        >
          모두 제거
        </v-btn>
      </div>
    </div>
    
    <!-- 입력창 -->
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
      ></v-text-field>
      <v-btn 
        icon 
        @click="triggerFileInput" 
        :disabled="loading"
        color="primary"
      >
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>
      <input 
        ref="fileInput" 
        type="file" 
        multiple 
        class="d-none" 
        @change="handleFileChangeWrapper" 
      />
      <v-btn color="orange" icon class="ml-2" :disabled="isSending || loading || (!message.trim() && selectedFiles.length === 0)" @click="sendMessage">
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

const props = defineProps({
  chat: Object,
});

const router = useRouter();
const chatStore = useChatStore();
const { messages, currentRoomId, loading, error } = storeToRefs(chatStore);

// 스켈레톤 최소 표시 시간 관리
const showSkeleton = ref(false);
const skeletonTimer = ref(null);

const chatContainer = ref(null);
const myId = '550e8400-e29b-41d4-a716-446655440001'; // current_user ID
const chatMessages = computed(() => {
  if (!currentRoomId.value) return [];
  return messages.value[currentRoomId.value] || [];
});

const message = ref("");
const isSending = ref(false);

// 파일 업로드 관련 로직
const {
  selectedFiles,
  selectedFileNames,
  selectedFileTypes,
  fileInput,
  handleFileChange,
  removeSelectedFile,
  removeAllFiles,
  triggerFileInput,
  onTextInput
} = useFileUpload();

// 다이얼로그 관련 로직
const {
  showImageDialog,
  selectedImageUrl,
  showNameEditDialog,
  newRoomName,
  openImage,
  closeImageDialog,
  resetNameEditDialog,
  resetLeaveConfirmDialog
} = useDialog();

const showRoomOptions = ref(false);

const currentRoom = computed(() => chatStore.currentRoom);
const partnerName = computed(() => currentRoom.value?.otherUserNickname || currentRoom.value?.otherUserName || '상대방');
const partnerAvatar = computed(() => currentRoom.value?.otherUserProfileImage || '');

// 메시지 스크롤 자동 이동
watch(chatMessages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// 스크롤을 맨 아래로 이동하는 함수
const scrollToBottom = () => {
  if (chatContainer.value) {
    // 강제로 스크롤을 맨 아래로 이동
    requestAnimationFrame(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    });
  }
};

// 채팅방 변경 시에도 맨 아래로 스크롤
watch(currentRoomId, () => {
  if (currentRoomId.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// 스켈레톤 표시 관리 함수들
const startSkeletonTimer = () => {
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
  }
  showSkeleton.value = true;
  
  // 최소 0.5초간 스켈레톤 표시
  skeletonTimer.value = setTimeout(() => {
    if (!loading.value) {
      showSkeleton.value = false;
    }
  }, 300);
};

const stopSkeletonTimer = () => {
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
    skeletonTimer.value = null;
  }
  // 로딩이 끝나고 1.5초가 지났으면 스켈레톤 숨김
  setTimeout(() => {
    showSkeleton.value = false;
  }, 100);
};

// 로딩 상태 변화 감지
watch(loading, (newLoading, oldLoading) => {
  if (newLoading && !oldLoading) {
    // 로딩 시작 시 스켈레톤 표시
    startSkeletonTimer();
  } else if (!newLoading && oldLoading) {
    // 로딩 완료 시 스켈레톤 숨김 처리
    stopSkeletonTimer();
  }
});

// 채팅방 변경 감지
watch(currentRoomId, (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    // 새 채팅방으로 변경될 때 메시지가 비어있으면 스켈레톤 표시
    nextTick(() => {
      if (chatMessages.value.length === 0) {
        startSkeletonTimer();
      }
    });
  }
});

// 컴포넌트가 언마운트되기 전에 WebSocket 연결 해제
onBeforeUnmount(() => {
  chatStore.disconnectWebSocket();
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
  }
});

// 라우트를 떠나기 전에 WebSocket 연결 해제
onBeforeRouteLeave((to, from, next) => {
  chatStore.disconnectWebSocket();
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
  }
  next();
});

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 현재 채팅방이 있고 메시지가 비어있으면 스켈레톤 표시
  if (currentRoomId.value && chatMessages.value.length === 0) {
    startSkeletonTimer();
  }
  
  nextTick(() => {
    scrollToBottom();
  });
});

// 컴포저블의 함수들을 래핑하여 message ref를 전달
const handleFileChangeWrapper = (e) => handleFileChange(e, message);
const onTextInputWrapper = () => onTextInput(message);

// 시간 표시 로직
const shouldShowTime = (index, isMyMessage) => {
  const currentMsg = chatMessages.value[index];
  const nextMsg = chatMessages.value[index + 1];
  
  // 마지막 메시지이거나 다음 메시지가 없는 경우
  if (!nextMsg) return true;
  
  // 같은 발신자의 연속된 메시지인지 확인
  const isSameSender = currentMsg.senderId === nextMsg.senderId;
  
  if (!isSameSender) return true; // 발신자가 다르면 항상 표시
  
  // 시간을 분 단위로 비교 (더 정확한 비교)
  const currentTime = new Date(currentMsg.createdAt);
  const nextTime = new Date(nextMsg.createdAt);
  
  // 같은 분에 보낸 메시지는 시간 표시하지 않음 (마지막에만 표시)
  const currentMinutes = currentTime.getFullYear() * 100000000 + 
                        (currentTime.getMonth() + 1) * 1000000 + 
                        currentTime.getDate() * 10000 + 
                        currentTime.getHours() * 100 + 
                        currentTime.getMinutes();
  
  const nextMinutes = nextTime.getFullYear() * 100000000 + 
                     (nextTime.getMonth() + 1) * 1000000 + 
                     nextTime.getDate() * 10000 + 
                     nextTime.getHours() * 100 + 
                     nextTime.getMinutes();
  
  return currentMinutes !== nextMinutes;
};

// 날짜 구분선 표시 로직
const shouldShowDateSeparator = (index) => {
  const currentMsg = chatMessages.value[index];
  const prevMsg = chatMessages.value[index - 1];

  if (!prevMsg) return true; // 첫 메시지는 항상 표시

  const currentDate = new Date(currentMsg.createdAt);
  const prevDate = new Date(prevMsg.createdAt);

  // 날짜가 다르면 구분선 표시
  return currentDate.toDateString() !== prevDate.toDateString();
};

// 날짜 구분선 포맷
const formatDateSeparator = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  // 유효하지 않은 날짜인 경우 빈 문자열 반환
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 간단한 이미지 그리드 계산 함수 (1줄에 4개씩)
const getImageGridLayout = (imageCount) => {
  const imageSize = '72px'; // 조금 더 큰 크기
  const gap = '3px';
  const maxPerRow = 4;
  
  return {
    imageSize,
    gap,
    maxPerRow,
    containerWidth: `${(72 * Math.min(imageCount, maxPerRow)) + (3 * (Math.min(imageCount, maxPerRow) - 1))}px`
  };
};

// 이미지 아이템 스타일 (모든 이미지 동일한 크기)
const getImageItemStyle = () => {
  return {
    width: '72px',
    height: '72px'
  };
};


// 채팅방 이름 변경
const editRoomName = () => {
  newRoomName.value = currentRoom.value?.customRoomName || '';
  showNameEditDialog.value = true;
  showRoomOptions.value = false;
};

const confirmRoomNameChange = async () => {
  if (newRoomName.value.trim()) {
    try {
      await chatStore.updateRoomName(currentRoomId.value, newRoomName.value.trim());
      resetNameEditDialog();
    } catch (error) {
      console.error('채팅방 이름 변경 실패:', error);
    }
  }
};

const cancelRoomNameChange = () => {
  resetNameEditDialog();
};

// 채팅방 나가기
const leaveRoom = () => {
  showLeaveConfirmDialog.value = true;
  showRoomOptions.value = false;
};

const confirmLeaveRoom = async () => {
  try {
    leaving.value = true;
    await chatStore.leaveRoom(currentRoomId.value);
    resetLeaveConfirmDialog();
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
  } finally {
    leaving.value = false;
  }
};

const cancelLeaveRoom = () => {
  resetLeaveConfirmDialog();
};

const sendMessage = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (isSending.value) return;
  
  const files = selectedFiles.value.map(item => item.file);
  const hasText = message.value.trim();
  const hasFiles = files.length > 0;
  
  // 텍스트나 파일 중 하나만 있어야 함
  if (!hasText && !hasFiles) return;
  
  isSending.value = true;
  
  try {
    if (hasText) {
      // 텍스트만 전송
      await chatStore.sendMessage(message.value, null);
    } else {
      // 파일만 전송
      await chatStore.sendMessage("", files);
    }
    
    message.value = "";
    removeAllFiles();
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  } finally {
    isSending.value = false;
  }
};

const showLeaveConfirmDialog = ref(false);
const leaving = ref(false);

// 채팅방 나가기 정보 (DeleteConfirmModal에 전달)
const leaveRoomInfo = computed(() => {
  return {
    title: currentRoom.value?.customRoomName || '채팅방'
  };
});

</script>

<style scoped>
.chat-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
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

/* 채팅 컨테이너 전체 높이 고정 */
.chat-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 메시지 영역 고정 높이 */
.message-container {
  height: calc(100vh - 380px);
  overflow-y: auto;
}

/* 간단한 이미지 그리드 */
.image-grid-simple {
  border-radius: 4px;
}

.image-item-simple {
  overflow: hidden;
  border-radius: 4px;
}

/* 스켈레톤 UI 스타일 */
.skeleton-messages {
  padding: 16px;
  animation: skeleton-fade-in 0.3s ease-in-out;
}

.skeleton-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  animation: skeleton-slide-in 0.5s ease-out;
}

.skeleton-message.left {
  justify-content: flex-start;
}

.skeleton-message.right {
  justify-content: flex-end;
}

.skeleton-message:nth-child(1) { animation-delay: 0s; }
.skeleton-message:nth-child(2) { animation-delay: 0.1s; }
.skeleton-message:nth-child(3) { animation-delay: 0.2s; }
.skeleton-message:nth-child(4) { animation-delay: 0.3s; }

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  margin-right: 12px;
  flex-shrink: 0;
}

.skeleton-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.skeleton-bubble-wrapper.right {
  align-items: flex-end;
}

.skeleton-bubble {
  height: 40px;
  border-radius: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-bubble.left-bubble {
  width: 180px;
  background-color: #f5f5f5;
}

.skeleton-bubble.right-bubble {
  width: 140px;
  background-color: #fff3e0;
}

.skeleton-bubble.long {
  width: 250px;
}

.skeleton-bubble.short {
  width: 80px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes skeleton-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes skeleton-slide-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>