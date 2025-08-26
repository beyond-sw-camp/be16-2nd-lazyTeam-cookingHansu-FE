<template>
  <v-dialog 
    v-model="dialog" 
    max-width="450" 
    :retain-focus="false"
    @click:outside="closeModal"
    @keydown.esc="closeModal"
  >
    <v-card class="user-profile-modal">
      <!-- 헤더 -->
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
        <span class="text-h6 font-weight-bold">사용자 프로필</span>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="closeModal"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pt-0">
        <!-- 프로필 정보 -->
        <div class="profile-section">
          <div class="d-flex align-center mb-4">
            <v-avatar size="80" class="mr-4">
              <v-img :src="user.profileImage" :alt="user.nickname">
                <template v-slot:placeholder>
                  <v-icon size="40" color="grey">mdi-account</v-icon>
                </template>
              </v-img>
            </v-avatar>
            
            <div class="profile-info">
              <h3 class="text-h5 font-weight-bold mb-2">{{ user.nickname }}</h3>
              <p class="text-body-2 text-grey mb-1">{{ user.email }}</p>
              <p class="text-caption text-grey">
                가입일: {{ formatDate(user.joinDate) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            block
            prepend-icon="mdi-chat"
            @click="startChat"
            class="mb-3"
          >
            1:1 채팅하기
          </v-btn>
          
          <v-btn
            color="error"
            variant="outlined"
            block
            prepend-icon="mdi-flag"
            @click="reportUser"
          >
            신고하기
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      nickname: '',
      email: '',
      profileImage: '',
      joinDate: ''
    })
  }
});

const emit = defineEmits(['update:modelValue', 'chat', 'report']);

const dialog = ref(props.modelValue);

// 모달 닫기
const closeModal = () => {
  dialog.value = false;
  emit('update:modelValue', false);
};

// 1:1 채팅 시작
const startChat = () => {
  emit('chat', props.user.id);
};

// 사용자 신고
const reportUser = () => {
  emit('report', props.user.id);
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// props 변경 감지
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

// 모달 상태 변경 감지
watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
.user-profile-modal {
  border-radius: 12px;
}

.user-profile-modal .v-card-title {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
}

.profile-section {
  padding: 16px 0;
}

.profile-info {
  flex: 1;
}

.action-buttons {
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.action-buttons .v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  height: 44px;
}

.action-buttons .v-btn--variant-flat {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-buttons .v-btn--variant-outlined {
  border-width: 2px;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .user-profile-modal .v-card-text {
    padding: 16px;
  }
  
  .profile-info .d-flex {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
