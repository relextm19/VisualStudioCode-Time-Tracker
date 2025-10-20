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
router.beforeEach(async (to, _, next) => {
    const publicPaths = ['/login', '/register'];

    try {
        const res = await fetch('/api/checkAuth', { credentials: 'include' });
        if (res.ok) {
            if (publicPaths.includes(to.path)) return next('/');
            next();
        }
        else next('/login');
    } catch {
        next('/login');
    }
});

export default router;
