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

let loggedIn = false;// cache the value so i dont have to hit /api/checkAuth every request. This is not a security issue cause i still have an auth middleware on the backend so if someone plays arround with the client side the app still wont let them acces data

router.beforeEach(async (to, _, next) => {
    const publicPaths = ['/login', '/register'];

    if(publicPaths.includes(to.path)){
        if (loggedIn) return next('/');
        return next();
    }
    if(loggedIn) return next();

    try {
        const res = await fetch('/api/checkAuth', { credentials: 'include' });
        if (res.ok) {
            loggedIn = true;
            next();
        }
        else next('/login');
    } catch {
        next('/login');
    }
});

export default router;
