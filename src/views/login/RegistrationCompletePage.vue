<template>
    <div class="registration-complete-page">
      <div class="icon-wrapper">
        <!-- 축포 아이콘: SVG 또는 이미지 삽입 -->
        <img src="../../assets/icons/celebration.png" class="celebration-icon" />
      </div>
      <h1 class="message">등록을 완료했습니다!</h1>
      <button class="btn home-btn" @click="goHome">메인 페이지로 이동</button>
    </div>
</template>
  
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
    router.push('/')
}
</script>

<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';

.registration-complete-page {
height: 100vh;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
background: #F5F1E8;
text-align: center;
}
.icon-wrapper {
margin-bottom: 24px;
}
.celebration-icon {
    width: 100px;
    height: 100px;
    display: block;
}
h1.message {
font-family: 'NotoSansKR', sans-serif;
font-size: 1.8rem;
font-weight: bold;
color: var(--color-primary);
margin-bottom: 32px;
}
.btn.home-btn {
padding: 12px 24px;
font-size: 1rem;
font-weight: 500;
background: var(--color-primary);
color: var(--color-white);
border: none;
border-radius: 8px;
cursor: pointer;
transition: filter 0.2s;
}
.btn.home-btn:hover {
filter: brightness(0.9);
}
</style>
  