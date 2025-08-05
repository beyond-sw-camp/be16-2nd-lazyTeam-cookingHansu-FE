<template>
  <div class="d-flex flex-column h-100">
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
    <v-dialog v-model="showLeaveConfirmDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-center">
          채팅방 나가기
        </v-card-title>
        <v-card-text>
          <div class="text-center">
            <v-icon size="48" color="warning" class="mb-3">mdi-alert-circle</v-icon>
            <p class="text-body-1 mb-2">정말로 이 채팅방을 나가시겠습니까?</p>
            <p class="text-caption text-grey-darken-1">
              채팅방을 나가면 모든 메시지가 유실되며 복구할 수 없습니다.
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn @click="cancelLeaveRoom">취소</v-btn>
          <v-btn color="error" @click="confirmLeaveRoom">나가기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
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
    <div class="flex-grow-1 pa-4 overflow-y-auto chat-scroll" ref="chatContainer">
      <div v-for="(msg, index) in chatMessages" :key="msg.id || index" class="mb-1">
        <div :class="['d-flex', msg.senderId === myId ? 'justify-end' : 'justify-start']">
          
          <!-- 내 메시지 (오른쪽) -->
          <template v-if="msg.senderId === myId">
            <!-- 시간 (왼쪽) -->
            <div class="d-flex align-end mr-1" style="min-width: 50px;">
              <span class="text-caption text-grey-darken-1">
                {{ formatRelativeTime(msg.createdAt) }}
              </span>
            </div>
            
            <!-- 메시지 내용 (오른쪽) -->
            <div class="d-inline-flex flex-column pa-2 rounded-lg bg-orange-lighten-5 align-end" style="max-width: 70%; word-break: break-word">
              
              <!-- 텍스트 메시지 -->
              <span v-if="msg.hasMessage()" class="text-body-2">{{ msg.message }}</span>
              
              <!-- 이미지 파일들 -->
              <div v-if="msg.getImageFiles().length > 0" class="mt-1">
                <div v-for="file in msg.getImageFiles()" :key="file.id" class="mb-1">
                  <v-img 
                    :src="file.fileUrl" 
                    max-width="200" 
                    class="rounded" 
                    :alt="file.fileName"
                    @click="openImage(file.fileUrl)"
                    style="cursor: pointer;"
                  />
                  <div class="text-caption text-grey-darken-1 mt-1">
                    {{ file.fileName }}
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
              
              <!-- 이미지 파일들 -->
              <div v-if="msg.getImageFiles().length > 0" class="mt-1">
                <div v-for="file in msg.getImageFiles()" :key="file.id" class="mb-1">
                  <v-img 
                    :src="file.fileUrl" 
                    max-width="200" 
                    class="rounded" 
                    :alt="file.fileName"
                    @click="openImage(file.fileUrl)"
                    style="cursor: pointer;"
                  />
                  <div class="text-caption text-grey-darken-1 mt-1">
                    {{ file.fileName }}
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
            
            <!-- 시간 (오른쪽) -->
            <div class="d-flex align-end ml-1" style="min-width: 50px;">
              <span class="text-caption text-grey-darken-1">
                {{ formatRelativeTime(msg.createdAt) }}
              </span>
            </div>
          </template>
          
        </div>
      </div>
      
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" />
      </div>
      
      <!-- 빈 상태 -->
      <div v-if="!loading && chatMessages.length === 0" class="text-center py-8">
        <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
        <div class="mt-2 text-subtitle-1 text-grey">
          아직 메시지가 없습니다
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
            :src="file" 
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
        v-model="message"
        placeholder="메시지를 입력하세요..."
        hide-details
        variant="outlined"
        class="flex-grow-1 mr-2"
        rounded
        density="compact"
        @keyup.enter="sendMessage"
        @input="onTextInputWrapper"
        :disabled="loading || selectedFiles.length > 0"
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
      <v-btn color="orange" icon class="ml-2" :disabled="isSending || loading" @click="sendMessage">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import { formatRelativeTime } from '@/utils/timeUtils';
import { useFileUpload } from '@/composables/useFileUpload';
import { useDialog } from '@/composables/useDialog';

const props = defineProps({
  chat: Object,
});

const chatStore = useChatStore();
const { messages, currentRoomId, loading } = storeToRefs(chatStore);

const chatContainer = ref(null);
const myId = '00000000-0000-0000-0000-000000000000'; // current_user ID
const chatMessages = computed(() => messages.value);

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
  showLeaveConfirmDialog,
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
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// 컴포저블의 함수들을 래핑하여 message ref를 전달
const handleFileChangeWrapper = (e) => handleFileChange(e, message);
const onTextInputWrapper = () => onTextInput(message);





// 채팅방 이름 변경
const editRoomName = () => {
  newRoomName.value = currentRoom.value?.chatRoomName || '';
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
    await chatStore.leaveRoom(currentRoomId.value);
    resetLeaveConfirmDialog();
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
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
  if (isSending.value || loading.value) return;
  if (!message.value.trim() && selectedFiles.value.length === 0) return;
  
  isSending.value = true;
  
  try {
    const hasText = message.value.trim();
    const hasFiles = selectedFiles.value.length > 0;
    
    if (hasText && !hasFiles) {
      // 텍스트만 있는 경우
      await chatStore.sendMessage(message.value, null);
    } else if (!hasText && hasFiles) {
      // 파일만 있는 경우
      await chatStore.sendMessage("", selectedFiles.value);
    } else if (hasText && hasFiles) {
      // 텍스트와 파일 모두 있는 경우
      await chatStore.sendMessage(message.value, selectedFiles.value);
    }
    
    message.value = "";
    removeAllFiles();
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  } finally {
    isSending.value = false;
  }
};



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
</style>
