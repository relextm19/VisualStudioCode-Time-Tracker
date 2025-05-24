<template>
    <div class="w-full h-10 relative">
        <input 
            class="bg-black text-white h-full w-full rounded-md px-3 border focus:outline-none focus:shadow transition duration-200"
            :class="hasError ? ['border-red-500', 'shadow-red-500'] : ['border-white', 'shadow-white']"
            :type="showPassword ? 'text' : 'password'" 
            :placeholder="props.placeholder"
            v-model="model"
            @focus="focusHandler"
            ref="input"
        >
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white w-5" @click="showPassword = !showPassword">
            <img 
                src="../assets/eye-crossed.png" alt="eye" 
                v-if="!showPassword"
                :class="hasError ? 'eye-error' : 'filter invert'"
            >
            <img 
                src="../assets/eye.png" alt="eye" 
                :class="hasError ? 'eye-error' : 'filter invert'"
                v-else
            >
        </button>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    placeholder: {
        type: String,
        default: 'Password'
    },
});

const emit = defineEmits(['focus']);

function focusHandler() {
    emit('focus');
}

const showPassword = ref(false);
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
    hasError: () => hasError.value,
});
</script>

<style scoped>
.eye-error {
    filter: invert(22%) sepia(100%) saturate(7154%) hue-rotate(357deg) brightness(94%) contrast(118%);
}
</style>