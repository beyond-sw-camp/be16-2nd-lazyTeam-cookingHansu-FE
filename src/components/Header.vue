<template>
  <header class="user-header" :class="{ fixed: true }">
    <div class="header-inner">
      <!-- 좌측: 로고 -->
      <div class="logo" @click="goHome">요리한수</div>
      <!-- 중간: 메뉴바 -->
      <nav class="menu-bar" v-if="!isMobile">
        <a v-for="item in menuItems" :key="item.text" :href="item.route" class="menu-item" @mouseover="hoverMenu = item.text" @mouseleave="hoverMenu = ''" :class="{ active: hoverMenu === item.text }">
          {{ item.text }}
        </a>
      </nav>
      <!-- 우측: 로그인/로그아웃 버튼, 알림 버튼, 모바일 창 크기는 메뉴바 버튼 -->
      <div class="header-actions">
        <!-- 모바일 창 크기일 때 -->
        <template v-if="isMobile">
          <!-- 로그인 상태 -->
          <template v-if="isLoggedIn">
            <div class="notification-wrapper">
              <button class="notification-btn" @click="toggleNotification">
                <span class="icon-bell">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </span>
                <span v-if="notifications.length" class="badge">{{ notifications.length }}</span>
              </button>
              <transition name="fade-slide">
                <div v-if="showNotification" class="notification-modal">
                  <div class="modal-header">알림</div>
                  <ul>
                    <li v-for="(msg, idx) in notifications" :key="idx">
                      <img :src="msg.avatar" class="notification-avatar" alt="profile" />
                      <div class="notification-content">
                        <span class="notification-sender">{{ msg.sender }}</span>
                        <span class="notification-message">{{ msg.message }}</span>
                      </div>
                    </li>
                    <li v-if="!notifications.length" style="justify-content:center;">수신된 메시지가 없습니다.</li>
                  </ul>
                </div>
              </transition>
            </div>
            <button class="logout-btn" @click="logout">로그아웃</button>
          </template>
          <!-- 로그아웃 상태 -->
          <template v-else>
            <button class="login-btn" @click="login">로그인</button>
          </template>
          <button class="menu-icon" @click="toggleMobileMenu">
            <svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </template>
        <!-- 데스크탑 창 크기일 때때 -->
        <template v-else>
          <!-- 로그아웃 상태 -->
          <template v-if="!isLoggedIn">
            <button class="login-btn" @click="login">로그인</button>
          </template>
          <!-- 로그인 상태 -->
          <template v-else>
            <div class="notification-wrapper">
              <button class="notification-btn" @click="toggleNotification">
                <span class="icon-bell">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </span>
                <span v-if="notifications.length" class="badge">{{ notifications.length }}</span>
              </button>
              <!-- 알림 정보 모달창 -->
              <transition name="fade-slide">
                <div v-if="showNotification" class="notification-modal">
                  <div class="modal-header">알림</div>
                  <ul>
                    <li v-for="(msg, idx) in notifications" :key="idx">
                      <img :src="msg.avatar" class="notification-avatar" alt="profile" />
                      <div class="notification-content">
                        <span class="notification-sender">{{ msg.sender }}</span>
                        <span class="notification-message">{{ msg.message }}</span>
                      </div>
                    </li>
                    <li v-if="!notifications.length" style="justify-content:center;">수신된 메시지가 없습니다.</li>
                  </ul>
                </div>
              </transition>
            </div>
            <span class="welcome">{{ nickname }}님 반갑습니다!</span>
            <button class="logout-btn" @click="logout">로그아웃</button>
          </template>
        </template>
      </div>
    </div>
    <transition name="slide-down">
      <div v-if="isMobile && showMobileMenu" class="mobile-menu">
        <nav class="mobile-menu-bar">
          <a v-for="item in menuItems" :key="item.text" :href="item.route" class="mobile-menu-item" @click="closeMobileMenu">{{ item.text }}</a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false) // 임시: 실제 로그인 상태와 연동 필요
const nickname = ref('김요리') // 임시: 실제 닉네임 연동 필요
const hoverMenu = ref('')
const showNotification = ref(false)
const notifications = ref([
  {
    sender: '홍길동',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    message: '새로운 1:1 채팅 메시지가 도착했습니다. 오늘 저녁에 시간 되시나요?'
  },
  {
    sender: '김요리',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    message: '강의가 승인되었습니다.'
  },
  {
    sender: '이수진',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    message: '레시피에 댓글이 달렸습니다. 정말 맛있어 보여요!'
  }
]) // 임시 데이터
const isMobile = ref(false)
const showMobileMenu = ref(false)

