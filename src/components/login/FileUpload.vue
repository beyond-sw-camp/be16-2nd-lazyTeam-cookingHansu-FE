<template>
  <div class="file-upload-wrapper">
    <label v-if="label" class="form-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <div class="file-upload">
      <input
        type="file"
        :accept="accept"
        @change="handleFileChange"
        :id="inputId"
        style="display:none;"
        :required="required"
      />
      <label :for="inputId" class="file-label">
        <span v-if="fileName">{{ fileName }}</span>
        <span v-else class="file-placeholder">
          <svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:6px;">
            <path d="M10 3v10m0 0l-3-3m3 3l3-3" stroke="#bdbdbd" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
          {{ placeholder }}
        </span>
      </label>
    </div>
    <div v-if="errorMessage" class="input-error">
      <span class="error-icon">&#10006;</span> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: File,
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '파일을 선택하세요'
  },
  accept: {
    type: String,
    default: 'image/*,.pdf'
  },
  required: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const inputId = computed(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`)

const fileName = computed(() => {
  return props.modelValue ? props.modelValue.name : ''
})

function handleFileChange(event) {
  const file = event.target.files[0]
  emit('update:modelValue', file)
}
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
  margin-bottom: 4px;
}

.form-label {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 2px;
  display: block;
}

.required {
  color: #ff884d;
  font-size: 1.1em;
  margin-left: 2px;
}

.file-upload {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.file-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 52px;
  border-radius: 8px;
  background: #f3f3f3;
  border: 1.5px solid #e9ecef;
  cursor: pointer;
  padding: 0 14px;
  font-size: 1.08rem;
  color: #bdbdbd;
  transition: border 0.18s;
}

.file-label:hover {
  border: 1.5px solid var(--color-primary);
}

.file-placeholder {
  color: #bdbdbd;
  display: flex;
  align-items: center;
  font-size: 1.05rem;
}

.input-error {
  color: #e53935;
  font-size: 0.97rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
}

.error-icon {
  font-size: 1.1em;
  margin-right: 2px;
}
</style>
