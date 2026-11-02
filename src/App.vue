<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gov-surface flex flex-col font-sans text-gov-text-primary antialiased">
    <AppHeader />
    <div class="flex-1">
      <router-view />
    </div>
  </div>
</template>
