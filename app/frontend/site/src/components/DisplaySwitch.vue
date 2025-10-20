<template>
    <div class="w-min rounded-2xl flex justify-items-center gap-2 border-2 border-white relative">
        <div 
            class="absolute bg-white w-1/2 h-full rounded-2xl pointer-events-none transition-transform duration-200 ease-out"
            :class="showLanguages ? '' : 'translate-x-full'"
        ></div>
        <span 
            :class="showLanguages ? 'text-black' : 'text-white'"
            class="p-0.5 z-10"
            @click="showLanguages = true; $emit('changeDisplay')"
        >Languages</span>
        <span 
            :class="showLanguages ? 'text-white' : 'text-black'"
            class="p-0.5 z-10"
            @click="showLanguages = false; $emit('changeDisplay')"
        >Projects</span>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    const showLanguages = ref(true)
</script>
