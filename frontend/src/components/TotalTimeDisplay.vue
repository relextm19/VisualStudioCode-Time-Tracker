<template>
  <div class="flex items-center justify-center w-full py-8 text-white">
    <div class="flex flex-col items-center">
      <p class="text-3xl font-semibold uppercase tracking-wider mb-2">
        Total Time
      </p>
      <div class="flex items-center gap-3 font-mono text-4xl text-gray-200">
        <span>{{ hours }}<span class="text-sm uppercase ml-1">h</span></span>
        <span class="text-2xl text-gray-400">:</span>
        <span>{{ minutes }}<span class="text-sm uppercase ml-1">m</span></span>
        <span class="text-2xl text-gray-400">:</span>
        <span>{{ seconds }}<span class="text-sm uppercase ml-1">s</span></span>
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

const hours = computed(() => Math.floor(props.totalTime / 3600).toString().padStart(2, '0'))
const minutes = computed(() => Math.floor((props.totalTime % 3600) / 60).toString().padStart(2, '0'))
const seconds = computed(() => (props.totalTime % 60).toString().padStart(2, '0'))
</script>
