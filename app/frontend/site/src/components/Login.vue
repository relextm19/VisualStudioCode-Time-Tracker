<script setup lang="ts">
</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <form class="bg-black h-1/3 w-full max-w-xs p-8 rounded-lg shadow-lg flex flex-col justify-evenly gap-6 border border-white" action="">
      <h1 class="text-white text-3xl font-bold text-center">LOGIN</h1>
      <img src="../assets/logo2.png" alt="Logo" class="mx-auto w-32 h-auto">
      <input 
        class="bg-black text-white w-full h-10 rounded-md px-3 border border-white focus:outline-none focus:shadow focus:scale-101 shadow-white transition duration-200"
        type="email" 
        placeholder="Email">
      <input 
        class="bg-black text-white w-full h-10 rounded-md px-3 border border-white focus:outline-none focus:shadow shadow-white transition duration-200"
        type="password" 
        placeholder="Password">
      <input 
        class="bg-transparent text-white border border-white w-full h-10 rounded-md hover:bg-white hover:text-black hover:scale-101 transition duration-200 cursor-pointer"
        type="submit" 
        value="Login">
    </form>
  </div>
</template>
