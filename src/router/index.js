import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/admin/AdminLayout.vue' 
import Dashboard from '@/views/admin/Dashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'
import ChefApproval from '@/views/admin/ChefApproval.vue'
import NoticeManagement from '@/views/admin/NoticeManagement.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import ReportManagement from '@/views/admin/ReportManagement.vue'
import RecipeMainPage from '@/views/home/RecipeMainPage.vue'
import LectureList from '@/views/home/LectureList.vue'

import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    name: 'RecipeMainPage',
    component: RecipeMainPage,
  },
  {
    path: '/lecture-list',
    name: 'LectureList',
    component: LectureList,
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
    path: '/',
    component: MainLayout,
    children: [
      // 여기에 유저용 페이지 라우트 추가
      { path: '', redirect: '/recipes' },
      { path: 'recipes', component: { template: '<div>레시피 공유 게시글</div>' } },
      { path: 'lectures', component: { template: '<div>판매중인 강의</div>' } },
      { path: 'chat', component: { template: '<div>1:1채팅</div>' } },
      { path: 'mypage', name: 'MyPage', component: () => import('@/views/MyPage/MyPage.vue') },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
