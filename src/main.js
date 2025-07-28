import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts/global.scss';
import vuetify from './plugins/vuetify'
import router from './router'
import './assets/styles/layout.css'
import { createPinia } from 'pinia'

const pinia = createPinia()

createApp(App).use(router).use(vuetify).use(pinia).mount('#app')