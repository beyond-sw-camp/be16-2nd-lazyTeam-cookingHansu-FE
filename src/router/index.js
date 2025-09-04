import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth';
import { useAdminLoginStore } from '@/store/admin/adminLogin';
import AdminLayout from '@/layouts/admin/AdminLayout.vue' 
import Dashboard from '@/views/admin/Dashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'
import UserApproval from '@/views/admin/UserApproval.vue'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import ReportManagement from '@/views/admin/reportManagement.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LandingPage from '@/views/landing/LandingPage.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import GoogleRedirect from '@/views/login/oauth/GoogleRedirect.vue'
import KakaoRedirect from '@/views/login/oauth/KakaoRedirect.vue'
import NaverRedirect from '@/views/login/oauth/NaverRedirect.vue'
import AddInfoPage from '@/views/login/AddInfoPage.vue'
import AdminLoginPage from '@/views/admin/AdminLoginPage.vue'
import AuthDetailCookPage from '@/views/login/AuthDetailCookPage.vue'
import AuthDetailOwnerPage from '@/views/login/AuthDetailOwnerPage.vue'
import AuthDetailUserPage from '@/views/login/AuthDetailUserPage.vue'
import RegistrationCompletePage from '@/views/login/RegistrationCompletePage.vue'
import DeletedUserConfirmPage from '@/views/login/DeletedUserConfirmPage.vue'
import WithdrawCompletePage from '@/views/WithdrawCompletePage.vue'
import InactiveUserPage from '@/views/InactiveUserPage.vue'
import RecipeMainPage from '@/views/home/RecipeMainPage.vue'
import RecipeDetailPage from '@/views/recipe/RecipeDetailPage.vue'

import RecipePostWritePage from '@/views/recipe/RecipePostWritePage.vue'
import RecipePostEditPage from '@/views/recipe/RecipePostEditPage.vue'
import LectureList from '@/views/home/LectureList.vue'
import LectureDetail from '@/views/lecture/LectureDetail.vue'
import LectureCreate from '@/views/lecture/LectureCreate.vue'
import LectureEdit from '@/views/lecture/LectureEdit.vue'
import CartPage from '@/views/cart/CartPage.vue'

import PaymentDetails from '@/views/payment/PaymentDetails.vue'
// toss sdk 결제 성공시 페이지 이동
import PaymentSuccess from '@/views/payment/PaymentSuccess.vue'
import PaymentFail from '@/views/payment/PaymentFail.vue'

import MyPage from "@/views/MyPage/MyPage.vue";

import chat from '@/views/chat/chatScreen.vue'
import NoticeList from '@/views/notice/NoticeList.vue'
import NoticeDetail from '@/views/notice/NoticeDetail.vue'
import NoticeCreate from '@/views/notice/NoticeCreate.vue'
import NoticeEdit from '@/views/notice/NoticeEdit.vue'
import NotificationPage from '@/views/notification/NotificationPage.vue'
import AccessDenied from '@/views/common/AccessDenied.vue'



