import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts/global.scss';
import vuetify from './plugins/vuetify'
import router from './router'
import './assets/styles/layout.css'

createApp(App).use(router).use(vuetify).mount('#app')
