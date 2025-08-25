import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './store/auth/auth'
import './assets/fonts/global.scss';
import './assets/styles/layout.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// 앱 시작 시 인증 상태 초기화 및 인터셉터 설정
const authStore = useAuthStore()

// Auth 인터셉터 설정
// setupAuthInterceptors(authStore)

// 인증 상태 초기화
authStore.initialize().then(() => {
  console.log('Auth initialization completed')
}).catch((error) => {
  console.error('Auth initialization failed:', error)
})

app.mount('#app')