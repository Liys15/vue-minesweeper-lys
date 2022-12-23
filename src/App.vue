<script setup lang="ts">
import Footer from './components/Footer.vue'
import Minesweeper from './components/Minesweeper.vue'
</script>

<template>
  <p>Minesweeper</p>
  
  <Minesweeper />

  <Footer />
</template>

<style>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
