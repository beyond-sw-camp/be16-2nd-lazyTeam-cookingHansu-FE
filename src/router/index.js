import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/admin/AdminDashboard.vue'
import LectureApproval from '@/views/admin/LectureApproval.vue'

const routes = [
    { path: '/dashboard', component: Dashboard },
    { path: '/lecture-approval', component: LectureApproval },
    { path: '/chef-approval', component: ChefApproval },
    { path: '/notice-management', component: NoticeManagement },
    { path: '/user-management', component: UserManagement },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})