<template>
  <div class="skeleton-messages" :class="{ 'fade-in': fadeIn }">
    <div 
      v-for="(_, index) in messageCount" 
      :key="index"
      class="skeleton-message"
      :class="getMessagePosition(index)"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <!-- 왼쪽 메시지일 때만 아바타 표시 -->
      <div v-if="getMessagePosition(index) === 'left'" class="skeleton-avatar"></div>
      
      <div class="skeleton-bubble-wrapper" :class="getMessagePosition(index)">
        <div 
          v-for="(bubble, bubbleIndex) in getBubbleCount(index)" 
          :key="bubbleIndex"
          class="skeleton-bubble"
          :class="[getMessagePosition(index) + '-bubble', getBubbleSize(index, bubbleIndex)]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  messageCount: {
    type: Number,
    default: 6
  },
  fadeIn: {
    type: Boolean,
    default: true
  }
});

// 메시지 위치 결정 (왼쪽/오른쪽 번갈아가며)
const getMessagePosition = (index) => {
  return index % 2 === 0 ? 'left' : 'right';
};

// 각 메시지의 버블 개수 결정 (1~3개)
const getBubbleCount = (index) => {
  const counts = [1, 2, 1, 1, 2, 1];
  return counts[index % counts.length];
};

// 각 버블의 크기 결정
const getBubbleSize = (index, bubbleIndex) => {
  const sizes = ['short', 'medium', 'long'];
  const sizeIndex = (index + bubbleIndex) % sizes.length;
  return sizes[sizeIndex];
};
</script>

<style scoped>
.skeleton-messages { 
  padding: 20px; 
  animation: skeleton-fade-in 0.5s ease-out; 
}

.skeleton-messages.fade-in {
  animation: skeleton-fade-in 0.5s ease-out;
}

.skeleton-message { 
  display: flex; 
  align-items: flex-start; 
  margin-bottom: 30px; 
  animation: skeleton-slide-in 0.6s ease-out; 
}

.skeleton-message.left { 
  justify-content: flex-start; 
}

.skeleton-message.right { 
  justify-content: flex-end; 
}

.skeleton-avatar { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); 
  background-size: 200% 100%; 
  animation: skeleton-loading 1.5s ease-in-out infinite; 
  margin-right: 12px; 
  flex-shrink: 0; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.skeleton-bubble-wrapper { 
  display: flex; 
  flex-direction: column; 
  max-width: 70%; 
  gap: 6px; 
}

.skeleton-bubble-wrapper.right { 
  align-items: flex-end; 
}

.skeleton-bubble { 
  height: 20px; 
  border-radius: 18px; 
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); 
  background-size: 200% 100%; 
  animation: skeleton-loading 1.5s ease-in-out infinite; 
  position: relative; 
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.skeleton-bubble.long { width: 280px; }
.skeleton-bubble.medium { width: 140px; }
.skeleton-bubble.short { width: 90px; }

@keyframes skeleton-loading { 
  0% { background-position: -200% 0; } 
  100% { background-position: 200% 0; } 
}

@keyframes skeleton-fade-in { 
  0% { opacity: 0; transform: translateY(10px); } 
  100% { opacity: 1; transform: translateY(0); } 
}

@keyframes skeleton-slide-in { 
  0% { opacity: 0; transform: translateY(15px); } 
  100% { opacity: 1; transform: translateY(0); } 
}
</style>
