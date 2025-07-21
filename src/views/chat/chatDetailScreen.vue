<template>
  <div class="d-flex flex-column h-100">
    <!-- 헤더 -->
    <div class="d-flex align-center px-4 py-3 border-b grey lighten-4">
      <v-avatar color="grey-lighten-2" size="36" class="mr-2"></v-avatar>
      <span class="subtitle-1 font-weight-medium">{{ chat.name }}</span>
    </div>

    <!-- 메시지 영역 -->
    <div
      class="flex-grow-1 pa-4 overflow-y-auto chat-scroll"
      ref="chatContainer"
    >
      <div
        v-for="(msg, index) in chatMessages"
        :key="index"
        class="mb-4 d-flex"
        :class="msg.isMine ? 'justify-end' : 'justify-start'"
      >
        <div
          :class="[
            'd-inline-flex flex-column pa-3 rounded-lg',
            msg.isMine ? 'bg-orange-lighten-5' : 'bg-grey-lighten-4',
          ]"
          style="max-width: 70%; word-break: break-word"
        >
          <template v-if="msg.file">
            <div class="mb-2">
              <div class="text-caption text-grey-darken-1 font-weight-medium">
                📎 {{ msg.fileName }}
              </div>
              <template v-if="isImage(msg.file)">
                <v-img :src="msg.file" max-width="200" class="mt-1 rounded" />
                <v-btn
                  variant="text"
                  color="primary"
                  :href="msg.file"
                  download
                  class="mt-1"
                >
                  다운로드하기
                </v-btn>
              </template>
              <v-btn
                v-else
                variant="text"
                color="primary"
                :href="msg.file"
                download
                class="mt-1"
              >
                첨부파일 다운로드
              </v-btn>
            </div>
          </template>

          <span class="text-body-2">{{ msg.text }}</span>
        </div>
      </div>
    </div>

    <!-- 선택한 파일 미리보기 -->
    <div v-if="selectedFile" class="px-4 pt-2 pb-0 d-flex align-center">
      <div
        class="pa-3 rounded-lg border d-flex align-center"
        style="max-width: 70%"
      >
        <div class="text-caption text-grey-darken-1 font-weight-medium">
          📎 {{ selectedFileName }}
        </div>
        <v-img
          v-if="isImage(selectedFile)"
          :src="selectedFile"
          max-width="100"
          class="ml-2 rounded"
        />
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

      <v-btn icon @click="triggerFileInput">
        <v-icon>mdi-paperclip</v-icon>
      </v-btn>

      <input
        ref="fileInput"
        type="file"
        class="d-none"
        @change="handleFileChange"
      />

      <v-btn color="orange" icon class="ml-2" @click="sendMessage">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  chat: Object,
});

const chatContainer = ref(null);

class ChatMessage {
  constructor({
    id,
    chatRoomId,
    sender,
    text = "",
    file = null,
    fileName = "",
    isMine = false,
  }) {
    this.id = id;
    this.chatRoomId = chatRoomId;
    this.sender = sender;
    this.text = text;
    this.file = file;
    this.fileName = fileName;
    this.isMine = isMine;
    this.createdAt = new Date().toISOString();
  }
}

const message = ref("");
const fileInput = ref(null);
const selectedFile = ref(null);
const selectedFileName = ref("");

