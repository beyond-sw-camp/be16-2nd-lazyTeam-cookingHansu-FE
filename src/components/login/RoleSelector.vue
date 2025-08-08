<template>
  <div class="role-selector-wrapper">
    <label v-if="label" class="form-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <div class="role-group">
      <div
        v-for="role in roles"
        :key="role.value"
        class="role-radio"
        :class="{ selected: modelValue === role.value }"
        @click="$emit('update:modelValue', role.value)"
      >
        <div class="role-input">
          <span class="radio-circle">
            <span v-if="modelValue === role.value" class="radio-dot"></span>
          </span>
        </div>
        <div class="role-text">
          <div class="role-title">{{ role.label }}</div>
          <div class="role-desc">{{ role.desc }}</div>
        </div>
      </div>
    </div>
    <div v-if="errorMessage" class="input-error">
      <span class="error-icon">&#10006;</span> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: '역할 선택'
  },
  roles: {
    type: Array,
    default: () => [
      { value: 'user', label: '일반 사용자', desc: '레시피 공유 및 강의 수강' },
      { value: 'cook', label: '요식업 종사자', desc: '요리사, 요리연구가' },
      { value: 'owner', label: '요식업 자영업자', desc: '식당, 카페 운영자' }
    ]
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.role-selector-wrapper {
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

.role-group {
  display: flex;
  flex-direction: column;
}

.role-radio {
  display: flex;
  align-items: center;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  background: var(--color-white);
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
}

.role-radio.selected {
  border-color: var(--color-primary);
  background: #fff5ea;
}

.role-input {
  margin-right: 18px;
}

.radio-circle {
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
}

.role-text {
  display: flex;
  flex-direction: column;
}

.role-title {
  font-size: 1.08rem;
  font-weight: bold;
  color: var(--color-text);
}

.role-desc {
  font-size: 0.98rem;
  color: #bdbdbd;
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
