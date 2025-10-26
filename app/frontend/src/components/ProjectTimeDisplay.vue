<template>
    <div class="flex items-center gap-4 p-4 rounded-xl shadow-md mb-4">
        <!-- have to use style cause tailwind cant intepret js variables -->
        <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2"
            :style="{ borderColor: color }" 
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
import { defineProps } from 'vue'
import languageIconColors from '@/assets/skillicons-colors.json'


const props = defineProps<{
    name: string
    time: number
    languageTimes: Record<string,number>
}>()

const colors: Record<string, number[]> = languageIconColors
const dominantLanguage = Object.entries(props.languageTimes).reduce(
    (max, [name, time]) => (time > max[1] ? [name,time] : max)
) 
const color = `rgb(${colors[dominantLanguage[0]].join(',')})`

const hours = Math.floor(props.time / 3600);
const minutes = Math.floor((props.time % 3600) / 60);
const seconds = props.time % 60;
</script>
