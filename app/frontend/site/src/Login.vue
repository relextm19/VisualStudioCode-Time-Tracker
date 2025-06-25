<script setup lang="ts">
//check if user is already authenticated if yes go to home page
checkAuth();

import { ref } from 'vue';
import { watch } from 'vue';
import router from '@/router';
import EmailInput from './components/EmailInput.vue';
import PasswordInput from './components/PasswordInput.vue';

const email = ref('');
const password = ref('');

const passwordInput = ref<InstanceType<typeof PasswordInput> | null>(null);
const emailInput = ref<InstanceType<typeof EmailInput> | null>(null);

const errorVisible = ref(false);

function clearErrorVisibility() {
  errorVisible.value = false;
}

watch(errorVisible, ()=>{
  if (errorVisible.value) {
    emailInput.value?.displayError();
    passwordInput.value?.displayError();
  } else {
    emailInput.value?.clearError();
    passwordInput.value?.clearError();
  }
});

async function handleSubmit() {
  try{
    const response = await fetch('api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    if (response.ok){
      router.push('/');
    } else{
      errorVisible.value = true;
    }
  } catch(error){
    console.error("Error during login:", error);
  }
}

async function checkAuth() {
  try {
    const response = await fetch('/authorized', {
      credentials: 'include',
    });
    if (response.ok) {
      router.push('/');
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
  }
}

</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <form 
        class="bg-black h-3/5 w-full max-w-xs p-8 rounded-lg shadow-lg flex flex-col justify-evenly border border-white"
        @submit.prevent="handleSubmit"
    >
    <h1 class="text-white text-3xl font-bold text-center">LOGIN</h1>
    <EmailInput v-model="email" ref="emailInput" @focus="clearErrorVisibility"></EmailInput>
    <PasswordInput v-model="password" ref="passwordInput" @focus="clearErrorVisibility"></PasswordInput>
    <div class=" text-red-500 text-center"
         v-if="errorVisible"
    >
      <p>
        Invalid credentials
      </p>
    </div>
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
