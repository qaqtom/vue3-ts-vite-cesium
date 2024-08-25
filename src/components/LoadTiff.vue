<template>
  <div id="cesiumContainer"></div>
  <button @click="handleClick" class="btn">惦记我</button>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import * as Cesium from "cesium";
let handleClick: () => void
onMounted(async () => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    shouldAnimate: true,
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;

  let provider = new Cesium.UrlTemplateImageryProvider({
    url: "/data/20231109/{z}/{x}/{y}.png",
  })

  
  
  let layer = new Cesium.ImageryLayer(provider)
  viewer.imageryLayers.layerAdded.addEventListener(function (layer) {
    console.log("图层已经成功加载到 viewer 中！");
  });
  viewer.imageryLayers.add(layer)

  handleClick = () => {
    if (layer) {
      viewer.imageryLayers.remove(layer)
      layer = null
    }
    let provider = new Cesium.UrlTemplateImageryProvider({
      url: "/data/20231109/{z}/{x}/{y}.png",
    })
    layer = new Cesium.ImageryLayer(provider)
    viewer.imageryLayers.add(layer)
    layer.colorToAlpha = Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.0)
    console.log(layer)
  } 
  // viewer.imageryLayers.remove(layer)


  // var localImage = viewer.scene.imageryLayers.addImageryProvider(
  //   new Cesium.UrlTemplateImageryProvider({
  //     url: "/data/20231109/{z}/{x}/{y}.png",
  //   })
  // );
  // console.log(localImage)
  // var rectangle = Cesium.Rectangle.fromDegrees(
  //   114.38004,
  //   30.51667,
  //   114.40471,
  //   30.53045
  // );
  layer.readyEvent.addEventListener(() => {
    console.log("hhh")
  })
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(115.803107, 10.732609, 1000),
    orientation: {
      heading: Cesium.Math.toRadians(0.0), // 朝向
      pitch: Cesium.Math.toRadians(-90.0), // 俯仰
      roll: 0.0,
    },
    duration: 2.0, // 飞行持续时间，单位：秒
  });

});
</script>
<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.btn{
  position: absolute;
  left: 50px;
  top: 50px;
}
</style>
