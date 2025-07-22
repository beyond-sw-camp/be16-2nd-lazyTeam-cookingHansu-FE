<template>
  <div class="d-flex flex-column h-100">
    <!-- 헤더 -->
    <div class="d-flex align-center px-4 py-3 border-b grey lighten-4">
      <div class="d-flex align-center">
        <v-avatar color="grey-lighten-2" size="36" class="mr-2">
          <v-img :src="partnerAvatar" />
        </v-avatar>
        <span class="subtitle-1 font-weight-medium">{{ partnerName }}</span>
      </div>
    </div>
    <!-- 메시지 영역 -->
    <div class="flex-grow-1 pa-4 overflow-y-auto chat-scroll" ref="chatContainer">
      <div v-for="(msg, index) in chatMessages" :key="index" class="mb-2">
        <div :class="['d-flex', msg.senderId === myId ? 'justify-end' : 'justify-start']">
          <div :class="[
            'd-inline-flex flex-column pa-3 rounded-lg',
            msg.senderId === myId ? 'bg-orange-lighten-5' : 'bg-grey-lighten-4',
            msg.senderId === myId ? 'align-end' : 'align-start',
          ]" style="max-width: 70%; word-break: break-word">
            <!-- 파일 메시지 -->
            <template v-if="msg.file">
              <div class="mb-2">
                <div class="text-caption text-grey-darken-1 font-weight-medium">
                  📎 {{ msg.fileName }}
                </div>
                <template v-if="isImage(msg.fileType, msg.file)">
                  <v-img :src="msg.file" max-width="200" class="mt-1 rounded" />
                  <v-btn variant="text" color="primary" :href="msg.file" download :title="msg.fileName" class="mt-1">다운로드</v-btn>
                </template>
                <template v-else>
                  <v-btn variant="text" color="primary" :href="msg.file" download :title="msg.fileName" class="mt-1">첨부파일 다운로드</v-btn>
                </template>
              </div>
            </template>
            <!-- 텍스트 메시지 -->
            <span v-if="msg.content" class="text-body-2">{{ msg.content }}</span>
            <span class="text-caption text-grey-darken-1 mt-1" style="font-size: 11px;">
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 파일 미리보기 -->
    <div v-if="selectedFile" class="px-4 pt-2 pb-0 d-flex align-center">
      <div class="pa-3 rounded-lg border d-flex align-center" style="max-width: 70%">
        <div class="text-caption text-grey-darken-1 font-weight-medium">
          📎 {{ selectedFileName }}
        </div>
        <v-img v-if="isImage(selectedFileType, selectedFile)" :src="selectedFile" max-width="100" class="ml-2 rounded" />
        <v-btn icon size="small" class="ml-2" @click="removeSelectedFile"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </div>
    <!-- 입력창 -->
    <div class="pa-3 border-t d-flex align-center">
      <v-text-field
        v-model="message"
        placeholder="메시지를 입력하세요..."
        hide-details
        variant="outlined"
        class="flex-grow-1 mr-2"
        rounded
        @keyup.enter="sendMessage"
      ></v-text-field>
      <v-btn icon @click="triggerFileInput">
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>
      <input ref="fileInput" type="file" class="d-none" @change="handleFileChange" />
      <v-btn color="orange" icon class="ml-2" :disabled="isSending" @click="sendMessage">
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
const { messages, currentRoomId, rooms } = storeToRefs(chatStore);

const chatContainer = ref(null);
const myId = 'user1'; // 실제 로그인 사용자 id로 교체
const chatMessages = computed(() => messages.value);

const message = ref("");
const fileInput = ref(null);
const selectedFile = ref(null);
const selectedFileName = ref("");
const selectedFileType = ref("");
const isSending = ref(false);

const myName = '나'; // 실제 로그인 사용자명으로 교체 가능
const currentRoom = computed(() => rooms.value.find(r => r.id === currentRoomId.value));
const partnerName = computed(() => currentRoom.value.participants[1]);
const partnerAvatar = computed(() => currentRoom.value ? currentRoom.value.avatar : '');

watch(
  () => props.chat?.id,
  (newId) => {
    if (newId) chatStore.fetchMessages(newId);
  },
  { immediate: true }
);

watch(chatMessages, () => {
  
});

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

const sendMessage = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (isSending.value) return;
  if (!message.value.trim() && !selectedFile.value) return;
  isSending.value = true;
  await chatStore.sendMessage(
    message.value,
    myId,
    selectedFile.value,
    selectedFileName.value,
    selectedFileType.value
  );
  message.value = "";
  removeSelectedFile();
  isSending.value = false;
};

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  const hour12 = hours % 12 || 12;
  return `${isPM ? '오후' : '오전'} ${hour12}:${minutes}`;
}

function isImage(type, url) {
  if (type) return type.startsWith('image/');
  return url && (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.startsWith('blob:'));
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
