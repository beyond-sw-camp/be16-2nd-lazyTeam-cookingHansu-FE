<template>
  <v-container fluid class="pa-6">
    <v-row no-gutters class="chat-wrapper" style="min-height: 600px">
      <!-- 채팅 목록 -->
      <v-col md="1.5" />
      <v-col cols="12" md="3" class="chat-list">
        <v-sheet class="h-100 pa-4" elevation="2">
          <h3 class="text-h6 font-weight-bold mb-4">채팅 목록</h3>
          <div
            ref="chatScroll"
            class="chat-scroll-wrapper"
            @scroll.passive="onScroll"
            style="max-height: calc(100vh - 200px); overflow-y: auto"
          >
            <v-list dense nav>
              <v-list-item
                v-for="chat in visibleChats"
                :key="chat.id"
                @click="selectChat(chat.id)"
                :class="{ 'bg-grey-lighten-4': chat.id === selectedChatId }"
                class="py-4 px-3"
              >
                <div class="d-flex w-100 align-start">
                  <!-- 아바타 -->
                  <v-avatar size="48" class="mr-4">
                    <template v-if="chat.avatar">
                      <v-img :src="chat.avatar" />
                    </template>
                    <template v-else>
                      <span class="text-h6 font-weight-bold">{{ chat.name.charAt(0) }}</span>
                    </template>
                  </v-avatar>
                  <!-- 텍스트 섹션 -->
                  <div class="flex-grow-1">
                    <div class="d-flex justify-space-between align-start">
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ chat.name }}
                      </div>
                      <div class="text-caption text-grey mt-1">
                        {{ formatTime(chat.lastMessageTime) }}
                      </div>
                    </div>
                    <!-- 1줄이상 해당 컨테이너 벗어나면 ... 적용 -->
                    <div
                      class="text-body-2 text-grey-darken-1"
                      :style="{
                        overflow: 'hidden',
                        'text-overflow': 'ellipsis',
                        'white-space': 'nowrap',
                      }"
                    >
                      {{ chat.lastMessage }}
                    </div>
                  </div>

                  <!-- 뱃지 -->
                  <div
                    v-if="chat.unreadCount > 0"
                    class="d-flex align-end ml-2"
                  >
                    <div
                      class="rounded-circle text-white text-caption font-weight-bold d-flex align-center justify-center"
                      style="
                        background-color: orange;
                        width: 20px;
                        height: 20px;
                      "
                    >
                      {{ chat.unreadCount }}
                    </div>
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </div>
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
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store/chat/chat';
import ChatDetailView from "@/views/chat/chatDetailScreen.vue";

const chatStore = useChatStore();
const { rooms, currentRoomId, loading } = storeToRefs(chatStore);

const selectChat = (id) => {
  chatStore.fetchMessages(id);
};

const selectedChatId = computed(() => chatStore.currentRoomId);
const selectedChat = computed(() => rooms.value.find((c) => c.id === selectedChatId.value));

const chatScroll = ref(null);
const visibleCount = ref(5);
const visibleChats = computed(() => rooms.value.slice(0, visibleCount.value));

const onScroll = () => {
  const el = chatScroll.value;
  if (!el) return;
  const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
  if (bottom && visibleCount.value < rooms.value.length) {
    visibleCount.value += 5;
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

onMounted(() => {
  chatStore.fetchRooms();
});
</script>
