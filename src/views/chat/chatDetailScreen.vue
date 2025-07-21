<template>
  <div class="d-flex flex-column h-100">
    <!-- 헤더 -->
    <div class="d-flex align-center px-4 py-3 border-b grey lighten-4">
      <v-avatar color="grey-lighten-2" size="36" class="mr-2"></v-avatar>
      <span class="subtitle-1 font-weight-medium">{{ chat.name }}</span>
    </div>

    <!-- 메시지 영역 -->
    <div class="flex-grow-1 pa-4">
      <p class="text-center text-grey">여기에 메시지 내용을 렌더링하세요.</p>
    </div>

    <!-- 입력창 -->
    <div class="d-flex px-4 py-3 border-t align-center">
      <v-text-field
        v-model="message"
        placeholder="메시지를 입력하세요..."
        hide-details
        dense
        variant="outlined"
        class="flex-grow-1"
      ></v-text-field>

      <v-btn color="orange" class="ml-2" icon @click="sendMessage">
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  chat: Object,
});

const message = ref("");
const sendMessage = () => {
  if (message.value.trim()) {
    console.log("전송:", message.value);
    message.value = "";
  }
};
</script>
