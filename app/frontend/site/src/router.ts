import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import Home from './Home.vue';
import Register from './Register.vue';
import Languages from './Languages.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/languages', component: Languages },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
