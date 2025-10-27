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
import ProjectTimeDisplay from './components/ProjectTimeDisplay.vue'
import DisplaySwitch from './components/DisplaySwitch.vue'

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
    projects.value = json.Projects
    languages.value = json.Languages
    totalTime.value = json.TotalTime
})

const showLanguages = ref(false)
const currentlyShown = computed(() => (showLanguages.value ? languages.value : projects.value))

interface Entry{
    name: string
    time: number
    languages?: Record<string, number>[] //only project entries will have this
}
const getProps = (entry: Entry) =>{
    return showLanguages.value ?
        {name: entry.name, time: entry.time}:
        {name:entry.name, time:entry.time, languageTimes: entry.languages}
}
</script>
