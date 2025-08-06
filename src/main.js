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

// 앱 시작 시 인증 상태 복원 시도
const authStore = useAuthStore()
authStore.restoreAuthState().then((success) => {
  if (success) {
    console.log('Auth state restored successfully')
  } else {
    console.log('No valid auth state to restore')
  }
}).catch((error) => {
  console.error('Auth state restoration failed:', error)
})

app.mount('#app')