import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/admin/AdminLayout.vue' 
import Dashboard from '@/views/admin/Dashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'
import ChefApproval from '@/views/admin/ChefApproval.vue'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import ReportManagement from '@/views/admin/reportManagement.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import AddInfoPage from '@/views/login/AddInfoPage.vue'
import AdminLoginPage from '@/views/admin/AdminLoginPage.vue'
// AuthDetailCookPage/AuthDetailOwnerPage는 추후 구현 예정, 임시 컴포넌트로 등록
const AuthDetailCookPage = { template: '<div>요식업 종사자 상세 인증 (추후 구현)</div>' }
const AuthDetailOwnerPage = { template: '<div>요식업 자영업자 상세 인증 (추후 구현)</div>' }
const routes = [
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLoginPage,
  },
  {
    path: '/admin-register',
    name: 'AdminRegister',
    component: () => import('@/views/admin/AdminRegisterPage.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout, // 관리자 공통 레이아웃
    children: [
      { path: '', redirect: '/admin/dashboard' }, // 기본 경로 → 대시보드로 리디렉트
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'lecture-approval', name: '/LectureApproval', component: LectureApproval },
      { path: 'chef-approval', name: 'ChefApproval', component: ChefApproval },
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
    path: '/',
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가 (예시)
      { path: '', redirect: '/recipes' },
      { path: 'recipes', component: { template: '<div>레시피 공유 게시글</div>' } },
      { path: 'lectures', component: { template: '<div>판매중인 강의</div>' } },
      { path: 'chat', component: { template: '<div>1:1채팅</div>' } },
      { path: 'mypage', component: { template: '<div>마이페이지</div>' } },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
