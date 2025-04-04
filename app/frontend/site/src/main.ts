import { createApp } from 'vue'
import App from './App.vue'
import './styles/tailwind.css'
import router from './router.ts'

createApp(App).use(router).mount('#app');
