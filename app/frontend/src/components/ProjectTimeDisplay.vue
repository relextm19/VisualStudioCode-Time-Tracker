<template>
    <div class="flex items-center gap-4 p-4 rounded-xl shadow-md mb-4 w-full">
        <!-- have to use style cause tailwind cant intepret js variables -->
        <div
            class="w-16 aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white border-2"
            :style="{ borderColor: dominantColor}" 
        >
            {{ name[0].toUpperCase() }}
        </div>
        <div class="flex flex-col w-full">
            <p class="text-white text-xl font-semibold w-fit">{{ name }}</p>
            <p class="text-gray-300 font-mono text-lg">{{ hours }}h : {{ minutes }}m : {{ seconds }}s</p>
            <div class="w-1/5">
                <ProgressBar :segments=segments />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import languageIconColors from '@/assets/skillicons-colors.json'
import ProgressBar from './ProjectTimeBar.vue';


const props = defineProps<{
    name: string
    time: number
    languageTimes: Record<string,number>
}>()

const colorsObject: Record<string, number[]> = languageIconColors

export interface Segment{
    name: string,
    time: number,
    percentage: number,
    color: string
}
const segments = ref<Segment[]>([])

//get the language with most time
const timeSum = ref(0)
const dominantLanguage = ref<[string, number]>(["", 0])
for (const [name, time] of Object.entries(props.languageTimes)){
    timeSum.value += time;
    segments.value.push({
        name,
        time,
        percentage: 0, //the percentage will be calcualated after we get the proper time sum
        color: `rgb(${colorsObject[name].join(',')})`
    })
    if (time > dominantLanguage.value[1]){
        dominantLanguage.value = [name, time]
    }
}
const dominantColor = `rgb(${colorsObject[dominantLanguage.value[0]].join(',')})`

//I could do one pass but this is way cleaner and the performance wont be that imporant for our number of segments
segments.value.forEach(s => s.percentage = Math.round(s.time / timeSum.value * 100))
segments.value = segments.value.filter(s => s.percentage >= 1)

const hours = Math.floor(props.time / 3600);
const minutes = Math.floor((props.time % 3600) / 60);
const seconds = props.time % 60;
</script>