const routes = [
  {
    path: "/admin-login",
    name: "AdminLogin",
    component: AdminLoginPage,
  },
  {
    path: "/access-denied",
    name: "AccessDenied",
    component: AccessDenied,
    meta: { requiresAuth: true },
  },
  {
    path: "/payment-details/:lectureId",
    name: "PaymentDetails",
    component: PaymentDetails,
    meta: { requiresAuth: true },
  },

  {
    path: "/admin",
    component: AdminLayout, // 관리자 공통 레이아웃
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' }, // 기본 경로 → 대시보드로 리디렉트
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'lecture-approval', name: '/LectureApproval', component: LectureApproval },
      { path: 'user-approval', name: 'UserApproval', component: UserApproval },
      { path: 'notice-management', name: 'NoticeManagement', component: NoticeManagement },
      { path: 'user-management', name: 'UserManagement', component: UserManagement },
      { path: "report-management", name: "ReportManagement", component: ReportManagement },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/oauth/google/redirect",
    name: "GoogleOAuthRedirect",
    component: GoogleRedirect,
  },
  {
    path: "/oauth/kakao/redirect",
    name: "KakaoOAuthRedirect",
    component: KakaoRedirect,
  },
  {
    path: "/oauth/naver/redirect",
    name: "NaverOAuthRedirect",
    component: NaverRedirect,
  },
  {
    path: "/add-info",
    name: "AddInfo",
    component: AddInfoPage,
    meta: { requiresAuth: true, requiresNewUser: true },
  },
  {
    path: '/detail-user', 
    name: 'AuthDetailUser', 
    component: AuthDetailUserPage, 
  },
  { 
    path: '/payment/PaymentSuccess', 
    name: 'PaymentSuccess', 
    component: PaymentSuccess 
  },
  {
    path: '/payment/PaymentFail', 
    name: 'PaymentFail', 
    component: PaymentFail 
  },
  {
    path: '/detail-cook',
    name: 'AuthDetailCook',
    component: AuthDetailCookPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/detail-owner",
    name: "AuthDetailOwner",
    component: AuthDetailOwnerPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/complete",
    name: "RegistrationComplete",
    component: RegistrationCompletePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/deleted-user-confirm/:userInfo",
    name: "DeletedUserConfirm",
    component: DeletedUserConfirmPage,
    meta: { 
      requiresGuest: true, // 인증되지 않은 상태에서만 접근 가능
      skipNotificationSubscription: true // 알림 구독 건너뛰기
    },
  },
  {
    path: "/withdraw-complete",
    name: "WithdrawComplete",
    component: WithdrawCompletePage,
  },
  {
    path: "/inactive-user",
    name: "InactiveUser",
    component: InactiveUserPage,
    meta: { 
      requiresGuest: true, // 인증되지 않은 상태에서만 접근 가능
      skipNotificationSubscription: true // 알림 구독 건너뛰기
    },
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가
      { path: '', name: 'Home' },
      { path: 'landing', name: 'LandingPage', component: LandingPage },
      { path: 'recipes', name: 'RecipeMainPage', component: RecipeMainPage },
      { path: 'recipes/:id', name: 'RecipeDetail', component: RecipeDetailPage },

      { path: 'recipe/post-write', name: 'RecipePostWrite', component: RecipePostWritePage },
      { path: 'recipe/post-edit', name: 'RecipePostEdit', component: RecipePostEditPage },
      { path: 'lectures', name: 'LectureList', component: LectureList },
      { path: 'lectures/create', name: 'LectureCreate', component: LectureCreate },
      { path: 'lectures/edit/:id', name: 'LectureEdit', component: LectureEdit },
      { path: 'lectures/:id', name: 'LectureDetail', component: LectureDetail },
      { path: 'cart', name: 'CartPage', component: CartPage },
      {
        path: "chat",
        name: "Chat",
        component: chat,
        meta: { requiresAuth: true },
      },
      { path: 'mypage', name: 'MyPage', component: MyPage },
      { path: 'notice', name: 'NoticeList', component: NoticeList },
      { path: 'notice/:id', name: 'NoticeDetail', component: NoticeDetail },
      { path: 'notice/create', name: 'NoticeCreate', component: NoticeCreate, meta: { requiresAuth: true, requiresAdmin: true } },
      { path: 'notice/edit/:id', name: 'NoticeEdit', component: NoticeEdit, meta: { requiresAuth: true, requiresAdmin: true } },
      { path: 'notifications', name: 'NotificationPage', component: NotificationPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 뒤로가기/앞으로가기 시 저장된 위치로 스크롤
    if (savedPosition) {
      return savedPosition
    }
    // 새 페이지로 이동 시 상단으로 스크롤
    return { top: 0 }
  }
});

// 인증 상태 캐싱
let authCheckCache = {
  timestamp: null,
  isAuthenticated: null,
  user: null,
  cacheExpiry: 30 * 1000 // 30초
};

// 인증 상태 캐시 유효성 검사
const isAuthCacheValid = () => {
  if (!authCheckCache.timestamp) return false;
  return Date.now() - authCheckCache.timestamp < authCheckCache.cacheExpiry;
};

