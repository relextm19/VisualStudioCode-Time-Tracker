<template>
    <TotalTimeDisplay :totalTime="totalTime" />
    <DisplaySwitch v-model:showLanguages="showLanguages"/>
    <div v-if="currentlyShown.length > 0">
        <div v-for="entry in currentlyShown" :key="entry.name">
            <LanguageTimeDisplay 
                :languageName="entry.name" 
                :totalTime="entry.time" 
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import TotalTimeDisplay from './components/TotalTimeDisplay.vue'
import LanguageTimeDisplay from './components/LanguageTimeDisplay.vue'
import DisplaySwitch from './components/DisplaySwitch.vue'

interface timeData {
    name: string;
    time: number;
}

const projects = ref<timeData[]>([]);
const languages = ref<timeData[]>([]);
const totalTime = ref(0);

onMounted(async () => {
    const response = await fetch('/api/userMetrics');
    const json = await response.json(); 
    projects.value = json.projects;
    languages.value = json.languages;
    totalTime.value = json.totalTime;
})

const showLanguages = ref(true)
const currentlyShown = computed(() => {
    return showLanguages.value ? languages.value : projects.value
})
</script>
