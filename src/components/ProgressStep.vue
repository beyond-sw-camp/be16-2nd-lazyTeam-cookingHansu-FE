<template>
  <div class="progress-indicator">
    <div v-for="n in 3" :key="n" :class="['progress-circle', { active: step === n, checked: n < step, animate: animate && step === n }]">
      <template v-if="n < step">
        <span class="checkmark">✔</span>
      </template>
      <template v-else>
        {{ n }}
      </template>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  step: { type: Number, required: true },
  animate: { type: Boolean, default: false }
})
</script>
<style scoped>
@import '../assets/styles/layout.css';
.progress-indicator {
  display: flex;
  gap: 18px;
  margin-bottom: 32px;
  justify-content: center;
}
.progress-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-background);
  border: 2px solid #d3d3d3;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background 0.25s, color 0.25s, border 0.25s, transform 0.25s;
}
.progress-circle.active {
  background: var(--color-primary);
  color: var(--color-white);
  border: 2px solid var(--color-primary);
}
.progress-circle.checked {
  background: var(--color-success);
  color: var(--color-white);
  border: 2px solid var(--color-success);
}
.progress-circle.animate {
  animation: step-bounce 0.38s cubic-bezier(.4,0,.2,1);
}
@keyframes step-bounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(0.92); }
  100% { transform: scale(1); }
}
.checkmark {
  font-size: 1.2rem;
  font-weight: bold;
}
</style> 