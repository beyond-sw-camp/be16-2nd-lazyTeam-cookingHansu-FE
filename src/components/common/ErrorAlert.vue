<template>
  <div class="error-alert" :class="{ 'error-alert--visible': visible }">
    <div class="error-alert__container">
      <div class="error-alert__icon">
        <v-icon size="24" color="white">mdi-wifi-off</v-icon>
      </div>
      <div class="error-alert__content">
        <h4 class="error-alert__title">{{ title || '연결 오류' }}</h4>
        <p class="error-alert__message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    title: {
      type: String,
      default: '연결 오류'
    },
    message: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.error-alert {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  margin: 20px 0;
  overflow: hidden;
  transform: translateY(-10px);
  opacity: 0;
  animation: slideIn 0.4s ease-out forwards;
}

.error-alert--visible {
  transform: translateY(0);
  opacity: 1;
}

.error-alert__container {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  position: relative;
}

.error-alert__icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-alert__content {
  flex: 1;
  min-width: 0;
}

.error-alert__title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.error-alert__message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
}



@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .error-alert__container {
    padding: 16px 20px;
  }
  
  .error-alert__icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .error-alert__title {
    font-size: 1rem;
  }
  
  .error-alert__message {
    font-size: 0.9rem;
  }
  

}
</style>
