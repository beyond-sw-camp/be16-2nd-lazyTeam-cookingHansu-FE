<template>
  <div class="d-flex flex-column h-100">
    <!-- 헤더 -->
    <div class="d-flex align-center px-4 py-3 border-b grey lighten-4">
      <v-avatar color="grey-lighten-2" size="36" class="mr-2">
        <template v-if="partnerAvatar">
          <v-img :src="partnerAvatar" />
        </template>
        <template v-else>
          <span class="text-h6 font-weight-bold">{{ partnerName.charAt(0) }}</span>
        </template>
      </v-avatar>
      <span class="subtitle-1 font-weight-medium">{{ partnerName }}</span>
    </div>
    <!-- 메시지 영역 -->
    <div class="flex-grow-1 pa-4 overflow-y-auto chat-scroll" ref="chatContainer">
      <div v-for="(msg, index) in chatMessages" :key="index" class="mb-2">
        <div :class="['d-flex', msg.sender === myName ? 'justify-end' : 'justify-start']">
          <div :class="[
            'd-inline-flex flex-column pa-3 rounded-lg',
            msg.sender === myName ? 'bg-orange-lighten-5' : 'bg-grey-lighten-4',
            msg.sender === myName ? 'align-end' : 'align-start',
          ]" style="max-width: 70%; word-break: break-word">
            <span class="text-body-2">{{ msg.content }}</span>
            <span class="text-caption text-grey-darken-1 mt-1" style="font-size: 11px;">
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
        </div>
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
      ></v-text-field>
      <v-btn color="orange" icon class="ml-2" @click="sendMessage">
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
const message = ref("");
const fileInput = ref(null);
const selectedFile = ref(null);
const selectedFileName = ref("");

const chatMessages = computed(() => messages.value);
const myName = '나'; // 실제 로그인 사용자명으로 교체 가능
const currentRoom = computed(() => rooms.value.find(r => r.id === currentRoomId.value));
const partnerName = computed(() => currentRoom.value ? currentRoom.value.name : '');
const partnerAvatar = computed(() => currentRoom.value ? currentRoom.value.avatar : '');

watch(
  () => props.chat?.id,
  (newId) => {
    if (newId) chatStore.fetchMessages(newId);
    nextTick(scrollToBottom);
  },
  { immediate: true }
);

watch(chatMessages, () => {
  nextTick(scrollToBottom);
});

const triggerFileInput = () => fileInput.value?.click();
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    selectedFile.value = url;
    selectedFileName.value = file.name;
  }
};

const sendMessage = () => {
  if (message.value.trim()) {
    chatStore.sendMessage(message.value, myName);
    message.value = "";
    selectedFile.value = null;
    selectedFileName.value = "";
    nextTick(scrollToBottom);
  }
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
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

const isImage = (url) => {
  return (
    url &&
    (url.endsWith(".png") ||
      url.endsWith(".jpg") ||
      url.endsWith(".jpeg") ||
      url.startsWith("blob:"))
  );
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
