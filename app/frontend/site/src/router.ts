import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import RegisterInfo from './components/Register-Info.vue';
import Register from './components/Register.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Home },
  { path: '/register-info', component: RegisterInfo },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
