<template>
  <nav text-2xl inline-flex gap-2>
    <button 
      icon-btn
      @click="toggleDark()"
    >
      <div i-carbon-sun dark:i-carbon-moon />
    </button>
    <a
      href="https://github.com/liys15"
      target="_blank"
      title="GitHub"
      i-carbon-logo-github
    />
  </nav>
</template>

<script setup lang="ts">
import { toggleDark } from '~/composables';
</script>