const messageStore = ref({
  1: [
    new ChatMessage({
      id: 1,
      chatRoomId: 1,
      sender: "김한식",
      text: "안녕하세요!",
      isMine: false,
    }),
    new ChatMessage({
      id: 2,
      chatRoomId: 1,
      sender: "나",
      text: "자료를 다시 보내드릴게요.",
      isMine: true,
    }),
    new ChatMessage({
      id: 3,
      chatRoomId: 1,
      sender: "김한식",
      text: "감사합니다!",
      isMine: false,
    }),
    new ChatMessage({
      id: 4,
      chatRoomId: 1,
      sender: "나",
      text: "혹시 강의 관련해서 질문이 있으신가요?",
      isMine: true,
    }),
    new ChatMessage({
      id: 5,
      chatRoomId: 1,
      sender: "김한식",
      text: "네, 강의 관련해서 질문이 있어서 연락드립니다.",
      isMine: false,
    }),
    new ChatMessage({
      id: 6,
      chatRoomId: 1,
      sender: "나",
      text: "어떤 부분이 궁금하신가요?",
      isMine: true,
    }),
    new ChatMessage({
      id: 7,
      chatRoomId: 1,
      sender: "김한식",
      text: "강의 자료를 다시 보내주실 수 있나요?",
      isMine: false,
    }),
  ],
  2: [
    new ChatMessage({
      id: 1,
      chatRoomId: 2,
      sender: "요리맘",
      text: "레시피 공유 감사합니다!",
      isMine: false,
    }),
    new ChatMessage({
      id: 2,
      chatRoomId: 2,
      sender: "나",
      text: "천만에요! 도움이 되셨길 바랍니다.",
      isMine: true,
    }),
    new ChatMessage({
      id: 3,
      chatRoomId: 2,
      sender: "요리맘",
      text: "혹시 다른 레시피도 추천해주실 수 있나요?",
      isMine: false,
    }),
    new ChatMessage({
      id: 4,
      chatRoomId: 2,
      sender: "나",
      text: "물론이죠! 어떤 요리를 원하시나요?",
      isMine: true,
    }),
    new ChatMessage({
      id: 5,
      chatRoomId: 2,
      sender: "요리맘",
      text: "디저트 종류로 추천해주시면 좋겠어요.",
      isMine: false,
    }),
    new ChatMessage({
      id: 6,
      chatRoomId: 2,
      sender: "나",
      text: "좋아요! 디저트 레시피를 찾아볼게요.",
      isMine: true,
    }),
  ],
  3: [
    new ChatMessage({
      id: 1,
      chatRoomId: 3,
      sender: "김건동",
      text: "문의하신 내용에 대해 답변드립니다.",
      isMine: false,
    }),
    new ChatMessage({
      id: 2,
      chatRoomId: 3,
      sender: "나",
      text: "답변 감사합니다! 확인해보겠습니다.",
      isMine: true,
    }),
    new ChatMessage({
      id: 3,
      chatRoomId: 3,
      sender: "김건동",
      text: "추가로 궁금한 점이 있으면 언제든지 말씀해주세요.",
      isMine: false,
    }),
    new ChatMessage({
      id: 4,
      chatRoomId: 3,
      sender: "나",
      text: "네, 감사합니다!",
      isMine: true,
    }),
  ],
  4: [
    new ChatMessage({
      id: 1,
      chatRoomId: 4,
      sender: "홍길동",
      text: "다음 주 수업 예약 부탁드립니다.",
      isMine: false,
    }),
    new ChatMessage({
      id: 2,
      chatRoomId: 4,
      sender: "나",
      text: "예약 확인했습니다. 감사합니다!",
      isMine: true,
    }),
    new ChatMessage({
      id: 3,
      chatRoomId: 4,
      sender: "홍길동",
      text: "혹시 수업 시간 변경이 가능한가요?",
      isMine: false,
    }),
    new ChatMessage({
      id: 4,
      chatRoomId: 4,
      sender: "나",
      text: "네, 가능합니다. 어떤 시간으로 변경하고 싶으신가요?",
      isMine: true,
    }),
  ],
});

const chatMessages = computed(() => {
  if (!messageStore.value[props.chat.id]) {
    messageStore.value[props.chat.id] = [];
  }
  return messageStore.value[props.chat.id];
});

watch(
  () => props.chat.id,
  (newId) => {
    if (!messageStore.value[newId]) {
      messageStore.value[newId] = [];
    }
    scrollToBottom();
  }
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
  if (message.value.trim() || selectedFile.value) {
    const newMessage = new ChatMessage({
      id: Date.now(),
      chatRoomId: props.chat.id,
      sender: "나",
      text: message.value,
      file: selectedFile.value || null,
      fileName: selectedFileName.value || "",
      isMine: true,
    });
    messageStore.value[props.chat.id].push(newMessage);
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
