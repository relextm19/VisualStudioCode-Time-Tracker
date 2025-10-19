<template>
    <TotalTimeDisplay :totalTime="69420" />

    <div v-if="languages.length > 0">

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TotalTimeDisplay from './components/TotalTimeDisplay.vue'
import LanguageTimeDisplay from './components/LanguageTimeDisplay.vue'

type DataMap = Record<string, number>
const projects = ref<DataMap[]>([])
const languages = ref<DataMap[]>([])

onMounted(async () => {
    const response = await fetch('/api/userMetrics')
    const json = await response.json() 
    projects.value = json[0]
    languages.value = json[1]
    console.log(languages.value, projects.value)
})
</script>
