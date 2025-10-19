<template>
  <div class="flex items-center">
    <div class="flex flex-col items-center">
      <img :src="iconUrl" :alt="languageName" class="w-24 h-24" />
      <p class="text-white text-2xl">{{ languageName }}</p>
    </div>
    <p class="text-white text-xl ml-5">{{ hours }}h:{{ minutes }}m:{{ seconds }}s</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  languageName: string
  totalTime: number
}>()

const iconUrl = `https://skillicons.dev/icons?i=${props.languageName}`

// calculate time
const hours = Math.floor(props.totalTime / 3600).toString().padStart(2, '0')
const minutes = Math.floor((props.totalTime % 3600) / 60).toString().padStart(2, '0')
const seconds = (props.totalTime % 60).toString().padStart(2, '0')
</script>
