<template>
  <div class="add-info-page">
    <div class="top-bar">
      <span class="back-link" @click="goHome">&lt; 홈으로 돌아가기</span>
    </div>
    <ProgressStep :step="2" :animate="progressAnimate" />
    <transition name="box-slide" mode="out-in">
      <div class="add-info-box" v-if="showBox" key="add-info-box">
        <div class="form-title">요리한수</div>
        <div class="form-subtitle">기본 정보 입력</div>
        <form class="form-content" @submit.prevent="onNext">
          <label class="form-label">이름</label>
          <input class="form-input" :class="{ error: errors.name }" v-model="form.name" placeholder="이름을 입력하세요" />
          <div v-if="errors.name" class="input-error"><span class="error-icon">&#10006;</span> 이름을 입력해 주세요!</div>
          <label class="form-label">이메일</label>
          <input class="form-input" :class="{ error: errors.email }" v-model="form.email" placeholder="이메일을 입력하세요" />
          <div v-if="errors.email" class="input-error"><span class="error-icon">&#10006;</span> 이메일을 입력해 주세요!</div>
          <label class="form-label">프로필 사진</label>
          <div class="profile-upload">
            <input type="file" accept="image/*" @change="onFileChange" id="profileImg" style="display:none;" />
            <label for="profileImg" class="profile-label">
              <img v-if="form.profileUrl" :src="form.profileUrl" class="profile-img" />
              <span v-else class="profile-placeholder">+</span>
            </label>
          </div>
          <label class="form-label">닉네임</label>
          <input class="form-input" :class="{ error: errors.nickname }" v-model="form.nickname" placeholder="닉네임을 입력하세요" />
          <div v-if="errors.nickname" class="input-error"><span class="error-icon">&#10006;</span> 닉네임을 입력해 주세요!</div>
          <label class="form-label">역할 선택</label>
          <div class="role-group">
            <div v-for="role in roles" :key="role.value" :class="['role-radio', { selected: form.role === role.value }]" @click="form.role = role.value">
              <input type="radio" :value="role.value" v-model="form.role" :id="role.value" />
              <label :for="role.value">
                <div class="role-title">{{ role.label }}</div>
                <div class="role-desc">{{ role.desc }}</div>
              </label>
            </div>
          </div>
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
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ProgressStep from '@/components/ProgressStep.vue'

const router = useRouter()
const form = ref({
  name: '',
  email: '',
  profileUrl: '',
  nickname: '',
  role: 'user',
  extra: ''
})
const errors = ref({ name: false, email: false, nickname: false, extra: false })
const roles = [
  { value: 'user', label: '일반 사용자', desc: '레시피 공유 및 강의 수강' },
  { value: 'cook', label: '요식업 종사자', desc: '요리사, 요리연구가' },
  { value: 'owner', label: '요식업 자영업자', desc: '식당, 카페 운영자' }
]
const extraOptions = ['학생', '주부', '자취생생', '기타']
const selectOpen = ref(false)
const showBox = ref(true)
const progressAnimate = ref(false)

function goHome() {
  router.push('/')
}
function onPrev() {
  progressAnimate.value = true
  showBox.value = false
  setTimeout(() => {
    router.push('/login')
  }, 350)
}
function validate() {
  errors.value.name = !form.value.name
  errors.value.email = !form.value.email
  errors.value.nickname = !form.value.nickname
  errors.value.extra = !form.value.extra
  return !(errors.value.name || errors.value.email || errors.value.nickname || errors.value.extra)
}
function onNext() {
  if (!validate()) return
  progressAnimate.value = true
  showBox.value = false
  setTimeout(() => {
    if (form.value.role === 'cook') {
      router.push('/auth-detail-cook')
    } else if (form.value.role === 'owner') {
      router.push('/auth-detail-owner')
    } else {
      router.push('/')
    }
  }, 350)
}
function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => {
      form.value.profileUrl = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}
function handleSelectOpen() {
  selectOpen.value = true
}
function handleSelectClose() {
  selectOpen.value = false
}
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
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';
.add-info-page {
  min-height: 100vh;
  background: #F5F1E8;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'NotoSansKR', 'Noto Sans', sans-serif;
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
  min-width: 350px;
  max-width: 500px;
  margin: 0 auto 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  max-height: 700px;
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
.profile-upload {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.profile-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f3f3f3;
  border: 1.5px solid #e9ecef;
  cursor: pointer;
  overflow: hidden;
}
.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.profile-placeholder {
  font-size: 2rem;
  color: #bdbdbd;
}
.role-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}
.role-radio {
  display: flex;
  align-items: center;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  background: var(--color-background);
  padding: 14px 16px;
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
  margin-bottom: 2px;
}
.role-radio.selected {
  border: 1.5px solid var(--color-primary);
  background: #fff5ea;
}
.role-radio input[type="radio"] {
  margin-right: 18px;
  accent-color: var(--color-primary);
  width: 22px;
  height: 22px;
}
.role-title {
  font-weight: bold;
  color: var(--color-text);
  font-size: 1.08rem;
}
.role-desc {
  color: #bdbdbd;
  font-size: 0.98rem;
}
.form-actions {
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
/* Custom select arrow */
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
/* Slide animation for box */
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