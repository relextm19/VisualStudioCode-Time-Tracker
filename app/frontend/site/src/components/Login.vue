<script setup lang="ts">

</script>

<template>
    <div class="flex justify-center items-center h-screen">
        <form class="bg-zinc-950 w-3/10 h-3/5 rounded-lg shadow-md shadow-gray-500 flex flex-col justify-center items-center gap-15" action="">
            <h1 class="text-white text-2xl">Welcome!</h1>
            <img src="../assets/logo.png" alt="" class="w-40 h-25">
            <input class="bg-white w-7/10 h-8 rounded-md shadow-md shadow-gray-500 transition-all duration-200 focus:outline-none focus:-translate-y-0.25 focus:w-71/100" type="email" placeholder="Email">
            <input class="bg-white w-7/10 h-8 rounded-md shadow-md shadow-gray-500 transition-all duration-200 focus:outline-none focus:-translate-y-0.25 focus:w-71/100" type="password" placeholder="Password">
            <input class="bg-none text-white border border-white w-2/10 h-8 rounded-md shadow-md shadow-gray-500 cursor-pointer transition-all duration-200 hover:text-black hover:bg-white" type="submit" value="Login">
        </form>
    </div>
</template>
