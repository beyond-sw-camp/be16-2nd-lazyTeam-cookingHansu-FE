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
        <router-link to="/notice" class="nav-link">공지사항</router-link>
        <router-link to="/recipes" class="nav-link">레시피 공유 게시글</router-link>
        <router-link to="/lectures" class="nav-link">판매중인 강의</router-link>
        <!-- 관리자가 아닐 때만 표시할 메뉴 -->
        <router-link v-if="!isAdmin" to="/chat" class="nav-link">1:1채팅</router-link>
        <!-- 관리자일 때는 관리자페이지, 일반 사용자일 때는 마이페이지 -->
        <router-link 
          v-if="isAdmin" 
          to="/admin" 
          class="nav-link"
        >
          관리자페이지
        </router-link>
        <router-link 
          v-else 
          to="/mypage" 
          class="nav-link"
        >
          마이페이지
        </router-link>
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
            <v-img 
              v-if="profileInfo.profileImageUrl" 
              :src="profileInfo.profileImageUrl" 
              alt="프로필 이미지"
            ></v-img>
            <v-icon v-else size="20" color="grey">mdi-account</v-icon>
          </v-avatar>
          
          <!-- 알림 버튼 (관리자가 아닐 때만 표시) -->
          <v-btn
            v-if="!isAdmin"
            icon
            variant="text"
            class="notification-btn"
            @click="goToNotifications"
          >
            <v-badge
              :content="unreadCount"
              :model-value="unreadCount > 0"
              color="error"
              location="top end"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>

          <!-- 장바구니 버튼 (관리자가 아닐 때만 표시) -->
          <v-btn
            v-if="!isAdmin"
            icon
            variant="text"
            class="cart-btn"
            @click="goToCart"
          >
            <v-badge
              :content="cartCount"
              :model-value="cartCount > 0"
              color="warning"
              location="top end"
            >
              <v-icon>mdi-cart</v-icon>
            </v-badge>
          </v-btn>
          
          <span class="welcome-text">{{ userNickname }}님 환영합니다!</span>

          <v-btn
            variant="outlined"
            color="grey"
            rounded="lg"
            @click="logout"
            class="logout-btn"
            :class="{ 'admin-logout-btn': isAdmin }"
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
          <!-- 모바일 알림 버튼 (관리자가 아닐 때만 표시) -->
          <v-btn
            v-if="!isAdmin"
            icon
            variant="text"
            size="small"
            class="mobile-notification-btn"
            @click="goToNotifications"
          >
            <v-badge
              :content="unreadCount"
              :model-value="unreadCount > 0"
              color="error"
              location="top end"
            >
              <v-icon size="20">mdi-bell</v-icon>
            </v-badge>
          </v-btn>

          <!-- 모바일 장바구니 버튼 (관리자가 아닐 때만 표시) -->
          <v-btn
            v-if="!isAdmin"
            icon
            variant="text"
            size="small"
            class="mobile-cart-btn"
            @click="goToCart"
          >
            <v-badge
              :content="cartCount"
              :model-value="cartCount > 0"
              color="warning"
              location="top end"
            >
              <v-icon size="20">mdi-cart</v-icon>
            </v-badge>
          </v-btn>

          <v-avatar size="32" class="profile-avatar">
            <v-img 
              v-if="userProfileImage && userProfileImage !== '/default-avatar.png'" 
              :src="userProfileImage" 
              alt="프로필 이미지"
            ></v-img>
            <v-icon v-else size="20" color="grey">mdi-account</v-icon>
          </v-avatar>
          <v-btn
            variant="outlined"
            color="grey"
            rounded="lg"
            size="small"
            @click="logout"
            class="mobile-logout-btn"
            :class="{ 'admin-logout-btn': isAdmin }"
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
      <!-- 모바일 메뉴에 장바구니 추가 (관리자가 아닐 때만 표시) -->
      <v-list-item
        v-if="!isAdmin"
        to="/cart"
        @click="mobileMenuOpen = false"
        class="cart-menu-item"
      >
        <v-list-item-title>
          장바구니
          <v-badge
            :content="cartCount"
            :model-value="cartCount > 0"
            color="warning"
            location="top end"
            class="cart-menu-badge"
          >
          </v-badge>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'
