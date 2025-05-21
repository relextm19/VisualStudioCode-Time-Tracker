<template>
    <div class="h-screen flex justify-center items-center">
      <div class="bg-black h-1/3 w-full max-w-md p-8 rounded-lg shadow-lg flex flex-col justify-center gap-6">
        <h1 class="text-white text-3xl font-bold text-center">Account Registration</h1>
        <p class="text-white text-center text-lg">To create an account, please download the extension from the Visual Studio Code marketplace and complete the setup process. The extension will guide you through the registration steps.</p>
        <div class="text-center">
            <p class="text-white underline">
                <router-link to="/login" class="cursor-pointer">Back to Login</router-link>
            </p>
            <p class="text-gray-400 text-center text-sm">Once your account is created, return here to log in and access your dashboard.</p>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>

  </style>
  