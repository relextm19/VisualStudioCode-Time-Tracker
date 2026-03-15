<template>
    <router-link 
        v-if="shouldRender"
        :to="to" 
        class="relative px-1 py-2 text-lg font-medium transition-colors duration-200 hover:text-gray-300"
        :class="{ 'after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-white': isActive}"
    >
        {{ text }} 
    </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
    text: string,
    to: string
}>();

const route = useRoute();
const router = useRouter()
const routeObject = computed(() => router.getRoutes().find((r) => r.path == props.to))
const shouldRender = computed(() => !routeObject.value?.meta.public)
const isActive = computed(() => route.path == props.to)

</script>
