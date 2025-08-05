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
        <v-btn icon size="small" @click="showRoomOptions = !showRoomOptions">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </div>
    </div>
    
    <!-- 채팅방 옵션 메뉴 -->
    <v-menu v-model="showRoomOptions" :close-on-content-click="false">
      <v-list>
        <v-list-item @click="editRoomName">
          <v-list-item-title>채팅방 이름 변경</v-list-item-title>
        </v-list-item>
        <v-list-item @click="leaveRoom" class="text-error">
          <v-list-item-title>채팅방 나가기</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    
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
                {{ formatTime(msg.createdAt) }}
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
                {{ formatTime(msg.createdAt) }}
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
    <div v-if="selectedFile" class="px-4 pt-2 pb-0 d-flex align-center">
      <div class="pa-3 rounded-lg border d-flex align-center" style="max-width: 70%">
        <div class="text-caption text-grey-darken-1 font-weight-medium">
          📎 {{ selectedFileName }}
        </div>
        <v-img v-if="selectedFileType && selectedFileType.startsWith('image/')" :src="selectedFile" max-width="100" class="ml-2 rounded" />
        <v-btn icon size="small" class="ml-2" @click="removeSelectedFile"><v-icon>mdi-close</v-icon></v-btn>
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
        :disabled="loading"
      ></v-text-field>
      <v-btn icon @click="triggerFileInput" :disabled="loading">
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>
      <input ref="fileInput" type="file" class="d-none" @change="handleFileChange" />
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

const props = defineProps({
  chat: Object,
});

const chatStore = useChatStore();
const { messages, currentRoomId, loading } = storeToRefs(chatStore);

const chatContainer = ref(null);
const myId = '00000000-0000-0000-0000-000000000000'; // current_user ID
const chatMessages = computed(() => messages.value);

const message = ref("");
const fileInput = ref(null);
const selectedFile = ref(null);
const selectedFileName = ref("");
const selectedFileType = ref("");
const isSending = ref(false);
const showRoomOptions = ref(false);
const showImageDialog = ref(false);
const selectedImageUrl = ref('');

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

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = URL.createObjectURL(file);
    selectedFileName.value = file.name;
    selectedFileType.value = file.type;
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  selectedFileName.value = "";
  selectedFileType.value = "";
};

const openImage = (imageUrl) => {
  selectedImageUrl.value = imageUrl;
  showImageDialog.value = true;
};

const closeImageDialog = () => {
  showImageDialog.value = false;
  selectedImageUrl.value = '';
};

const sendMessage = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (isSending.value || loading.value) return;
  if (!message.value.trim() && !selectedFile.value) return;
  
  isSending.value = true;
  
  try {
    await chatStore.sendMessage(message.value, selectedFile.value);
    message.value = "";
    removeSelectedFile();
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  } finally {
    isSending.value = false;
  }
};

const editRoomName = async () => {
  const newName = prompt('새로운 채팅방 이름을 입력하세요:', currentRoom.value?.chatRoomName || '');
  if (newName && newName.trim()) {
    try {
      await chatStore.updateRoomName(currentRoomId.value, newName.trim());
      showRoomOptions.value = false;
    } catch (error) {
      console.error('채팅방 이름 변경 실패:', error);
    }
  }
};

const leaveRoom = async () => {
  if (confirm('정말로 이 채팅방을 나가시겠습니까?')) {
    try {
      await chatStore.leaveRoom(currentRoomId.value);
      showRoomOptions.value = false;
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
    }
  }
};

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // 오늘인지 확인
  const isToday = date.toDateString() === now.toDateString();
  
  if (diffHours < 24 && isToday) {
    // 오늘: 시간만 표시
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    return `${isPM ? '오후' : '오전'} ${hour12}:${minutes}`;
  } else if (diffHours < 48 && isToday) {
    // 어제
    return '어제';
  } else {
    // 그 이전: 날짜 표시
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
}

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
