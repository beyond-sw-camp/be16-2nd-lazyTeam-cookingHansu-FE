<template>
  <div class="add-info-page">
    <div class="top-bar">
      <span class="back-link" @click="goHome">&lt; 홈으로 돌아가기</span>
    </div>
    <ProgressStep :step="3" />
    <transition name="box-slide" mode="out-in">
      <div class="add-info-box" v-if="showBox" key="add-info-box">
        <div class="form-title">요리한수</div>
        <div class="form-subtitle">추가 인증</div>
        <form class="form-content" @submit.prevent="onSubmit">
          <div class="section-title">요식업 자영업자 인증</div>
          <!-- 요식업 종류 -->
          <label class="form-label">요식업 종류 <span class="required">*</span></label>
          <div class="select-wrapper">
            <select class="form-input" v-model="form.type" required>
              <option disabled value="">요식업 종류를 선택하세요</option>
              <option v-for="opt in typeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="select-arrow" :class="{ open: selectOpen }">
              <svg width="18" height="18" viewBox="0 0 20 20"><path d="M5 8l5 5 5-5" stroke="#bdbdbd" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
            </span>
          </div>
          <!-- 사업자 등록증 -->
          <label class="form-label">사업자 등록증 <span class="required">*</span></label>
          <div class="file-upload">
            <input type="file" accept="image/*,.pdf" @change="onBizFileChange" id="bizFile" style="display:none;" />
            <label for="bizFile" class="file-label">
              <span v-if="form.bizFileName">{{ form.bizFileName }}</span>
              <span v-else class="file-placeholder">
                <svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:6px;"><path d="M10 3v10m0 0l-3-3m3 3l3-3" stroke="#bdbdbd" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
                사업자 등록증을 선택하세요
              </span>
            </label>
          </div>
          <!-- 사업자 등록번호 -->
          <label class="form-label">사업자 등록번호 <span class="required">*</span></label>
          <input class="form-input" v-model="form.bizNum" placeholder="사업자 등록번호를 입력하세요" />
          <!-- 가게 이름 -->
          <label class="form-label">가게 이름 <span class="required">*</span></label>
          <input class="form-input" v-model="form.shopName" placeholder="가게 이름을 입력하세요" />
          <!-- 가게 주소 -->
          <!-- <label class="form-label">가게 주소 <span class="required">*</span></label>
          <input class="form-input" v-model="form.shopAddr" placeholder="가게 주소를 입력하세요" /> -->
          <Address />
          <div class="form-actions">
            <button type="button" class="btn prev" @click="onPrev">이전</button>
            <button type="submit" class="btn next">가입 완료</button>
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
import Address from '@/components/login/Address.vue'

const router = useRouter()
const showBox = ref(true)
const selectOpen = ref(false)
const typeOptions = ['한식', '일식', '중식', '양식', '기타']
const form = ref({
  type: '',
  bizFile: null,
  bizFileName: '',
  bizNum: '',
  shopName: '',
  shopAddr: ''
})
function goHome() { router.push('/') }
function onPrev() { router.push('/add-info') }
function onSubmit() { router.push('/signup-complete') }
function onBizFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.bizFile = file
    form.value.bizFileName = file.name
  }
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
  margin: 0 auto 20px auto;
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
.section-title {
  color: var(--color-text);
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 10px;
  margin-top: 2px;
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
.input-error {
  color: #e53935;
  font-size: 0.97rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
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