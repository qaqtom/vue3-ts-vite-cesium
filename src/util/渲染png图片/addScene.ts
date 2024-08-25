import type { Viewer } from "cesium"
import axios from "axios"
import { Resource } from 'cesium'
import { name2clr_arr, name2clr } from './color'
import single_VolumeRenderingPrimitive from './single_VolumeRenderingPrimitive.js'

interface option{
    viewer: Viewer,
    url: string,
    time: string,
    colorRange: string,
    colorBarConfig:any
}

export async function addScene(options: option) {
    let response = await axios.get(`${options.url}/${options.time}.json`)

    let jsonData = response.data

    let image = await Resource.fetchImage({ url: `${options.url}/${options.time}.png` })

    // let colorScheme = url.lastIndexOf('SSS') == -1 ? name2clr_arr('panoply') : name2clr_arr('lightblue')
    // let colors = url.lastIndexOf('SSS') == -1 ? name2clr('panoply') : name2clr('lightblue')

    let colorScheme = name2clr_arr(options.colorRange)
    let colors = name2clr(options.colorRange)

    let primitive = new single_VolumeRenderingPrimitive(options.viewer.scene, {
        data: image,
        show: true,
        valueFilter: {
            vmax: jsonData.maxVal[0],
            vmin: jsonData.minVal[0],
        },
        colorScheme: colorScheme,
        height: 0.01,
        xGridSize: jsonData.xLen[0],
        yGridSize: jsonData.yLen[0],
        xInterval: jsonData.xCell[0],
        yInterval: -jsonData.yCell[0],
        xLength: jsonData.xLen[0] * jsonData.xCell[0],
        yLength: -jsonData.yLen[0] * jsonData.yCell[0],
        originX: jsonData.xOri[0],
        originY: jsonData.yOri[0],
    })

    options.colorBarConfig.value = {
        colors: Object.assign([], colors),
        max: jsonData.maxVal[0],
        min: jsonData.minVal[0],
        unit: jsonData.unit[0],
    }

    return options.viewer.scene.primitives.add(primitive)
}