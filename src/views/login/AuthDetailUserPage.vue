<template>
  <div class="add-info-page">
    <div class="top-bar">
      <span class="back-link" @click="goHome">&lt; 홈으로 돌아가기</span>
    </div>
    <ProgressStep :step="3" />
    <transition name="box-slide" mode="out-in">
      <div class="add-info-box" v-if="showBox" key="add-info-box">
        <div class="form-title">요리한수</div>
        <div class="form-subtitle">추가 정보 입력</div>
        <form class="form-content" @submit.prevent="onSubmit">
          <label class="form-label">추가 정보</label>
          <div class="select-wrapper">
            <select class="form-input" :class="{ error: errors.extra }" v-model="form.extra" @focus="handleSelectOpen" @blur="handleSelectClose">
              <option disabled value="">추가 정보를 선택하세요</option>
              <option v-for="opt in extraOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="select-arrow" :class="{ open: selectOpen }">
              <svg width="18" height="18" viewBox="0 0 20 20"><path d="M5 8l5 5 5-5" stroke="#bdbdbd" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
            </span>
          </div>
          <div v-if="errors.extra" class="input-error"><span class="error-icon">&#10006;</span> 추가 정보를 입력해 주세요!</div>
          <div class="form-actions">
            <button type="button" class="btn prev" @click="onPrev" @mousedown="btnActive('prev')" @mouseup="btnInactive('prev')" @mouseleave="btnInactive('prev')">이전</button>
            <button type="submit" class="btn next" @mousedown="btnActive('next')" @mouseup="btnInactive('next')" @mouseleave="btnInactive('next')">다음</button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProgressStep from '@/components/ProgressStep.vue'

const router = useRouter()
const showBox = ref(true)
const selectOpen = ref(false)
const form = ref({
  extra: ''
})
const errors = ref({ extra: false })
const extraOptions = ['학생', '주부', '자취생', '기타']
function goHome() { router.push('/') }
function onPrev() { router.push('/add-info') }
function validate() {
  errors.value.extra = !form.value.extra
  return !errors.value.extra
}
function onSubmit() {
  if (!validate()) return
  router.push('/signup-complete')
}
function handleSelectOpen() {
  selectOpen.value = true
}
function handleSelectClose() {
  selectOpen.value = false
}
</script>
<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';
.add-info-page {
  min-height: 100vh;
  height: 100vh;
  background: #F5F1E8;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'NotoSansKR', 'Noto Sans', sans-serif;
  overflow: hidden;
}
.top-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 12px auto;
  padding-top: 32px;
  display: flex;
  align-items: center;
}
.back-link {
  color: var(--color-text);
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.18s;
}
.back-link:hover {
  color: var(--color-primary);
}
.add-info-box {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 48px 32px 32px 32px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  transition: box-shadow 0.2s;
}
.form-title {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 8px;
  text-align: center;
}
.form-subtitle {
  color: var(--color-text);
  font-size: 1rem;
  margin-bottom: 28px;
  text-align: center;
}
.form-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}
.form-label {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 2px;
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
.form-input.error {
  border: 1.5px solid #e53935;
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
.select-wrapper {
  position: relative;
  width: 100%;
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
.box-slide-enter-active, .box-slide-leave-active {
  transition: all 0.35s cubic-bezier(.4,0,.2,1);
}
.box-slide-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.box-slide-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}
</style> 