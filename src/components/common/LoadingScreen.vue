<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="loading-icon">
        <v-icon size="80" color="orange" class="loading-animation">mdi-food-fork-drink</v-icon>
      </div>
      <h3 class="loading-title">{{ title || '준비하고 있어요' }}</h3>
      <p class="loading-description">{{ description || '잠시만 기다려주세요...' }}</p>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '준비하고 있어요'
  },
  description: {
    type: String,
    default: '잠시만 기다려주세요...'
  }
});
</script>

<style scoped>
/* 로딩 컨테이너 스타일 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px;
  margin-top: -200px;
}

.loading-content {
  text-align: center;
  max-width: 400px;
}

.loading-icon {
  margin-bottom: 32px;
}

.loading-animation {
  animation: bounce 2s infinite;
}

.loading-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.loading-description {
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff9800;
  animation: pulse 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .loading-title {
    font-size: 1.5rem;
  }
  
  .loading-description {
    font-size: 0.9rem;
  }
  
  .loading-container {
    margin-top: -100px;
  }
}
</style>
