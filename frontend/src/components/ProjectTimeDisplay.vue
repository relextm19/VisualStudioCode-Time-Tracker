<template>
    <div class="flex items-center gap-4 p-4 rounded-xl shadow-md mb-4 w-full">
        <!-- for some reason min-w-16 works but min-w doesnt -->
        <div
            class="min-w-16 aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white border-2">
            {{ name[0].toUpperCase() }}
        </div>
        <div>
            <p class="text-white text-xl font-semibold">{{ name }}</p>
            <p class="text-gray-300 font-mono text-lg">{{ hours }}h : {{ minutes }}m : {{ seconds }}s</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/formatTime';

const props = defineProps<{
    name: string
    time: number
}>()

const [hours, minutes, seconds] = formatTime(props.time)
</script>