// 인증 가드 (캐싱 및 디바운싱 적용)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const adminLoginStore = useAdminLoginStore();

  // OAuth 리다이렉트 페이지와 탈퇴한 회원 확인 페이지, 비활성화된 사용자 페이지는 인증 가드 건너뛰기
  if (to.name === "GoogleOAuthRedirect" || 
      to.name === "KakaoOAuthRedirect" || 
      to.name === "NaverOAuthRedirect" ||
      to.name === "DeletedUserConfirm" ||
      to.name === "InactiveUser") {
    next();
    return;
  }

  // 루트 경로('/')에 대한 처리
  if (to.path === '/' && to.name === 'Home') {
    if (authStore.isAuthenticated) {
      // 로그인된 사용자는 recipes 페이지로 리다이렉트 (관리자 포함)
      next('/recipes');
      return;
    } else {
      // 비로그인 사용자는 landing 페이지로 리다이렉트
      next('/landing');
      return;
    }
  }

  // 인증 상태 확인 (캐싱 적용)
  if (authStore.isAuthenticated && !authStore.user) {
    // 캐시가 유효한 경우 캐시된 데이터 사용
    if (isAuthCacheValid() && authCheckCache.user) {
      authStore.setUser(authCheckCache.user);
    } else {
      try {
        // 사용자 정보가 없는 경우 /user/me 엔드포인트로 최신 정보 조회
        const user = await authStore.getCurrentUser();
        
        // 캐시 업데이트
        authCheckCache = {
          timestamp: Date.now(),
          isAuthenticated: true,
          user: user
        };
      } catch (error) {
        // 사용자 정보 조회 실패 시 로그아웃 처리
        authStore.clearAuth();
        authCheckCache = {
          timestamp: null,
          isAuthenticated: null,
          user: null
        };
      }
    }
  }

  // 로그인이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
    return;
  }

  // 관리자 권한이 필요한 페이지
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      // 로그인되지 않은 사용자는 관리자 로그인 페이지로
      next("/admin-login");
      return;
    } else if (authStore.user?.role !== "ADMIN" && !adminLoginStore.isLoggedIn) {
      // 일반 사용자(GENERAL/CHEF/OWNER)는 접근 차단 페이지로
      next("/access-denied");
      return;
    }
  }

  // URL 직접 입력으로 관리자 페이지 접근 시도 차단
  if (to.path.startsWith('/admin') && authStore.isAuthenticated && authStore.user?.role !== "ADMIN" && !adminLoginStore.isLoggedIn) {
    // 일반 사용자가 관리자 경로로 직접 접근 시도 시 접근 차단 페이지로 리다이렉트
    next("/access-denied");
    return;
  }

  // 신규 사용자만 접근 가능한 페이지 (추가 정보 입력 페이지)
  if (
    to.meta.requiresNewUser &&
    (!authStore.isAuthenticated || !authStore.isNewUser)
  ) {
    next("/");
    return;
  }

  // 추가 정보 입력 페이지들에 대한 접근 제어
  if (authStore.isAuthenticated && authStore.user) {
    // admin 사용자도 추가 정보 입력 페이지에 접근할 수 있음 (필요시)
    const registrationStep = authStore.getRegistrationStep;
    
    // 이미 등록이 완료된 사용자가 추가 정보 입력 페이지에 접근하려는 경우
    if (registrationStep === 'complete') {
      if (to.path === '/add-info' || to.path === '/detail-user' || 
          to.path === '/detail-cook' || to.path === '/detail-owner') {
        next('/');
        return;
      }
    }
    
    // 각 단계별 페이지에 대한 접근 제어
    // 상세 입력 페이지들에서 '이전' 버튼으로 '/add-info'로 돌아가는 경우는 허용
    if (
      to.path === '/add-info' &&
      (from.path === '/detail-user' || from.path === '/detail-cook' || from.path === '/detail-owner')
    ) {
      next();
      return;
    }

    if (to.path === '/add-info' && registrationStep !== 'add-info') {
      // add-info 단계가 아닌 사용자가 접근하려는 경우
      if (registrationStep === 'complete') {
        next('/');
        return;
      } else {
        // 해당하는 단계로 리다이렉트
        next(`/${registrationStep.replace('detail-', 'detail-')}`);
        return;
      }
    }
    
    if (to.path === '/detail-user' && registrationStep !== 'detail-user') {
      if (registrationStep === 'add-info') {
        next('/add-info');
        return;
      } else if (registrationStep === 'complete') {
        next('/');
        return;
      }
    }
    
    if (to.path === '/detail-cook' && registrationStep !== 'detail-cook') {
      if (registrationStep === 'add-info') {
        next('/add-info');
        return;
      } else if (registrationStep === 'complete') {
        next('/');
        return;
      }
    }
    
    if (to.path === '/detail-owner' && registrationStep !== 'detail-owner') {
      if (registrationStep === '/add-info') {
        next('/add-info');
        return;
      } else if (registrationStep === 'complete') {
        next('/');
        return;
      }
    }
  }

  // 게스트만 접근 가능한 페이지 (로그인 페이지)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/");
    return;
  }

  // ✅ 추가: 채팅 페이지 진입 시 채팅방 선택 상태 초기화 (autoSelect가 아닌 경우만)
  if (to.path === '/chat' && authStore.isAuthenticated) {
    try {
      // autoSelect 파라미터가 있으면 채팅방 선택 유지
      if (to.query.autoSelect === 'true') {
        next();
        return;
      }
      
      // 일반 페이지 이동일 때만 채팅방 선택 상태 초기화
      const { useChatStore } = await import('@/store/chat/chat');
      const chatStore = useChatStore();
      if (chatStore.currentRoomId) {
        chatStore.currentRoomId = null;
      }
    } catch (error) {
      // 채팅 스토어 초기화 실패는 무시
    }
  }

  // 로그인된 사용자가 메인 페이지나 다른 페이지로 이동할 때 등록 상태 확인
  if (authStore.isAuthenticated && authStore.user && 
      (to.path === "/" || to.path === "/recipes" || to.path === "/lectures" || to.path === "/mypage")) {
    
    // /complete 페이지에서 메인 페이지로 이동하는 경우는 등록 상태 확인을 건너뛰기
    if (from.path === '/complete') {
      next();
      return;
    }
    
    // 사용자 등록 상태 확인
    const registrationStep = authStore.getRegistrationStep;
    
    // 등록이 완료되지 않은 경우 해당 단계로 리다이렉트
    if (registrationStep !== 'complete') {
      switch (registrationStep) {
        case 'add-info':
          if (to.path !== '/add-info') {
            next('/add-info');
            return;
          }
          break;
        case 'detail-user':
          if (to.path !== '/detail-user') {
            next('/detail-user');
            return;
          }
          break;
        case 'detail-cook':
          if (to.path !== '/detail-cook') {
            next('/detail-cook');
            return;
          }
          break;
        case 'detail-owner':
          if (to.path !== '/detail-owner') {
            next('/detail-owner');
            return;
          }
          break;
      }
    }
  }

  next();
});

export default router;
