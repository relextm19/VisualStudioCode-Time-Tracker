<template>
    <input 
        class="bg-black text-white w-full h-10 rounded-md px-3 border border-white focus:outline-none focus:shadow focus:scale-101 shadow-white transition duration-200"
        type="email" 
        placeholder="Email"
        v-model="model"
    >
</template>
<script setup lang="ts">
    const model = defineModel();
</script>