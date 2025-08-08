import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'
import AdminLayout from '@/layouts/admin/AdminLayout.vue' 
import Dashboard from '@/views/admin/Dashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'
import ChefApproval from '@/views/admin/ChefApproval.vue'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import ReportManagement from '@/views/admin/reportManagement.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LandingPage from '@/views/landing/LandingPage.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import AddInfoPage from '@/views/login/AddInfoPage.vue'
import AdminLoginPage from '@/views/admin/AdminLoginPage.vue'
import AuthDetailCookPage from '@/views/login/AuthDetailCookPage.vue'
import AuthDetailOwnerPage from '@/views/login/AuthDetailOwnerPage.vue'
import AuthDetailUserPage from '@/views/login/AuthDetailUserPage.vue'
import RegistrationCompletePage from '@/views/login/RegistrationCompletePage.vue'
import GoogleRedirect from '@/views/login/oauth/GoogleRedirect.vue'
import RecipeMainPage from '@/views/home/RecipeMainPage.vue'
import LectureList from '@/views/home/LectureList.vue'
import LectureDetail from '@/views/lecture/LectureDetail.vue'
// import CartPage from '@/views/CartPage.vue'

import PaymentDetails from "@/views/payment/PaymentDetails.vue";

import MyPage from "@/views/MyPage/MyPage.vue";

import chat from '@/views/chat/chatScreen.vue'
import NoticeList from '@/views/notice/NoticeList.vue'
import NoticeDetail from '@/views/notice/NoticeDetail.vue'
import NoticeCreate from '@/views/notice/NoticeCreate.vue'
import NoticeEdit from '@/views/notice/NoticeEdit.vue'

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
    meta: { requiresAuth: true }
  },

  {
    path: "/admin",
    component: AdminLayout, // 관리자 공통 레이아웃
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/dashboard" }, // 기본 경로 → 대시보드로 리디렉트
      { path: "dashboard", name: "Dashboard", component: Dashboard },
      {
        path: "lecture-approval",
        name: "/LectureApproval",
        component: LectureApproval,
      },
      { path: "chef-approval", name: "ChefApproval", component: ChefApproval },
      {
        path: "notice-management",
        name: "NoticeManagement",
        component: NoticeManagement,
      },
      {
        path: "user-management",
        name: "UserManagement",
        component: UserManagement,
      },
      {
        path: "report-management",
        name: "ReportManagement",
        component: ReportManagement,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: "/oauth/google/redirect",
    name: "GoogleOAuthRedirect",
    component: GoogleRedirect,
  },
  {
    path: "/add-info",
    name: "AddInfo",
    component: AddInfoPage,
    meta: { requiresAuth: true, requiresNewUser: true }
  },
  {
    path: "/auth-detail-user",
    name: "AuthDetailUser",
    component: AuthDetailUserPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/auth-detail-cook",
    name: "AuthDetailCook",
    component: AuthDetailCookPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/auth-detail-owner",
    name: "AuthDetailOwner",
    component: AuthDetailOwnerPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/complete",
    name: "RegistrationComplete",
    component: RegistrationCompletePage,
    meta: { requiresAuth: true }
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가
      { path: '', redirect: '/recipes' },
      { path: 'landing', name: 'LandingPage', component: LandingPage },
      { path: 'recipes', name: 'RecipeMainPage', component: RecipeMainPage },
      { path: 'lectures', name: 'LectureList', component: LectureList },
      { path: 'lectures/:id', name: 'LectureDetail', component: LectureDetail },
      // { path: 'cart', name: 'CartPage', component: CartPage },
      {
        path: "chat",
        name: "Chat",
        component: chat,
        meta: { requiresAuth: true }
      },
      { 
        path: "mypage", 
        name: "MyPage", 
        component: MyPage,
        meta: { requiresAuth: true }
      },
      { path: 'mypage', name: 'MyPage', component: MyPage },
      { path: 'notice', name: 'NoticeList', component: NoticeList },
      { path: 'notice/:id', name: 'NoticeDetail', component: NoticeDetail },
      { path: 'notice/create', name: 'NoticeCreate', component: NoticeCreate },
      { path: 'notice/edit/:id', name: 'NoticeEdit', component: NoticeEdit },
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
  if (to.name === 'GoogleOAuthRedirect') {
    next();
    return;
  }
  
  // 인증 상태 확인 (access token이 있지만 사용자 정보가 없는 경우)
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      // 사용자 정보가 없는 경우 로그아웃 처리
      console.log('User info missing, clearing auth');
      authStore.clearAuth();
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }
  
  // 로그인이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // 관리자 권한이 필요한 페이지
  if (to.meta.requiresAdmin && (!authStore.isAuthenticated || authStore.user?.role !== 'admin')) {
    next('/admin-login');
    return;
  }
  
  // 신규 사용자만 접근 가능한 페이지 (추가 정보 입력 페이지)
  if (to.meta.requiresNewUser && (!authStore.isAuthenticated || !authStore.isNewUser)) {
    console.log('Non-new user trying to access add-info page, redirecting to home');
    next('/');
    return;
  }
  
  // 게스트만 접근 가능한 페이지 (로그인 페이지)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
    return;
  }
  
  next();
});

export default router;
