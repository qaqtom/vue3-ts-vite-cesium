<template>
  <div id="cesiumContainer"></div>
  <div class="heightAdjustDiv">
    <label style="color: white">高度</label>
    <br />
    <input
      type="range"
      min="-100"
      max="100"
      step="2"
      @input="changeRange"
      ref="rangeRef"
      value="0"
    />
    <input
      type="text"
      style="width: 70px"
      ref="textRef"
      value="0"
      @change="changeText"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import type { Cesium3DTileset } from "cesium";
const rangeRef = ref<HTMLInputElement>();
const textRef = ref<HTMLInputElement>();

let changeRange: () => void;
let changeText: () => void;

onMounted(async () => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    shouldAnimate: true,
  });
  // viewer.scene.globe.depthTestAgainstTerrain = true;
  const modelMatrix = Cesium.Matrix4.fromArray([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);

  const tileset: Cesium3DTileset = await Cesium.Cesium3DTileset.fromUrl(
    "/data/d1/tileset.json",
    { modelMatrix,skipLevels:0,showCreditsOnScreen:true,debugShowBoundingVolume:true }
  );
  viewer.scene.primitives.add(tileset)
  viewer.zoomTo(tileset);
  // 获取tileset的外包围球中心点
  // const boundingSphere = tileset.boundingSphere;
  // console.log(boundingSphere);
  // const center = boundingSphere.center;

  // // 将相机飞到模型周围
  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.add(
  //     center,
  //     new Cesium.Cartesian3(0, 0, 0),
  //     new Cesium.Cartesian3()
  //   ), // 向上或侧面偏移一点
  //   duration: 2, // 飞到的动画时长
  //   orientation: {
  //     heading: Cesium.Math.toRadians(0),
  //     pitch: Cesium.Math.toRadians(-90),
  //     roll: 0,
  //   },
  // });

  changeRange = () => {
    let height = Number(rangeRef.value!.value);
    textRef.value!.value = height + "";
    if (isNaN(height)) {
      return;
    }
    //将3dTile模型的外包围中心点从笛卡尔空间直角坐标转换为弧度表示
    const cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center //外包围球中心点
    );
    //中心原始坐标
    const surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude
    );
    const offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      height
    );
    //计算两个笛卡尔分量的差异
    const translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  };

  changeText = () => {
    let height = Number(textRef.value!.value);
    rangeRef.value!.value = height + "";
    changeRange();
  };
});
</script>
<style>
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
