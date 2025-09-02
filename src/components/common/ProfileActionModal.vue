<template>
  <div v-if="show" class="profile-action-modal-overlay" @click="closeModal">
    <div 
      class="profile-action-modal" 
      @click.stop
      :style="modalStyle"
    >
      <div class="modal-arrow"></div>
      <div class="action-buttons">
        <button class="action-btn chat-btn" @click="handleChat">
          <span class="action-icon">💬</span>
          <span class="action-text">채팅하기</span>
        </button>
        <button class="action-btn report-btn" @click="handleReport">
          <span class="action-icon">🚨</span>
          <span class="action-text">신고하기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileActionModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    }
  },
  emits: ['close', 'chat', 'report'],
  computed: {
    modalStyle() {
      return {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        transform: 'translateX(-50%)'
      };
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    handleChat() {
      this.$emit('chat', {
        userId: this.userId,
        userName: this.userName
      });
      this.closeModal();
    },
    handleReport() {
      this.$emit('report', {
        userId: this.userId,
        userName: this.userName
      });
      this.closeModal();
    }
  }
};
</script>

<style scoped>
.profile-action-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: transparent;
}

.profile-action-modal {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  min-width: 120px;
  z-index: 1001;
}

.modal-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

.modal-arrow::before {
  content: '';
  position: absolute;
  top: 1px;
  left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #e0e0e0;
  z-index: -1;
}

.action-buttons {
  padding: 8px 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn:first-child {
  border-radius: 8px 8px 0 0;
}

.action-btn:last-child {
  border-radius: 0 0 8px 8px;
}

.action-btn:only-child {
  border-radius: 8px;
}

.action-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.action-text {
  font-weight: 500;
}

.chat-btn:hover {
  color: #17a2b8;
}

.report-btn:hover {
  color: #dc3545;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .profile-action-modal {
    min-width: 100px;
  }
  
  .action-btn {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .action-icon {
    font-size: 14px;
    width: 18px;
  }
}
</style>
