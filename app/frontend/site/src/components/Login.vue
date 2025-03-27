<script setup lang="ts">
import { ref } from 'vue';
import PasswordInput from './PasswordInput.vue';
import EmailInput from './EmailInput.vue';

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
    <EmailInput v-model="email"></EmailInput>
    <PasswordInput v-model="password"></PasswordInput>
    <input 
        class="bg-transparent text-white border border-white w-full h-10 rounded-md hover:bg-white hover:text-black transition duration-200 cursor-pointer"
        type="submit" 
        value="Login"
    >
    <div class="text-center">
        <p class="text-white underline">
            <router-link to="/register" class="cursor-pointer">No account yet?</router-link>
        </p>
    </div>
    </form>
  </div>
</template>
