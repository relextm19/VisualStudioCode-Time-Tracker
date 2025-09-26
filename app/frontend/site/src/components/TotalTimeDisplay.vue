<template>
    <div class="flex items-center justify-center w-full p-6 text-white">
        <div class="flex flex-col items-center">
            <h2 class="text-2xl uppercase tracking-wider text-white">Total Time</h2>
            <div class="flex items-center justify-evenly gap-1">
                <span class="text-3xl">{{ hours }}<span class="text-xs uppercase">hrs</span></span>
                <span class="text-xl">:</span>
                <span class="text-3xl">{{ minutes }}<span class="text-xs uppercase">min</span></span>
                <span class="text-xl">:</span>
                <span class="text-3xl">{{ seconds }}<span class="text-xs uppercase">sec</span></span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
    totalTime: {
        type: Number,
        required: true
    }
});

const hours = computed(() => Math.floor(props.totalTime / 3600).toString().padStart(2, '0'));
const minutes = computed(() => Math.floor((props.totalTime % 3600) / 60).toString().padStart(2, '0'));
const seconds = computed(() => (props.totalTime % 60).toString().padStart(2, '0'));
</script>