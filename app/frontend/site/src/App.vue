<script setup lang="ts">
import {ref, type Component, computed} from 'vue'
import Login from './components/Login.vue';
import NotFound from './components/NotFound.vue';
import Home from './components/Home.vue';

const routes: Record<string, Component> = {
    '/': Home,
    '/login': Login,
}

const currentPath = ref(window.location.hash.slice(1) || '/');

window.addEventListener('hashchange', () =>{
    currentPath.value = window.location.hash.slice(1) || '/';
})

const currentView = computed(() =>{
    return routes[currentPath.value || '/'] || NotFound;
})

</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-black to-stone-900">
        <a href="#/" class="">Home</a> |
        <a href="#/login" class="text-white">Login</a> |
        <a href="#/non-existent-path">Broken Link</a>
        <component :is="currentView" />
    </div>
</template>

<style scoped>

</style>
