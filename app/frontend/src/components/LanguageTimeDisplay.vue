<template>
  <div class="flex items-center gap-4 p-4 rounded-xl shadow-md mb-4">
    <img :src="iconUrl" :alt="name" class="w-16 h-16 rounded-full" />
    <div class="flex flex-col">
      <p class="text-white text-xl font-semibold">{{ name }}</p>
      <p class="text-gray-300 font-mono text-lg">{{ hours }}h : {{ minutes }}m : {{ seconds }}s</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { formatTime } from '@/utils/formatTime';

const props = defineProps<{
  name: string
  time: number
}>()

const iconUrl = `https://skillicons.dev/icons?i=${props.name}`;

const [hours, minutes, seconds] = formatTime(props.time);
</script>