import { useCartStore } from '@/store/cart/cart.js'
import { useNotificationStore } from '@/store/notification/notification.js'
import { useAdminLoginStore } from '@/store/admin/adminLogin'

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const adminLoginStore = useAdminLoginStore();

// Reactive data
const mobileMenuOpen = ref(false);
// 모바일 메뉴 아이템 (역할에 따라 동적으로 생성)
const mobileMenuItems = computed(() => {
  const baseItems = [
    { title: '공지사항', path: '/notice' },
    { title: '레시피 공유 게시글', path: '/recipes' },
    { title: '판매중인 강의', path: '/lectures' }
  ];
  
  // 관리자가 아닐 때만 표시할 메뉴
  if (!isAdmin.value) {
    baseItems.push({ title: '1:1채팅', path: '/chat' });
  }
  
  // 관리자일 때는 관리자페이지, 일반 사용자일 때는 마이페이지
  if (isAdmin.value) {
    baseItems.push({ title: '관리자페이지', path: '/admin' });
  } else {
    baseItems.push({ title: '마이페이지', path: '/mypage' });
  }
  
  return baseItems;
})

// 화면 크기 감지 함수
const handleResize = () => {
  // 데스크톱 크기(960px 이상)로 변경되면 모바일 메뉴 닫기
  if (window.innerWidth >= 960 && mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
}

// Reactive data for profile
const profileData = ref({
  nickname: '',
  profileImageUrl: ''
})

// Computed properties
const isLoggedIn = computed(() => {
  return authStore.getIsAuthenticated;
})

// 사용자 역할 확인
const userRole = computed(() => {
  return authStore.getUserRole;
})

// 관리자 여부 확인 (두 스토어 모두 확인)
const isAdmin = computed(() => {
  return userRole.value === 'ADMIN' || adminLoginStore.isLoggedIn;
})

// 프로필 정보 가져오기
const fetchProfileInfo = async () => {
  if (isLoggedIn.value) {
    try {
      // 관리자인 경우 adminLoginStore의 정보 사용
      if (isAdmin.value) {
        const adminUser = adminLoginStore.admin;
        profileData.value = {
          nickname: adminUser?.adminName || '관리자',
          profileImageUrl: '' // 관리자는 기본적으로 프로필 이미지 없음
        };
      } else {
        // 일반 사용자인 경우 기존 로직 사용
        if (authStore.accessToken) {
          const profileInfo = await authStore.fetchProfileInfo();
          if (profileInfo) {
            profileData.value = {
              nickname: profileInfo.nickname || '사용자',
              profileImageUrl: profileInfo.profileImageUrl || ''
            };
          } else {
            // 프로필 정보가 없는 경우 기본값 설정
            profileData.value = {
              nickname: '사용자',
              profileImageUrl: ''
            };
          }
        }
      }
    } catch (error) {
      console.error('프로필 정보 가져오기 실패:', error);
      // 에러 발생 시 기본값 설정
      profileData.value = {
        nickname: isAdmin.value ? '관리자' : '사용자',
        profileImageUrl: ''
      };
    }
  }
}

// 모바일 메뉴 상태 감시하여 스크롤 제어
watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    // 메뉴가 열릴 때 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    // 메뉴가 닫힐 때 스크롤 복원
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
})

// 로그인 상태 변경 감시하여 프로필 정보 가져오기
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await fetchProfileInfo();
  } else {
    // 로그아웃 시 프로필 정보 초기화
    profileData.value = {
      nickname: '',
      profileImageUrl: ''
    };
  }
})

// 관리자 로그인 상태도 감시
watch(() => adminLoginStore.isLoggedIn, async (newValue) => {
  if (newValue) {
    await fetchProfileInfo();
  }
})

// 사용자 역할 변경 감시
watch(userRole, async (newRole) => {
  if (isLoggedIn.value) {
    await fetchProfileInfo();
  }
})

// 컴포넌트 마운트 시 리사이즈 이벤트 리스너 추가 및 프로필 정보 가져오기
onMounted(async () => {
  window.addEventListener('resize', handleResize);
  
  // 로그인된 상태라면 프로필 정보 가져오기
  if (isLoggedIn.value || adminLoginStore.isLoggedIn) {
    await fetchProfileInfo();
  }
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거 및 스크롤 복원
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
})

