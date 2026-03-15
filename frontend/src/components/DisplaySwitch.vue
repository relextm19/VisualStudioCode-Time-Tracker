<template>
    <div class="w-fit rounded-2xl flex justify-items-center gap-2 border-2 ml-4 border-white relative overflow-hidden cursor-pointer">
        <!-- -left to fix a small gap between border and background -->
        <div 
            class="absolute bg-white w-[calc(50%+0.5rem)] h-full rounded-2xl pointer-events-none transition-transform duration-200 ease-out"
            :class="props.showLanguages ? '-left-0.5' : 'translate-x-full'" 
        ></div>
        <span 
            :class="showLanguages ? 'text-black' : 'text-white'"
            class="p-1 flex-1 text-center z-10 select-none"
            @click="emit('update:showLanguages', true)"
        >Languages</span>
        <span 
            :class="props.showLanguages ? 'text-white' : 'text-black'"
            class="p-1 flex-1 z-10 text-center select-none"
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
