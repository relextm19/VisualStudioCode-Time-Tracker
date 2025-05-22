<template>
    <input 
        class="bg-black text-white w-full h-10 rounded-md px-3 border focus:outline-none focus:shadow focus:scale-101 transition duration-200"
        :class="hasError ? ['border-red-500', 'shadow-red-500'] : ['border-white', 'shadow-white']"
        type="email" 
        placeholder="Email"
        v-model="model"
        ref="input"
    >
</template>
<script setup lang="ts">
import { ref } from 'vue';

const model = defineModel<string>();

const input = ref<HTMLInputElement | null>(null);
const hasError = ref(false);

function displayError() {
    hasError.value = true;
}

function clearError() {
    hasError.value = false;
}

defineExpose({
    displayError,
    clearError,
});
</script>