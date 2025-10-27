<template>
  <header class="bg-black text-white shadow-md">
    <div class="flex items-center justify-between h-16 px-8 w-full">
      <div class="text-2xl font-bold">
        TimeTracker
      </div>

      <nav class="flex gap-6">
        <MenuElement to="/login" text="Login" />
        <MenuElement to="/dashboard" text="Dashboard" />
        <MenuElement to="/" text="Home" />
      </nav>
    </div>
  </header>

  <main class="bg-black text-white min-h-screen">
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import MenuElement from './components/MenuElement.vue';  
</script>
