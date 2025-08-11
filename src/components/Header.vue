<template>
  <v-app-bar
    app
    elevation="0"
    color="white"
    class="header-container"
    fixed
    prominent
  >
    <!-- Desktop Layout -->
    <div class="d-none d-md-flex header-desktop">
      <!-- Logo -->
      <router-link to="/" class="logo-link">
        <h1 class="logo-text">요리한수</h1>
      </router-link>

      <!-- Navigation Menu -->
      <div class="nav-menu">
        <router-link to="/recipes" class="nav-link">레시피 공유 게시글</router-link>
        <router-link to="/lectures" class="nav-link">판매중인 강의</router-link>
        <router-link to="/chat" class="nav-link">1:1채팅</router-link>
        <router-link to="/notice" class="nav-link">공지사항</router-link>
        <router-link to="/mypage" class="nav-link">마이페이지</router-link>
      </div>

      <!-- Right Section -->
      <div class="header-right">
        <!-- Logged Out State -->
        <div v-if="!isLoggedIn" class="login-section">
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            @click="goToLogin"
            class="login-btn"
          >
            로그인
          </v-btn>
        </div>

        <!-- Logged In State -->
        <div v-else class="user-section">
          <v-avatar size="32" class="profile-avatar">
            <v-img :src="profileInfo.profileImageUrl" alt="프로필 이미지"></v-img>
          </v-avatar>
          
          <v-btn
            icon
            variant="text"
            class="notification-btn"
            @click="showNotifications"
          >
            <v-badge
              :content="notificationCount"
              :model-value="notificationCount > 0"
              color="error"
              location="top end"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>

          <span class="welcome-text">{{ profileInfo.nickname }}님 환영합니다!</span>

          <v-btn
            variant="outlined"
            color="grey"
            rounded="lg"
            @click="logout"
            class="logout-btn"
          >
            로그아웃
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="d-flex d-md-none header-mobile">
      <!-- Logged Out State -->
      <div v-if="!isLoggedIn" class="mobile-logged-out">
        <v-btn
          icon
          variant="text"
          @click="toggleMobileMenu"
          class="hamburger-btn"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        
        <div class="mobile-logo-center">
          <router-link to="/" class="logo-link">
            <h1 class="logo-text">요리한수</h1>
          </router-link>
        </div>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          @click="goToLogin"
          class="mobile-login-btn"
        >
          로그인
        </v-btn>
      </div>

      <!-- Logged In State -->
      <div v-else class="mobile-logged-in">
        <v-btn
          icon
          variant="text"
          @click="toggleMobileMenu"
          class="hamburger-btn"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <div class="mobile-logo-center">
          <router-link to="/" class="logo-link">
            <h1 class="logo-text">요리한수</h1>
          </router-link>
        </div>

        <div class="mobile-user-section">
          <v-avatar size="32" class="profile-avatar">
            <v-img :src="userProfileImage" alt="프로필 이미지"></v-img>
          </v-avatar>
          <v-btn
            variant="outlined"
            color="grey"
            rounded="lg"
            size="small"
            @click="logout"
            class="mobile-logout-btn"
          >
            로그아웃
          </v-btn>
        </div>
      </div>
    </div>

  </v-app-bar>

  <!-- Mobile Navigation Drawer - v-app-bar 외부로 이동 -->
  <v-navigation-drawer
    v-model="mobileMenuOpen"
    location="left"
    temporary
    class="mobile-nav-drawer"
    overlay
  >
    <v-list>
      <v-list-item
        v-for="item in mobileMenuItems"
        :key="item.path"
        :to="item.path"
        @click="mobileMenuOpen = false"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const mobileMenuOpen = ref(false)
const mobileMenuItems = ref([
  { title: '레시피 공유 게시글', path: '/recipes' },
  { title: '판매중인 강의', path: '/lectures' },
  { title: '1:1채팅', path: '/chat' },
  { title: '공지사항', path: '/notice' },
  { title: '마이페이지', path: '/mypage' }
])

