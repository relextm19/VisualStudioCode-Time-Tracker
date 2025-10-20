<template>
    <TotalTimeDisplay :totalTime="totalTime" />
    <DisplaySwitch />
    <div v-if="languages.length > 0">
        <div v-for="language in languages" :key="language.name">
            <LanguageTimeDisplay 
                :languageName="language.name" 
                :totalTime="language.time" 
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
</script>
