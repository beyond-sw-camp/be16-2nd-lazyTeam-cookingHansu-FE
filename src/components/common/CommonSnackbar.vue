<template>
  <div class="common-snackbar" :class="{ 
    'common-snackbar--visible': visible,
    'common-snackbar--success': type === 'success',
    'common-snackbar--error': type === 'error'
  }">
    <div class="common-snackbar__container">
      <div class="common-snackbar__icon">
        <v-icon size="24" color="white">
          {{ type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
      </div>
      <div class="common-snackbar__content">
        <h4 class="common-snackbar__title">{{ title }}</h4>
        <p class="common-snackbar__message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonSnackbar',
  props: {
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error'].includes(value)
    },
    title: {
      type: String,
      default: '알림'
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
  emits: ['close'],
  mounted() {
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      this.$emit('close')
    }, 1000)
  }
}
</script>

<style scoped>
.common-snackbar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  z-index: 9999;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  opacity: 0;
  animation: slideInDown 0.3s ease-out forwards;
  max-width: 400px;
  min-width: 300px;
}

.common-snackbar--success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
}

.common-snackbar--error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  box-shadow: 0 8px 32px rgba(244, 67, 54, 0.3);
}

.common-snackbar--visible {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.common-snackbar__container {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  position: relative;
}

.common-snackbar__icon {
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

.common-snackbar__content {
  flex: 1;
  min-width: 0;
}

.common-snackbar__title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.common-snackbar__message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
}

@keyframes slideInDown {
  from {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .common-snackbar {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: translateY(-100%);
    max-width: none;
    min-width: auto;
  }
  
  .common-snackbar--visible {
    transform: translateY(0);
  }
  
  .common-snackbar__container {
    padding: 16px 20px;
  }
  
  .common-snackbar__icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .common-snackbar__title {
    font-size: 1rem;
  }
  
  .common-snackbar__message {
    font-size: 0.9rem;
  }
}
</style>
