<template>
  <div id="cesiumContainer"></div>
  <div class="toolbar">
    <select name="" id="dropdown" @change="handleOnchange" ref="selectRef">
      <option value="snow">雪</option>
      <option value="rain">雨</option>
      <option value="null">null</option>
    </select>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import type {
  Cartesian3,
  Matrix4,
  ParticleSystem,
  Particle,
  Entity,
} from "cesium";


const position: Cartesian3 = Cesium.Cartesian3.fromDegrees(
  114.39664,
  30.52052,
  2000
);
const modelMatrix: Matrix4 = Cesium.Matrix4.fromTranslation(position);

const snowRadius: number = 100000.0; //下雪的半径
const minimumSnowImageSize = new Cesium.Cartesian2(10, 10); //雪花的最小尺寸
const maximumSnowImageSize = new Cesium.Cartesian2(20, 20); //雪花的最大尺寸

//创建Cartesian3对象，用于在粒子系统回调函数中动态更新例子的位置
const snowGravityScratch = new Cesium.Cartesian3();

function snowUpdate(particle: Particle) {
  //计算提供的笛卡尔坐标系的标准化形式
  /**
   * @param 参数1 ----要标准化的笛卡尔坐标
   * @param 参数2 ----结果存储对象
   */
  Cesium.Cartesian3.normalize(particle.position, snowGravityScratch);
  Cesium.Cartesian3.multiplyByScalar(
    snowGravityScratch, //要缩放的笛卡尔坐标
    Cesium.Math.randomBetween(-30.0, -300.0), //要与之相乘的标量，负值代表例子位置下降，即例子从上往下落
    snowGravityScratch
  );
  Cesium.Cartesian3.add(
    particle.position,
    snowGravityScratch,
    particle.position
  );
}

const selectRef = ref<HTMLSelectElement>();
let handleOnchange: () => void;

onMounted(async () => {
  const terrainModel =await Cesium.createWorldTerrainAsync()
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    shouldAnimate: true,
    terrainProvider:terrainModel
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;

  //生成点
  var point: Entity = viewer.entities.add({
    // 定位点
    position,
    // 点
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 4,
    },
  });

  //生成圆
  const redEllipse = viewer.entities.add({
    position,
    name: "Red ellipse on surface",
    ellipse: {
      semiMinorAxis: snowRadius,
      semiMajorAxis: snowRadius,
      material: new Cesium.StripeMaterialProperty({
        orientation: Cesium.StripeOrientation.VERTICAL,
        evenColor: Cesium.Color.WHITE,
        repeat: 16
      }),
      classificationType: Cesium.ClassificationType.BOTH,
      extrudedHeight:10000
    },
  });
  
  type ParticleSystemType = ConstructorParameters<typeof ParticleSystem>[0];
  const snowOption: ParticleSystemType = {
    modelMatrix: modelMatrix,
    lifetime: 15.0,
    emitter: new Cesium.SphereEmitter(snowRadius),
    startScale: 0.5,
    endScale: 1.0,
    image: "/雪花.png",
    emissionRate: 700.0,
    startColor: Cesium.Color.WHITE.withAlpha(0.0),
    endColor: Cesium.Color.WHITE.withAlpha(1.0),
    minimumImageSize: minimumSnowImageSize,
    maximumImageSize: maximumSnowImageSize,
    updateCallback: snowUpdate,
  };

  viewer.scene.primitives.add(new Cesium.ParticleSystem(snowOption));

  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(
      -2318006.1905,
      5016113.738321363,
      3239729.805279
    ),
  });

  handleOnchange = () => {
    switch (selectRef.value?.value) {
      case "snow":
        viewer.scene.primitives.removeAll();
        viewer.scene.primitives.add(new Cesium.ParticleSystem(snowOption));
        break;
      case "rain":
        viewer.scene.primitives.removeAll();
        viewer.scene.primitives.add(new Cesium.ParticleSystem(snowOption));
      case "null":
        viewer.scene.primitives.removeAll();
        break;
      default:
        break;
    }
  };
});
</script>
<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.toolbar {
  position: absolute;
  top: 10px;
  left: 20px;
  background: rgb(0, 0, 0, 0);
}
</style>
