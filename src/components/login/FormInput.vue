<template>
  <div class="form-input-wrapper">
    <label v-if="label" class="form-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :class="['form-input', { error: hasError }]"
      :required="required"
      :maxlength="maxlength"
      v-bind="$attrs"
    />
    <div v-if="maxlength" class="char-count">
      {{ (modelValue || '').length }}/{{ maxlength }}
    </div>
    <div v-if="errorMessage && hasError" class="input-error">
      <span class="error-icon">&#10006;</span> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  maxlength: {
    type: Number,
    default: null,
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.form-input-wrapper {
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
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.error {
  border: 1.5px solid #e53935;
}

.char-count {
  text-align: right;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 4px;
  margin-right: 2px;
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
