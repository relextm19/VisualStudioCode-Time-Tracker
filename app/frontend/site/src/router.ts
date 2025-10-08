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
router.beforeEach(async (to, from, next) => {
    const publicPaths = ['/login', '/register'];

    //TODO: make it so if the user is already logged in and the path is a public path he gets redirected to home 
    if (publicPaths.includes(to.path)) return next();
    try {
        const res = await fetch('/api/checkAuth', { credentials: 'include' });
        if (res.ok) next();
        else next('/login');
    } catch {
        next('/login');
    }
});

export default router;
