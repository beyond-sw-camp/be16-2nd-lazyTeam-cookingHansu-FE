import { createRouter, createWebHistory } from 'vue-router'
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
import AddInfoPage from '@/views/login/AddInfoPage.vue'
import AdminLoginPage from '@/views/admin/AdminLoginPage.vue'
import AuthDetailCookPage from '@/views/login/AuthDetailCookPage.vue'
import AuthDetailOwnerPage from '@/views/login/AuthDetailOwnerPage.vue'
import AuthDetailUserPage from '@/views/login/AuthDetailUserPage.vue'
import RegistrationCompletePage from '@/views/login/RegistrationCompletePage.vue'
import RecipeMainPage from '@/views/home/RecipeMainPage.vue'
import LectureList from '@/views/home/LectureList.vue'
import LectureDetail from '@/views/lecture/LectureDetail.vue'
import CartPage from '@/views/cart/CartPage.vue'

import PaymentDetails from '@/views/payment/PaymentDetails.vue'
// toss sdk 결제 성공시 페이지 이동
import PaymentSuccess from '@/views/payment/PaymentSuccess.vue'
import PaymentFail from '@/views/payment/PaymentFail.vue'

import MyPage from '@/views/MyPage/MyPage.vue'

import chat from '@/views/chat/chatScreen.vue'
import NoticeList from '@/views/notice/NoticeList.vue'
import NoticeDetail from '@/views/notice/NoticeDetail.vue'
import NoticeCreate from '@/views/notice/NoticeCreate.vue'
import NoticeEdit from '@/views/notice/NoticeEdit.vue'

const routes = [
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLoginPage,
  },
  {
    path: '/payment-details/:orderId',
    name: 'PaymentDetails',
    component: PaymentDetails,
  },

  {
    path: '/admin',
    component: AdminLayout, // 관리자 공통 레이아웃
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
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/add-info',
    name: 'AddInfo',
    component: AddInfoPage,
  },
  {
    path: '/auth-detail-user', 
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
    path: '/auth-detail-cook',
    name: 'AuthDetailCook',
    component: AuthDetailCookPage,
  },
  {
    path: '/auth-detail-owner',
    name: 'AuthDetailOwner',
    component: AuthDetailOwnerPage,
  },
  {
    path: '/complete',
    name: 'RegistrationComplete',
    component: RegistrationCompletePage
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가
      { path: '', redirect: '/recipes' },
      { path: 'landing', name: 'LandingPage', component: LandingPage },
      { path: 'recipes', name: 'RecipeMainPage', component: RecipeMainPage },
      { path: 'lectures', name: 'LectureList', component: LectureList },
      { path: 'lectures/:id', name: 'LectureDetail', component: LectureDetail },
      { path: 'cart', name: 'CartPage', component: CartPage },
      {
        path: 'chat',
        name: 'Chat',
        component: chat,
      },
      { path: 'mypage', name: 'MyPage', component: MyPage },
      { path: 'notice', name: 'NoticeList', component: NoticeList },
      { path: 'notice/:id', name: 'NoticeDetail', component: NoticeDetail },
      { path: 'notice/create', name: 'NoticeCreate', component: NoticeCreate },
      { path: 'notice/edit/:id', name: 'NoticeEdit', component: NoticeEdit },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
