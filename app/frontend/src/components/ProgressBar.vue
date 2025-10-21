<template>
    <div class="flex items-center w-full">
        <span class="text-white">0%</span>
        <div class="w-full bg-gray-400 rounded-full relative">
            <div class="h-2 rounded-full"
            :class="collor"
            :style="{ width: `${progress}%` }">
            </div>
            <div class="absolute -translate-x-1/2"
            :style="{ left: `${progress}%`}">
                <span class="text-white"> {{ progress }}% </span>
            </div>
        </div>
        <span class="text-white">100%</span>
    </div>
</template>
<script setup lang="ts">
    import { defineProps, ref } from 'vue';

    const props = defineProps({
        progress: {
            type: Number,
            required: true
        }
    });

    const collor = ref('');
    if (props.progress < 30) {
        collor.value = 'bg-red-500';
    } else if (props.progress >= 30 && props.progress < 70) {
        collor.value = 'bg-yellow-500';
    } else if (props.progress >= 70) {
        collor.value = 'bg-green-500';
    } 
</script>