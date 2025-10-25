<template>
    <div class="flex items-center gap-4 p-4 rounded-xl shadow-md mb-4">
        <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
            :style="{ background: projectColor }"
        >
            {{ name[0].toUpperCase() }}
        </div>
        <div class="flex flex-col">
            <p class="text-white text-xl font-semibold">{{ name }}</p>
            <p class="text-gray-300 font-mono text-lg">{{ hours }}h : {{ minutes }}m : {{ seconds }}s</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps<{
    name: string
    totalTime: number
}>()

const projectColor = 'red-300'

// reactive time calculation
const hours = computed(() => Math.floor(props.totalTime / 3600))
const minutes = computed(() => Math.floor((props.totalTime % 3600) / 60))
const seconds = computed(() => props.totalTime % 60)
</script>
