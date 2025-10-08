<template>
    <TotalTimeDisplay :total-time="13002400"></TotalTimeDisplay>    
    <ProgressBar :progress="70"></ProgressBar>
</template>

<script setup lang="ts">
    import TotalTimeDisplay from './components/TotalTimeDisplay.vue';
    import ProgressBar from './components/ProgressBar.vue';
</script>