// 화면 크기 감지 함수
const handleResize = () => {
  // 데스크톱 크기(960px 이상)로 변경되면 모바일 메뉴 닫기
  if (window.innerWidth >= 960 && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

// 모바일 메뉴 상태 감시하여 스크롤 제어
watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    // 메뉴가 열릴 때 스크롤 방지
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  } else {
    // 메뉴가 닫힐 때 스크롤 복원
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

// 컴포넌트 마운트 시 리사이즈 이벤트 리스너 추가
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거 및 스크롤 복원
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})

// Computed properties
const isLoggedIn = computed(() => {
  return authStore.getIsAuthenticated
})

const userNickname = computed(() => {
  return authStore.getUser?.nickname || '사용자'
})

const userProfileImage = computed(() => {
  return authStore.getUser?.profileImage || '/default-avatar.png'
})

const profileInfo = computed(() => {
  return authStore.getProfileInfo;
})

const notificationCount = computed(() => {
  // 실제 알림 개수 가져오기 로직으로 교체 필요
  return 3
})

// Methods
const goToLogin = () => {
  router.push('/login')
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

const showNotifications = () => {
  // 알림 표시 로직 구현 필요
  console.log('알림 표시')
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid #e0e0e0;
  z-index: 1000;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
}

/* 고정된 헤더 아래 콘텐츠 패딩 */
:deep(.v-main) {
  padding-top: 80px !important; /* prominent 모드에서 v-app-bar의 높이 */
}

@media (max-width: 960px) {
  :deep(.v-main) {
    padding-top: 72px !important; /* 모바일에서 prominent 모드 v-app-bar의 높이 */
  }
}

/* 추가 고정 설정 */
:deep(.v-application) {
  padding-top: 0 !important;
}

:deep(.v-main__wrap) {
  padding-top: 0 !important;
}

/* 전역 스타일로 헤더 고정 강화 */
:global(.v-application) {
  padding-top: 0 !important;
}

:global(.v-main) {
  padding-top: 80px !important;
}

@media (max-width: 960px) {
  :global(.v-main) {
    padding-top: 72px !important;
  }
}

/* Desktop Styles */
.header-desktop {
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.logo-link {
  text-decoration: none;
}

.logo-text {
  color: var(--color-primary);
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-btn {
  font-weight: 500;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  border: 2px solid var(--color-primary);
}

.notification-btn {
  position: relative;
}

.welcome-text {
  color: var(--color-text);
  font-size: 14px;
  white-space: nowrap;
}

.logout-btn {
  font-size: 12px;
  font-weight: 500;
}

/* Mobile Styles */
.header-mobile {
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.mobile-logged-out {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-logged-in {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-logo-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mobile-logo-center .logo-text {
  font-size: 20px;
}

.mobile-user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hamburger-btn {
  color: var(--color-text);
  transition: color 0.3s ease;
}

.hamburger-btn:hover {
  color: var(--color-primary);
}

.mobile-login-btn,
.mobile-logout-btn {
  font-size: 12px;
  font-weight: 500;
}

.mobile-nav-drawer {
  background-color: white;
  z-index: 1001;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 모바일 메뉴 오버레이 스타일 */
:deep(.v-overlay) {
  z-index: 1000;
}

.mobile-nav-drawer .v-list-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.mobile-nav-drawer .v-list-item:hover {
  background-color: #f8f9fa;
}

.mobile-nav-drawer .v-list-item-title {
  color: var(--color-text);
  font-size: 16px;
  font-weight: 500;
}

.mobile-nav-drawer .v-list-item.router-link-active {
  background-color: var(--color-primary);
  color: white;
}

.mobile-nav-drawer .v-list-item.router-link-active .v-list-item-title {
  color: white;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .header-mobile {
    padding: 0 12px;
  }
  
  .mobile-logo-center .logo-text {
    font-size: 18px;
  }
  
  .mobile-user-section {
    gap: 6px;
  }
}
</style>
