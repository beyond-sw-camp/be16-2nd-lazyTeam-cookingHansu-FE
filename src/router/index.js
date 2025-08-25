import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth';
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
import RecipeMainPage from '@/views/home/RecipeMainPage.vue'
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

const routes = [
  {
    path: "/admin-login",
    name: "AdminLogin",
    component: AdminLoginPage,
  },
  {
    path: "/payment-details/:orderId",
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
    path: "/",
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가
      { path: '', name: 'Home' },
      { path: 'landing', name: 'LandingPage', component: LandingPage },
      { path: 'recipes', name: 'RecipeMainPage', component: RecipeMainPage },
      { path: 'recipes/:id', name: 'RecipeDetail', component: RecipeMainPage },
      { path: 'lectures', name: 'LectureList', component: LectureList },
      { path: 'lectures/:id', name: 'LectureDetail', component: LectureDetail },
      { path: 'lectures/create', name: 'LectureCreate', component: LectureCreate },
      { path: 'lectures/edit/:id', name: 'LectureEdit', component: LectureEdit },
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
      { path: 'notice/create', name: 'NoticeCreate', component: NoticeCreate },
      { path: 'notice/edit/:id', name: 'NoticeEdit', component: NoticeEdit },
      { path: 'notifications', name: 'NotificationPage', component: NotificationPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 인증 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // OAuth 리다이렉트 페이지는 인증 가드 건너뛰기
  if (to.name === "GoogleOAuthRedirect" || 
      to.name === "KakaoOAuthRedirect" || 
      to.name === "NaverOAuthRedirect") {
    next();
    return;
  }

  // 루트 경로('/')에 대한 처리
  if (to.path === '/' && to.name === 'Home') {
    if (authStore.isAuthenticated) {
      // 로그인된 사용자는 recipes 페이지로 리다이렉트
      next('/recipes');
      return;
    } else {
      // 비로그인 사용자는 landing 페이지로 리다이렉트
      next('/landing');
      return;
    }
  }

  // 인증 상태 확인 (access token이 있지만 사용자 정보가 없는 경우)
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      // 사용자 정보가 없는 경우 /user/me 엔드포인트로 최신 정보 조회
      await authStore.getCurrentUser();
    } catch (error) {
      console.error("Auth check failed:", error);
      // 사용자 정보 조회 실패 시 로그아웃 처리
      authStore.clearAuth();
    }
  }

  // 로그인이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
    return;
  }

  // 관리자 권한이 필요한 페이지
  if (
    to.meta.requiresAdmin &&
    (!authStore.isAuthenticated || authStore.user?.role !== "admin")
  ) {
    next("/admin-login");
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
      if (registrationStep === 'add-info') {
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
