<template>
  <div id="cesiumContainer"></div>
  <div class="toolbar">
    <select name="" id="dropdown" @change="handleOnchange" ref="selectRef">
      <option value="snow">雪</option>
      <option value="rain">雨</option>
      <option value="fog">雾</option>
      <option value="time">白天/黑夜</option>
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
  Viewer,
  Cartesian2,
  PostProcessStage,
} from "cesium";

const position: Cartesian3 = Cesium.Cartesian3.fromDegrees(
  111.7098183303903,
  16.584112843338676,
  2000
);

const selectRef = ref<HTMLSelectElement>();
let handleOnchange: () => void;

interface particleOptionType {
  viewer: Viewer;
  url?: string;
  speed?: [number, number];
  position?: Cartesian3;
  fly?: Boolean;
  emissionRate?: number;
  snowRadius?: number;
  minimumSnowImageSize?: Cartesian2;
  maximumSnowImageSize?: Cartesian2;
}
function renderParticle({
  viewer,
  url = "/雪花.png",
  speed = [10, 50],
  position = Cesium.Cartesian3.fromDegrees(
    111.7098183303903,
    16.584112843338676,
    2000
  ),
  fly = false,
  snowRadius = 3000.0,
  emissionRate = 100.0,
  minimumSnowImageSize = new Cesium.Cartesian2(10, 10),
  maximumSnowImageSize = new Cesium.Cartesian2(20, 20),
}: particleOptionType) {
  function snowUpdate(particle: Particle) {
    //计算提供的笛卡尔坐标系的标准化形式
    /**
     * @param 参数1 ----要标准化的笛卡尔坐标
     * @param 参数2 ----结果存储对象
     */
    Cesium.Cartesian3.normalize(particle.position, snowGravityScratch);
    Cesium.Cartesian3.multiplyByScalar(
      snowGravityScratch, //要缩放的笛卡尔坐标
      Cesium.Math.randomBetween(-speed[0], -speed[1]), //要与之相乘的标量，负值代表例子位置下降，即例子从上往下落
      snowGravityScratch
    );
    Cesium.Cartesian3.add(
      particle.position,
      snowGravityScratch,
      particle.position
    );
  }

  // var point: Entity = viewer.entities.add({
  //   // 定位点
  //   position,
  //   // 点
  //   point: {
  //     pixelSize: 10,
  //     color: Cesium.Color.RED,
  //     outlineColor: Cesium.Color.WHITE,
  //     outlineWidth: 4,
  //   },
  // });
  const modelMatrix: Matrix4 = Cesium.Matrix4.fromTranslation(position);
  //创建Cartesian3对象，用于在粒子系统回调函数中动态更新例子的位置
  const snowGravityScratch = new Cesium.Cartesian3();
  type ParticleSystemType = ConstructorParameters<typeof ParticleSystem>[0];
  const snowOption: ParticleSystemType = {
    modelMatrix: modelMatrix,
    lifetime: 15.0,
    emitter: new Cesium.SphereEmitter(snowRadius),
    startScale: 0.5,
    endScale: 1.0,
    image: url,
    emissionRate: emissionRate,
    startColor: Cesium.Color.WHITE.withAlpha(1.0),
    endColor: Cesium.Color.WHITE.withAlpha(0.5),
    minimumImageSize: minimumSnowImageSize,
    maximumImageSize: maximumSnowImageSize,
    updateCallback: snowUpdate,
  };
  const particle = new Cesium.ParticleSystem(snowOption);
  viewer.scene.primitives.add(particle);
  if (fly) {
    viewer.camera.flyTo({
      destination: position,
    });
  }

  return particle;
}

const fogShader = `
#version 300 es
precision highp float;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
in vec2 v_textureCoordinates;
out vec4 fragColor;  // 片段着色器的输出变量
void main(void)
{
  vec4 origcolor = texture(colorTexture, v_textureCoordinates);
  vec4 fogcolor = vec4(0.8, 0.8, 0.8, 0.5);

  float depth = czm_readDepth(depthTexture, v_textureCoordinates);
  vec4 depthcolor = texture(depthTexture, v_textureCoordinates);

  float f = (depthcolor.r - 0.22) / 0.8;  // 0.7 调节雾的可见度
  if (f < 0.0) f = 0.0;
  else if (f > 1.0) f = 1.0;

  fragColor = mix(origcolor, fogcolor, f);  // 将颜色赋值给输出变量
}
`;
let fogStage: PostProcessStage;

let particle: ParticleSystem;
const windVisualizationShader = `
uniform sampler2D colorTexture;//输入的场景渲染照片
  in vec2 v_textureCoordinates;

  float hash(float x){
       return fract(sin(x*133.3)*13.13);
  }

  void main(void){

      float time = czm_frameNumber / 60.0;
      vec2 resolution = czm_viewport.zw;

      vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
      vec3 c=vec3(.6,.7,.8);

      float a=-.4;
      float si=sin(a),co=cos(a);
      uv*=mat2(co,-si,si,co);
      uv*=length(uv+vec2(0,4.9))*.3+1.;

      float v=1.-sin(hash(floor(uv.x*100.))*2.);
      float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
      c*=v*b; //屏幕上雨的颜色

      gl_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), 0.5); //将雨和三维场景融合
  }
`
onMounted(async () => {
  const terrainModel = await Cesium.createWorldTerrainAsync();
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    shouldAnimate: true,
    terrainProvider: terrainModel,
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  
  // const nightVisionStage =
  //   Cesium.PostProcessStageLibrary.createBlackAndWhiteStage();
  // viewer.postProcessStages.add(nightVisionStage);

  // let FogStage = Cesium.PostProcessStageLibrary.createBrightnessStage();
  // FogStage.uniforms.brightness = 0.3; //整个场景通过后期渲染变亮 1为保持不变 大于1变亮 0-1变暗 uniforms后面为对应glsl里面定义的uniform参数

  // const nightVisionStage =
  //   Cesium.PostProcessStageLibrary.createNightVisionStage();
  // viewer.postProcessStages.add(nightVisionStage);
  // FogStage.enabled = true;

  const windStage = new Cesium.PostProcessStage({
    name: 'windVisualization',
    fragmentShader: windVisualizationShader,
  });
  viewer.postProcessStages.add(windStage);

  handleOnchange = () => {
    switch (selectRef.value?.value) {
      case "snow":
        if (particle) {
          viewer.scene.primitives.remove(particle);
        }
        particle = renderParticle({
          viewer,
          fly: true,
          speed: [1, 10],
          emissionRate: 50,
        });
        console.log(particle)
        break;
      case "rain":
        if (particle) {
          viewer.scene.primitives.remove(particle);
        }
        particle = renderParticle({
          viewer,
          url: "/雨滴.png",
          speed: [50, 100],
          fly: true,
        });
        console.log(particle)
        break;
      case "fog":
        fogStage = new Cesium.PostProcessStage({
          name: "fog",
          //sampleMode:PostProcessStageSampleMode.LINEAR,
          fragmentShader: fogShader,
        });
        viewer.scene.postProcessStages.add(fogStage);
        break;
      case "time":
        viewer.scene.globe.enableLighting = true;
        break;
      case "null":
        if (particle) {
          viewer.scene.primitives.remove(particle);
        }
        if (
          viewer.scene.postProcessStages._stages.some(
            (item: any) => item._name === "fog"
          )
        ) {
          viewer.scene.postProcessStages.remove(fogStage);
        }
        viewer.scene.globe.enableLighting = false;
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
