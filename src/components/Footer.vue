<script setup lang="ts">
import { toggleDark } from '~/composables'
</script>

<template>
  <nav text-2xl inline-flex gap-2>
    <button icon-btn bg-transparent @click="toggleDark()">
      <div i-carbon-sun dark:i-carbon-moon />
    </button>
    <a
      ref="noreferrer" icon-btn i-carbon-logo-github
      href="https://github.com/liys15"
      target="_blank"
      title="GitHub"
    />
  </nav>
</template>