const userNickname = computed(() => {
  return profileData.value.nickname || (isAdmin.value ? '관리자' : '사용자');
})

const userProfileImage = computed(() => {
  return profileData.value.profileImageUrl || '';
})

const profileInfo = computed(() => {
  return profileData.value;
})

// 장바구니 개수
const cartCount = computed(() => {
  return cartStore.cartCount;
})

// 읽지 않은 알림 개수
const unreadCount = computed(() => {
  return notificationStore.unreadCount;
})

// Methods
const goToLogin = () => {
  router.push('/login');
}

const logout = async () => {
  try {
    if (isAdmin.value) {
      await adminLoginStore.logout();
    } else {
      await authStore.logout();
    }
    // 루트 페이지로 이동 (로그아웃 후 비로그인 상태이므로 landing 페이지로 리다이렉트됨)
    router.push('/');
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
}

const goToNotifications = () => {
  router.push('/notifications');
}

const goToCart = () => {
  router.push('/cart');
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  min-height: 80px;
}

.logo-link {
  text-decoration: none;
  flex-shrink: 0;
  min-width: 120px;
}

.logo-text {
  color: var(--color-primary);
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 47.5%;
  transform: translateX(-50%);
  gap: 32px;
  margin: 0 24px;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  white-space: nowrap;
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
  flex-shrink: 0;
  min-width: 300px;
}

.login-btn {
  font-weight: 500;
}

.user-section {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
}

.profile-avatar {
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
}

.notification-btn {
  position: relative;
  flex-shrink: 0;
}

.cart-btn {
  position: relative;
  flex-shrink: 0;
  margin-left: -12px;
}

.welcome-text {
  color: var(--color-text);
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 12px;
}

.logout-btn {
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.admin-logout-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.admin-logout-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

/* 반응형 데스크탑 스타일 */
@media (max-width: 1200px) {
  .header-desktop {
    padding: 0 16px;
  }
  
  .nav-menu {
    gap: 24px;
    margin: 0 16px;
  }
  
  .welcome-text {
    font-size: 13px;
  }
}

@media (max-width: 1150px) {
  .welcome-text {
    display: none;
  }
  
  .user-section {
    min-width: 250px;
  }
  
  .header-right {
    min-width: 250px;
  }
}

@media (max-width: 1024px) {
  .nav-menu {
    gap: 20px;
    margin: 0 12px;
  }
  
  .user-section {
    min-width: 220px;
  }
  
  .header-right {
    min-width: 220px;
  }
}

@media (max-width: 960px) {
  .header-desktop {
    display: none;
  }
}

.admin-logout-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.admin-logout-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Mobile Styles */
.header-mobile {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  min-height: 72px;
  position: relative;
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-logo-center .logo-text {
  font-size: 20px;
}

.mobile-user-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.mobile-notification-btn {
  position: relative;
  flex-shrink: 0;
}

.mobile-cart-btn {
  position: relative;
  flex-shrink: 0;
  margin-left: -12px;
}

.hamburger-btn {
  color: var(--color-text);
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  color: var(--color-primary);
}

.mobile-login-btn,
.mobile-logout-btn {
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 12px;
}

.mobile-logout-btn.admin-logout-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.mobile-logout-btn.admin-logout-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

/* 반응형 모바일 스타일 */
@media (max-width: 600px) {
  .header-mobile {
    padding: 0 12px;
  }
  
  .mobile-logo-center .logo-text {
    font-size: 18px;
  }
  
  .mobile-user-section {
    gap: 8px;
  }
  
  .mobile-notification-btn,
  .mobile-cart-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-mobile {
    padding: 0 8px;
  }
  
  .mobile-logo-center .logo-text {
    font-size: 16px;
  }
  
  .mobile-user-section {
    gap: 6px;
  }
  
  .welcome-text {
    display: none;
  }
}

.mobile-logout-btn.admin-logout-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.mobile-logout-btn.admin-logout-btn:hover {
  background-color: var(--color-primary);
  color: white;
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

.cart-menu-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.cart-menu-item:hover {
  background-color: #f8f9fa;
}

.cart-menu-item .v-list-item-title {
  color: var(--color-text);
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-menu-badge {
  margin-left: auto;
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
