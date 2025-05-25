<script setup lang="ts">

</script>

<template>
    <div class="min-h-screen bg-black">
        <p class="text-white underline flex gap-2">
            <router-link to="/Login">Login</router-link>
            <router-link to="/">Home</router-link>
        </p>
        <router-view></router-view>
    </div>
</template>

<style scoped>

</style>
