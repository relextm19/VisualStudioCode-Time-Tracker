<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const handleSubmit = () => {
  console.log('Email:', email.value, 'Password:', password.value);  
}

</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <form 
        class="bg-black h-1/3 w-full max-w-xs p-8 rounded-lg shadow-lg flex flex-col justify-evenly gap-6 border border-white"
        @submit.prevent="handleSubmit"
    >
    <h1 class="text-white text-3xl font-bold text-center">LOGIN</h1>
    <img src="../assets/logo2.png" alt="Logo" class="mx-auto w-32 h-auto">
    <input 
        class="bg-black text-white w-full h-10 rounded-md px-3 border border-white focus:outline-none focus:shadow focus:scale-101 shadow-white transition duration-200"
        type="email" 
        placeholder="Email"
        v-model="email"
    >
    <div class="w-full h-10 relative">
        <input 
            class="bg-black text-white h-full w-full rounded-md px-3 border border-white focus:outline-none focus:shadow shadow-white transition duration-200"
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Password"
            v-model="password"
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
    <input 
        class="bg-transparent text-white border border-white w-full h-10 rounded-md hover:bg-white hover:text-black transition duration-200 cursor-pointer"
        type="submit" 
        value="Login"
    >
    <div class="text-center">
        <p class="text-white underline">
            No account yet?
        </p>
    </div>
    </form>
  </div>
</template>
