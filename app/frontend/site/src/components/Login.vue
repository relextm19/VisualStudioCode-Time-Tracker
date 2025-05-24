<script setup lang="ts">
import { ref } from 'vue';
import { watch } from 'vue';
import PasswordInput from './PasswordInput.vue';
import EmailInput from './EmailInput.vue';
import router from '@/router';

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
    const response = await fetch('http://localhost:8080/login', {
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

</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <form 
        class="bg-black h-2/5 w-full max-w-xs p-8 rounded-lg shadow-lg flex flex-col justify-evenly border border-white"
        @submit.prevent="handleSubmit"
    >
    <h1 class="text-white text-3xl font-bold text-center">LOGIN</h1>
    <EmailInput v-model="email" ref="emailInput" @focus="clearErrorVisibility"></EmailInput>
    <PasswordInput v-model="password" ref="passwordInput" @focus="clearErrorVisibility"></PasswordInput>
    <div class=" text-red-500 text-center overflow-visible"
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
