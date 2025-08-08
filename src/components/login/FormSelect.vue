<template>
  <div class="form-select-wrapper">
    <label v-if="label" class="form-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <div class="select-wrapper">
      <select
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleSelectOpen"
        @blur="handleSelectClose"
        :class="['form-input', { error: hasError }]"
        :required="required"
        v-bind="$attrs"
      >
        <option disabled value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span class="select-arrow" :class="{ open: selectOpen }">
        <svg width="18" height="18" viewBox="0 0 20 20">
          <path d="M5 8l5 5 5-5" stroke="#bdbdbd" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </span>
    </div>
    <div v-if="errorMessage" class="input-error">
      <span class="error-icon">&#10006;</span> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectOpen = ref(false)

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '선택하세요'
  },
  options: {
    type: Array,
    default: () => []
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

function handleSelectOpen() {
  selectOpen.value = true
}

function handleSelectClose() {
  selectOpen.value = false
}
</script>

<style scoped>
.form-select-wrapper {
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

.select-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  height: 52px;
  border: 1.5px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 1.08rem;
  font-family: inherit;
  margin-bottom: 4px;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
  transition: border 0.18s;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.error {
  border: 1.5px solid #e53935;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%) rotate(0deg);
  pointer-events: none;
  transition: transform 0.2s;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-arrow.open {
  transform: translateY(-50%) rotate(180deg);
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
