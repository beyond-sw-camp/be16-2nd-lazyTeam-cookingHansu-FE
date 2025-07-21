<template>
  <v-container fluid class="pa-6">
    <v-row no-gutters class="chat-wrapper" style="min-height: 600px">
      <!-- 채팅 목록 -->
      <v-col md="1.5" />
      <v-col cols="12" md="3" class="chat-list">
        <v-sheet class="h-100 pa-4" elevation="2">
          <h3 class="text-h6 font-weight-bold mb-4">채팅 목록</h3>
          <v-list dense nav>
            <v-list-item
              v-for="chat in chatList"
              :key="chat.id"
              @click="selectChat(chat.id)"
              :class="{ 'bg-grey-lighten-4': chat.id === selectedChatId }"
              class="py-4 px-3"
            >
              <div class="d-flex w-100 align-start">
                <!-- 아바타 -->
                <v-avatar size="48" class="mr-4">
                  <v-icon color="grey">mdi-account</v-icon>
                </v-avatar>

                <!-- 텍스트 섹션 -->
                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between align-start">
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ chat.name }}
                    </div>
                    <div class="text-caption text-grey mt-1">
                      {{ chat.time }}
                    </div>
                  </div>
                  <div class="text-body-2 text-grey-darken-1 mt-1">
                    {{ chat.lastMessage }}
                  </div>
                </div>

                <!-- 뱃지 -->
                <div v-if="chat.unreadCount > 0" class="d-flex align-end ml-2">
                  <div
                    class="rounded-circle text-white text-caption font-weight-bold d-flex align-center justify-center"
                    style="background-color: orange; width: 20px; height: 20px"
                  >
                    {{ chat.unreadCount }}
                  </div>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>

      <!-- 채팅 상세 -->
      <v-col cols="12" md="6" class="chat-detail">
        <v-sheet
          class="h-100 d-flex flex-column justify-space-between"
          elevation="2"
        >
          <template v-if="selectedChatId === null">
            <div
              class="fill-height d-flex flex-column align-center justify-center text-grey"
            >
              <v-icon size="48">mdi-chat-outline</v-icon>
              <div class="mt-2 text-subtitle-1">
                채팅을 선택하여 대화를 시작하세요
              </div>
            </div>
          </template>

          <ChatDetailView v-else :chat="selectedChat" />
        </v-sheet>
      </v-col>
      <v-col md="1.5" />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import ChatDetailView from "@/views/chat/chatDetailScreen.vue";

const chatList = ref([
  {
    id: 1,
    name: "김한식",
    lastMessage: "강의 관련해서 질문이 있어서 연락드립니다.",
    time: "오후 01:43",
    unreadCount: 3,
  },
  {
    id: 2,
    name: "요리맘",
    lastMessage: "레시피 공유 감사합니다!",
    time: "오후 02:14",
    unreadCount: 0,
  },
  {
    id: 3,
    name: "김건동",
    lastMessage: "문의하신 내용에 대해 답변드립니다.",
    time: "오후 03:05",
    unreadCount: 1,
  },
  {
    id: 4,
    name: "홍길동",
    lastMessage: "다음 주 수업 예약 부탁드립니다.",
    time: "오후 04:20",
    unreadCount: 0,
  },
  {
    id: 5,
    name: "이순신",
    lastMessage: "요리 재료 문의드립니다.",
    time: "오후 05:10",
    unreadCount: 2,
  },
  {
    id: 6,
    name: "박영희",
    lastMessage: "레시피에 대해 궁금한 점이 있습니다.",
    time: "오후 06:30",
    unreadCount: 0,
  },
  {
    id: 7,
    name: "최재원",
    lastMessage: "강의 자료를 다시 보내주세요.",
    time: "오후 07:15",
    unreadCount: 4,
  },
]);

const selectedChatId = ref(null);
const selectChat = (id) => (selectedChatId.value = id);
const selectedChat = computed(() =>
  chatList.value.find((c) => c.id === selectedChatId.value)
);
</script>
