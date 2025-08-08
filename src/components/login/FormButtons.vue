<template>
  <div class="form-actions">
    <button
      v-if="showPrev"
      type="button"
      class="btn prev"
      @click="$emit('prev')"
      @mousedown="btnActive('prev')"
      @mouseup="btnInactive('prev')"
      @mouseleave="btnInactive('prev')"
    >
      {{ prevText }}
    </button>
    <button
      type="submit"
      class="btn next"
      @click="$emit('next')"
      @mousedown="btnActive('next')"
      @mouseup="btnInactive('next')"
      @mouseleave="btnInactive('next')"
    >
      {{ nextText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  showPrev: {
    type: Boolean,
    default: true
  },
  prevText: {
    type: String,
    default: '이전'
  },
  nextText: {
    type: String,
    default: '다음'
  }
})

defineEmits(['prev', 'next'])

function btnActive(type) {
  const btn = document.querySelector('.btn.' + type)
  if (btn) btn.classList.add('active')
}

function btnInactive(type) {
  const btn = document.querySelector('.btn.' + type)
  if (btn) btn.classList.remove('active')
}
</script>

<style scoped>
.form-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.btn {
  width: 48%;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s, background 0.18s, color 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.btn.prev {
  background: var(--color-background);
  color: var(--color-text);
  border: 1.5px solid #e9ecef;
}

.btn.next {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn:hover {
  filter: brightness(0.97);
  box-shadow: 0 2px 8px rgba(255,107,53,0.08);
}

.btn.active {
  filter: brightness(0.93);
  background: #ff884d !important;
  color: #fff !important;
}
</style>
