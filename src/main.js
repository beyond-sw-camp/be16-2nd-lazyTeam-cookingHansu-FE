import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './store/auth/auth'
import { useAdminLoginStore } from './store/admin/adminLogin'
import { setupAxiosInterceptors, apiClient } from './utils/interceptor'
import './assets/fonts/global.scss';
import './assets/styles/layout.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// axios를 전역으로 설정
app.config.globalProperties.$axios = apiClient

// 앱 시작 시 인증 상태 초기화 및 인터셉터 설정
const authStore = useAuthStore()
const adminLoginStore = useAdminLoginStore()

// Axios 인터셉터 설정
setupAxiosInterceptors(authStore, adminLoginStore)

// 인증 상태 초기화
Promise.all([
  authStore.initialize(),
  adminLoginStore.initialize()
]).then(() => {
  console.log('Auth and Admin initialization completed')
}).catch((error) => {
  console.error('Initialization failed:', error)
})

app.mount('#app')