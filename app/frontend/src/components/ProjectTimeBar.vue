<template>
    <div class="flex items-center w-full">
        <div 
            v-for="(segment, index) in segments" :key=index
            class="h-2 text-white text-center"
            :class="{ 'rounded-r-full': index === segments.length - 1, 'rounded-l-full': index === 0 }"
            :style="{ width: `${segment.percentage}%`, backgroundColor: segment.color }">
        </div>
    </div>
</template>
<script setup lang="ts">
import type { Segment } from './ProjectTimeDisplay.vue';
const props = defineProps<{
    segments: Segment[]
}>();
</script>
