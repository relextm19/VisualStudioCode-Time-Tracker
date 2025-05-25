import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import Home from './Home.vue';
import Register from './Register.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Home },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
