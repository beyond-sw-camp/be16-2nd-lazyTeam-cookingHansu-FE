import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/admin/AdminLayout.vue' 
import Dashboard from '@/views/admin/Dashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'
import ChefApproval from '@/views/admin/ChefApproval.vue'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import ReportManagement from '@/views/admin/ReportManagement.vue'
import DefaultLayout from '@/layouts//common/DefaultLayout.vue'
import chat from '@/views/chat/ChatScreen.vue'
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', redirect: '/chat' }, // 기본 경로 → 홈으로 리디렉트
      // { path: 'recipes', component: () => import('@/views/RecipeList.vue') },
      // { path: 'courses', component: () => import('@/views/CourseList.vue') },
      {
        path: '/chat',
        name: 'Chat',
        component: chat,
      },
      // { path: 'mypage', component: () => import('@/views/MyPage.vue') },
      // { path: 'login', component: () => import('@/views/Login.vue') },
      // { path: 'logout', beforeEnter: () => { /* 로그아웃 처리 후 리다이렉트 */ return '/' } },
    ]
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
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
