<template>
  <router-view></router-view>
</template>

<script setup>
/**
 * App.vue ist jetzt nur noch der Container.
 * Die Logik für Authentifizierung sitzt im Router (src/router/index.js),
 * und das Design sitzt im Layout (src/components/Layout.vue).
 */
</script>

<style>
/* Hier kommen nur globale Basis-Styles rein */
:root {
  --bg-dark: #0b0e14;
  --bg-sidebar: #13161c;
  --accent: #00bcd4;
  --border: #1f2229;
  --text-muted: #707070;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif; /* Oder deine gewählte Schriftart */
}

body {
  background-color: var(--bg-dark);
  color: white;
  overflow: hidden; /* Verhindert doppeltes Scrollen neben der Content-Area */
}
</style>