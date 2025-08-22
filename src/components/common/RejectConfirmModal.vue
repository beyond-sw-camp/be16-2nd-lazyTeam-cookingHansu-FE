<template>
  <v-dialog 
    v-model="dialog" 
    max-width="500" 
    :persistent="false"
    @click:outside="closeDialog"
    @keydown.esc="closeDialog"
  >
    <v-card>
      <v-card-title class="text-h6 pa-6 pb-4">
        <v-icon start color="error" class="mr-3">mdi-close-circle</v-icon>
        거절 확인
      </v-card-title>
      <v-card-text class="pa-6 pt-0 pb-4">
        <p class="mb-4 text-body-1">{{ itemName }}을(를) 거절하시겠습니까?</p>
        <v-text-field
          v-model="reason"
          label="거절 사유"
          placeholder="거절 사유를 입력해주세요"
          variant="outlined"
          rows="3"
          auto-grow
          :rules="reasonRules"
          required
          @keydown.enter="handleEnterKey"
          ref="reasonInput"
        />
        <p class="text-caption text-grey-darken-1 mt-3">
          거절된 {{ itemType }}은(는) 플랫폼에서 서비스되지 않습니다.
        </p>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn 
          variant="text"
          @click="closeDialog"
          :disabled="loading"
          class="mr-3"
        >
          취소
        </v-btn>
        <v-btn 
          color="error" 
          variant="elevated"
          @click="confirmReject"
          :loading="loading"
          :disabled="loading || !reason.trim()"
        >
          <v-icon start>mdi-close</v-icon>
          거절
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    default: '항목'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const dialog = ref(props.modelValue);
const reason = ref('');
const reasonInput = ref(null);

const reasonRules = [
  v => !!v || '거절 사유는 필수입니다.',
  v => v.length <= 200 || '거절 사유는 200자 이하여야 합니다.',
];

watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
  if (!newValue) {
    reason.value = '';
  } else {
    // 다이얼로그가 열릴 때 입력 필드에 포커스
    nextTick(() => {
      if (reasonInput.value) {
        reasonInput.value.focus();
      }
    });
  }
});

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  dialog.value = false;
  reason.value = '';
};

const confirmReject = () => {
  if (!reason.value.trim()) return;
  emit('confirm', reason.value);
};

const handleEnterKey = (event) => {
  event.preventDefault();
  if (reason.value.trim() && !props.loading) {
    confirmReject();
  }
};
</script>

<style scoped>
.v-card-title {
  display: flex;
  align-items: center;
}
</style>
