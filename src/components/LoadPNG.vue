<template>
  <div id="cesiumContainer"></div>
  <!-- <div class="heightAdjustDiv">
    <label for="opacityRange">透明度: {{ opacity }}</label>
    <input
      type="range"
      ref="rangeRef"
      @input="changeRange"
      step="0.1"
      min="0"
      max="1"
      v-model="opacity"
    />
  </div> -->
  <ColorLegend id="legend" v-if="legendVisible" :colors="colorBarConfig.colors" :max="colorBarConfig.max"
    :min="colorBarConfig.min" :unit="colorBarConfig.unit"></ColorLegend>
  <button @click="clickBtn" style="position: absolute;left: 20px;top: 20px;">惦记我</button>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import * as Cesium from "cesium";
import { addScene } from '../util/渲染png图片/addScene'
import ColorLegend from './ColorLegend.vue'
// const opacity = ref(1); // 初始透明度为100%
// const rangeRef = ref<HTMLInputElement>();
// let changeRange: () => void;
let clickBtn: () => void;
interface ColorLegendType{
  colors: any,
  max: any,
  min: any,
  unit:any,
}
const colorBarConfig = ref<any>();
const legendVisible = ref(false)
onMounted(async () => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    shouldAnimate: true,
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // var rectangle = Cesium.Rectangle.fromDegrees(
  //   111.57948993195815,
  //   16.500079665760232,
  //   111.59048855917403,
  //   16.51180598318943
  // );
  // viewer.imageryLayers.addImageryProvider(
  //   new Cesium.SingleTileImageryProvider({
  //     url: "/data/png渲染/png渲染.png",
  //     rectangle: rectangle,
  //     tileWidth: 1, // 假设图像宽度为512像素
  //     tileHeight: 1, // 假设图像高度为512像素
  //   })
  // );


  let primitive = await addScene({
    viewer,
    url: "/data/pngRender",
    time: "pngRender",
    colorRange: "ndvi",
    colorBarConfig
  })
  legendVisible.value = true
  console.log(primitive)

  // let addPolygon = {
  //   id: "Polygon",
  //   name: "面",
  //   show: true,
  //   polygon: {
  //     hierarchy: Cesium.Cartesian3.fromDegreesArray([
  //       111.57948993195815, 16.500079665760232, 111.59048855917403,
  //       16.500079665760232, 111.59048855917403, 16.51180598318943,
  //       111.57948993195815, 16.51180598318943,
  //     ]),
  //     material: new Cesium.ImageMaterialProperty({
  //       image: "./data/demo.png",
  //       repeat: new Cesium.Cartesian2(1.0, 1.0),
  //       color: Cesium.Color.WHITE.withAlpha(1.0), // 确保 alpha 值正确
  //       transparent: true,
  //     }),
  //   },
  // };

  // viewer.entities.add(addPolygon);

  clickBtn = () => {
    viewer.scene.primitives.remove(primitive);
  }
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      111.58533190138678,
      16.505387202863883,
      3000
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0.0), // 朝向
      pitch: Cesium.Math.toRadians(-90.0), // 俯仰
      roll: 0.0,
    },
    duration: 2.0, // 飞行持续时间，单位：秒
  });

  // changeRange = () => {
  //   let alpha = Number(rangeRef.value!.value);
  //   addPolygon.polygon.material.color = Cesium.Color.WHITE.withAlpha(alpha);
  // };

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event: any) => {
    const Cartesian3 = viewer.scene.pickPosition(event.position);

    if (Cartesian3) {
      const cartographic = Cesium.Cartographic.fromCartesian(Cartesian3);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      // 打印经纬度
      console.log(`经度: ${longitude}, 纬度: ${latitude}`);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
});
</script>
<style>
.heightAdjustDiv {
  position: absolute;
  top: 10px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  color: white;
  /* 文字颜色为白色以便在深色背景上可见 */
}

#cesiumContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.heightAdjustDiv {
  position: absolute;
  top: 10px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
