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
    <a href="#/">Home</a> |
    <a href="#/login">Login</a> |
    <a href="#/non-existent-path">Broken Link</a>
    <component :is="currentView" />
</template>

<style scoped>

</style>
