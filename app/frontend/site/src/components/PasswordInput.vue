<template>
    <div class="w-full h-10 relative">
        <input 
            class="bg-black text-white h-full w-full rounded-md px-3 border border-white focus:outline-none focus:shadow shadow-white transition duration-200"
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Password"
            v-model="model"
        >
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white w-5" @click="showPassword = !showPassword">
            <img 
                src="../assets/eye-crossed.png" alt="eye" 
                class="filter invert"
                v-if="!showPassword"
            >
            <img 
                src="../assets/eye.png" alt="eye" 
                class="filter invert"
                v-else="showPassword"
            >
        </button>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const showPassword = ref(false);
const model = defineModel<string>();
</script>