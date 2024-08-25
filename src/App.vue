<script setup>
import Load3dTiles from "./components/Load3dTiles.vue";
import RainAndSnow from "./components/RainAndSnow.vue";
import SnowGlobal from "./components/SnowGlobal.vue";
import loadPNG from "./components/LoadPNG.vue"
import loadTiff from './components/LoadTiff.vue'
</script>

<template>
  <!-- <Load3dTiles /> -->
  <!-- <RainAndSnow /> -->
  <!-- <SnowGlobal /> -->
  <loadPNG />
  <!-- <loadTiff /> -->
</template>


<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0px;
  padding: 0px;
}
</style>