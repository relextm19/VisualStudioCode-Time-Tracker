<template>
    <div class="w-min rounded-2xl flex justify-items-center gap-2 border-2 ml-4 border-white relative">
        <div 
            class="absolute bg-white w-1/2 h-full rounded-2xl pointer-events-none transition-transform duration-200 ease-out"
            :class="props.showLanguages ? '' : 'translate-x-full'"
        ></div>
        <span 
            :class="showLanguages ? 'text-black' : 'text-white'"
            class="p-0.5 z-10"
            @click="emit('update:showLanguages', true)"
        >Languages</span>
        <span 
            :class="props.showLanguages ? 'text-white' : 'text-black'"
            class="p-0.5 z-10"
            @click="emit('update:showLanguages', false)"
        >Projects</span>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        showLanguages: boolean
    }>();
    
    const emit = defineEmits<{
        (e: 'update:showLanguages', value: boolean): void
    }>()
</script>
