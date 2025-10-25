<template>
    <TotalTimeDisplay :totalTime="totalTime" />
    <DisplaySwitch v-model:showLanguages="showLanguages"/>
    <div v-if="currentlyShown.length > 0">
        <div v-for="entry in currentlyShown" :key="entry.name">
            <component
                :is="showLanguages ? LanguageTimeDisplay : ProjectTimeDisplay"
                v-bind="getProps(entry)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import TotalTimeDisplay from './components/TotalTimeDisplay.vue'
import LanguageTimeDisplay from './components/LanguageTimeDisplay.vue'
import DisplaySwitch from './components/DisplaySwitch.vue'
import ProjectTimeDisplay from './components/ProjectTimeDisplay.vue'

interface timeData {
    name: string
    time: number
}

const projects = ref<timeData[]>([])
const languages = ref<timeData[]>([])
const totalTime = ref(0)

onMounted(async () => {
    const response = await fetch('/api/userMetrics')
    const json = await response.json()
    console.log(json, response)
    projects.value = json.Projects
    languages.value = json.Languages
    totalTime.value = json.TotalTime
})

const showLanguages = ref(true)
const currentlyShown = computed(() => (showLanguages.value ? languages.value : projects.value))

const getProps = (entry: timeData) => {
    return showLanguages.value
        ? { name: entry.name, totalTime: entry.time }
        : { name: entry.name, totalTime: entry.time }
}
</script>
