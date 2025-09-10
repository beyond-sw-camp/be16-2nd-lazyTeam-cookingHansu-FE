<template>
  <v-dialog 
    v-model="dialog" 
    max-width="400" 
    :persistent="false"
    @click:outside="closeDialog"
    @keydown.esc="closeDialog"
  >
    <v-card>
      <v-card-title class="text-h6 pa-6 pb-4">
        <v-icon start color="success" class="mr-3">mdi-check-circle</v-icon>
        승인 확인
      </v-card-title>
      <v-card-text class="pa-6 pt-0 pb-4">
        <p class="mb-3 text-body-1">{{ itemName }}을(를) 승인하시겠습니까?</p>
        <p class="text-caption text-grey-darken-1">
          승인된 {{ itemType }}은(는) 플랫폼에서 정상적으로 서비스됩니다.
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
          color="success" 
          variant="elevated"
          @click="confirmApproval"
          :loading="loading"
          :disabled="loading"
        >
          <v-icon start>mdi-check</v-icon>
          승인
        </v-btn>
      </v-card-actions>
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

watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  dialog.value = false;
};

const confirmApproval = () => {
  emit('confirm');
};
</script>

<style scoped>
.v-card-title {
  display: flex;
  align-items: center;
}
</style>
