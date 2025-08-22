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
                <span v-if="unreadCount && unreadCount > 0" class="badge">{{ unreadCount }}</span>
              </button>

            </div>
            <div class="cart-wrapper">
              <button class="cart-btn" @click="goToCart">
                <span class="icon-cart">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </span>
                <span v-if="cartStore.cartCount > 0" class="cart-badge">{{ cartStore.cartCount }}</span>
              </button>
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
                <span v-if="unreadCount && unreadCount > 0" class="badge">{{ unreadCount }}</span>
              </button>

            </div>
            <div class="cart-wrapper">
              <button class="cart-btn" @click="goToCart">
                <span class="icon-cart">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </span>
                <span v-if="cartStore.cartCount > 0" class="cart-badge">{{ cartStore.cartCount }}</span>
              </button>
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
          <a href="/cart" class="mobile-menu-item" @click="closeMobileMenu">장바구니 ({{ cartStore.cartCount }})</a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart/cart.js'
import { useNotificationStore } from '@/store/notification/notification.js'
import { useNotifications } from '@/composables/useNotifications.js'

const router = useRouter()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const { isConnected } = useNotifications()

// unreadCount를 computed로 참조
const unreadCount = computed(() => notificationStore.unreadCount)

// unreadCount 변화 감지
watch(unreadCount, (newValue, oldValue) => {
  
}, { immediate: true })

const isLoggedIn = ref(true) // 임시: 실제 로그인 상태와 연동 필요 (테스트용으로 true 설정)
const nickname = ref('김요리') // 임시: 실제 닉네임 연동 필요
const hoverMenu = ref('')
const showNotification = ref(false)
const isMobile = ref(false)
const showMobileMenu = ref(false)

const menuItems = [
  { text: '공지사항', route: '/notice' },
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
  // 알림 페이지로 이동
  router.push('/notifications')
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
function goToCart() {
  router.push('/cart')
  closeMobileMenu()
}
onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // 실시간 알림 연결은 useNotifications에서 자동 처리
  console.log('Header 컴포넌트 마운트 완료')
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

.cart-wrapper {
  position: relative;
}
.cart-btn {
  background: none;
  border: none;
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}
.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ff7a00;
  color: #fff;
  border-radius: 50%;
  font-size: 0.8rem;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
  font-weight: bold;
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