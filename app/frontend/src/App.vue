
<template>
  <header class="bg-black text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="text-2xl font-bold tracking-wide">
            TimeTracker
        </div>

        <nav class="flex gap-6">
            <MenuElement to="/login" text="Login"/>
            <MenuElement to="/languages" text="Languages"/>
            <MenuElement to="/" text="Home"/>
        </nav>
      </div>
    </div>
  </header>

  <main class="bg-black text-white min-h-screen">
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
    import MenuElement from './components/MenuElement.vue';  
</script>
