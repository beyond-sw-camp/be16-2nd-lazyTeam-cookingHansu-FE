import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts/global.scss';
import vuetify from './plugins/vuetify'
import './assets/styles/layout.css'

createApp(App).use(vuetify).mount('#app')
