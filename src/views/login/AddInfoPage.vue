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
          <div class="user-info-display" v-if="userInfo">
            <div class="profile-section">
              <img :src="userInfo.profileImage" alt="프로필" class="profile-image" />
              <div class="user-details">
                <div class="user-name">{{ userInfo.name }}</div>
                <div class="user-email">{{ userInfo.email }}</div>
              </div>
            </div>
          </div>
          <label class="form-label">닉네임 <span class="required">*</span></label>
          <input class="form-input" :class="{ error: errors.nickname }" v-model="form.nickname" placeholder="닉네임을 입력하세요" />
          <div v-if="errors.nickname" class="input-error"><span class="error-icon">&#10006;</span> 닉네임을 입력해 주세요!</div>
          <label class="form-label">역할 선택 <span class="required">*</span></label>
          <div class="role-group">
              <div
                v-for="role in roles"
                :key="role.value"
                class="role-radio"
                :class="{ selected: form.role === role.value }"
                @click="form.role = role.value"
              >
                <div class="role-input">
                  <span class="radio-circle">
                    <span v-if="form.role === role.value" class="radio-dot"></span>
                  </span>
                </div>
                <div class="role-text">
                  <div class="role-title">{{ role.label }}</div>
                  <div class="role-desc">{{ role.desc }}</div>
                </div>
              </div>
            </div>
        </form>
        <div class="form-actions">
            <button type="button" class="btn prev" @click="onPrev" @mousedown="btnActive('prev')" @mouseup="btnInactive('prev')" @mouseleave="btnInactive('prev')">이전</button>
            <button type="button" class="btn next" @click="onNext" @mousedown="btnActive('next')" @mouseup="btnInactive('next')" @mouseleave="btnInactive('next')">다음</button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import ProgressStep from '@/components/ProgressStep.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  nickname: '',
  role: 'user'
})
const errors = ref({ nickname: false })
const userInfo = ref(null)

const roles = [
  { value: 'user', label: '일반 사용자', desc: '레시피 공유 및 강의 수강' },
  { value: 'cook', label: '요식업 종사자', desc: '요리사, 요리연구가' },
  { value: 'owner', label: '요식업 자영업자', desc: '식당, 카페 운영자' }
]
const showBox = ref(true)
const progressAnimate = ref(false)

onMounted(() => {
  // Pinia store에서 사용자 정보 가져오기
  const currentUser = authStore.user
  if (currentUser) {
    userInfo.value = {
      name: currentUser.name,
      email: currentUser.email,
      profileImage: currentUser.profileImage
    }
    // 기본 닉네임으로 이름 설정
    form.value.nickname = currentUser.name || ''
  }
})

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
  errors.value.nickname = !form.value.nickname
  return !errors.value.nickname
}

function onNext() {
  if (!validate()) return
  progressAnimate.value = true
  showBox.value = false
  setTimeout(() => {
    if (form.value.role === 'user') {
      router.push('/auth-detail-user')
    } else if (form.value.role === 'cook') {
      router.push('/auth-detail-cook')
    } else if (form.value.role === 'owner') {
      router.push('/auth-detail-owner')
    } else {
      router.push('/')
    }
  }, 350)
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
  height: 100vh;
  background: #F5F1E8;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  padding: 32px 32px 32px 32px;
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
  margin-bottom: 5px;
  text-align: center;
}
.form-subtitle {
  color: var(--color-text);
  font-size: 1rem;
  margin-bottom: 28px;
  text-align: center;
}
.user-info-display {
  width: 100%;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
.profile-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.user-details {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.1rem;
}
.user-email {
  color: #6c757d;
  font-size: 0.9rem;
}
.form-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}
.required {
  color: #ff884d;
  font-size: 1.1em;
  margin-left: 2px;
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
.form-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
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