const menuItems = [
  { text: '레시피 공유 게시글', route: '/recipes' },
  { text: '판매중인 강의', route: '/lectures' },
  { text: '1:1채팅', route: '/chat' },
  { text: '마이페이지', route: '/mypage' }
]

function goHome() {
  router.push('/')
}
function login() {
  router.push('/login')
  closeMobileMenu()
}
function logout() {
  isLoggedIn.value = false
  closeMobileMenu()
}
function toggleNotification() {
  showNotification.value = !showNotification.value
}
function handleResize() {
  isMobile.value = window.innerWidth <= 900
  if (!isMobile.value) showMobileMenu.value = false
}
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}
function closeMobileMenu() {
  showMobileMenu.value = false
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.user-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background: var(--color-white);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  z-index: 1000;
  font-family: 'Noto Sans', sans-serif;
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
}
.logo {
  color: var(--color-primary);
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  text-align: left;
}
.menu-bar {
  display: flex;
  gap: 40px;
}
.menu-item {
  color: var(--color-text);
  font-size: 1.1rem;
  text-decoration: none;
  padding: 8px 0;
  position: relative;
  transition: color 0.2s;
}
.menu-item.active,
.menu-item:hover {
  color: var(--color-primary);
}
.menu-item.active::after,
.menu-item:hover::after {
  content: '';
  display: block;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.login-btn, .logout-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.login-btn:hover, .logout-btn:hover {
  background: #ff884d;
}
.welcome {
  color: var(--color-text);
  font-size: 1rem;
  margin: 0 8px;
}
.notification-wrapper {
  position: relative;
}
.notification-btn {
  background: none;
  border: none;
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #e53935;
  color: #fff;
  border-radius: 50%;
  font-size: 0.8rem;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}
.notification-modal {
  position: absolute;
  right: 0;
  top: 36px;
  width: 320px;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.13);
  border-radius: 12px;
  padding: 12px 0 8px 0;
  z-index: 2000;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.25s, transform 0.25s;
}
.notification-modal .modal-header {
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0 20px 10px 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
}
.notification-modal ul {
  list-style: none;
  margin: 0;
  padding: 0 8px;
}
.notification-modal li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.98rem;
  color: var(--color-text);
  padding: 10px 8px 10px 8px;
  border-bottom: 1px solid #f3f3f3;
  min-height: 48px;
}
.notification-modal li:last-child {
  border-bottom: none;
}
.notification-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background: #f3f3f3;
  flex-shrink: 0;
  border: 1.5px solid #eee;
}
.notification-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.notification-sender {
  font-weight: 600;
  font-size: 1.02rem;
  color: var(--color-primary);
  margin-bottom: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.notification-message {
  font-size: 0.97rem;
  color: var(--color-text);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 180px;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.menu-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}
@media (max-width: 1000px) {
  .header-inner {
    padding: 0 12px;
    gap: 12px;
  }
  .menu-bar {
    gap: 18px;
  }
  .logo {
    font-size: 1.3rem;
  }
}
@media (max-width: 900px) {
  .header-inner {
    justify-content: center;
    padding: 0 8px;
    gap: 0;
  }
  .logo {
    flex: none;
    text-align: center;
    margin: 0 auto;
    position: absolute;
    left: 0; right: 0;
    top: 0; bottom: 0;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header-actions {
    position: absolute;
    right: 12px;
    top: 16px;
    gap: 0;
  }
  .menu-bar {
    display: none;
  }
  .header-actions {
    gap: 10px;
  }
  .logout-btn, .login-btn {
    padding: 6px 12px;
    font-size: 0.98rem;
  }
}
.slide-down-enter-active, .slide-down-leave-active {
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1);
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to, .slide-down-leave-from {
  max-height: 300px;
  opacity: 1;
}
.mobile-menu {
  background: var(--color-white);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-radius: 0 0 16px 16px;
  position: absolute;
  left: 0;
  right: 0;
  top: 64px;
  z-index: 1500;
  padding: 16px 0 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mobile-menu-bar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  align-items: center;
}
.mobile-menu-item {
  color: var(--color-text);
  font-size: 1.1rem;
  text-decoration: none;
  padding: 8px 0;
  width: 100%;
  text-align: center;
  transition: color 0.2s;
}
.mobile-menu-item:active,
.mobile-menu-item:hover {
  color: var(--color-primary);
}
.mobile-user-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style> 