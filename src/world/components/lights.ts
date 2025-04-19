import * as THREE from 'three'
import { config } from '../../config.js'
import { Helpers } from '../../types.js'

const createLights = (): { lights: THREE.Light[], lightHelpers: Helpers[] } => {
    const lights: THREE.Light[] = []
    const lightHelpers: Helpers[] = []

    // Ambient Light
    const ambientLightConf = config.ambientLight
    const ambientLight = new THREE.AmbientLight(ambientLightConf.color, ambientLightConf.intensity)

    // Moon Light (Directional)
    const moonLightConf = config.moonLight
    const moonLight = new THREE.DirectionalLight(moonLightConf.color, moonLightConf.intensity)
    moonLight.position.set(
        moonLightConf.position.x,
        moonLightConf.position.y,
        moonLightConf.position.z
    )
    const moonLightHelper = new THREE.DirectionalLightHelper(moonLight)
    moonLightHelper.name = "Moon Light Helper"
    
    // House Light (Point)
    const houseLightConf = config.houseLight
    const houseLight = new THREE.PointLight(
        houseLightConf.color,
        houseLightConf.intensity,
        houseLightConf.distance
    )
    houseLight.position.set(
        houseLightConf.position.x +0.6,
        houseLightConf.position.y + 0.2,
        houseLightConf.position.z - 1.5
    )
    const houseLightHelper = new THREE.PointLightHelper(houseLight)
    houseLightHelper.name = 'Door Light Helper'

    // Ghost Lights (Point)
    const ghostLight1Conf = config.ghost1
    const ghostLight2Conf = config.ghost2
    const ghostLight3Conf = config.ghost3
    const ghostLight1 = new THREE.PointLight(
        ghostLight1Conf.color,
        ghostLight1Conf.intensity,
    )
    ghostLight1.name = "ghostLight1"
    const ghostLight2 = new THREE.PointLight(
        ghostLight2Conf.color,
        ghostLight2Conf.intensity
    )
    ghostLight2.name = "ghostLight2"
    const ghostLight3 = new THREE.PointLight(
        ghostLight3Conf.color,
        ghostLight3Conf.intensity
    )
    ghostLight3.name = "ghostLight3"

    if (config.shadows.enabled) {
        // Moonlight (Directional)
        moonLight.castShadow = true
        moonLight.shadow.mapSize.width = config.shadows.mapSize ?? 256
        moonLight.shadow.mapSize.height = config.shadows.mapSize ?? 256
        moonLight.shadow.camera.near =  1
        moonLight.shadow.camera.far = 20
        moonLight.shadow.camera.top = 8
        moonLight.shadow.camera.right = 8
        moonLight.shadow.camera.bottom = -8
        moonLight.shadow.camera.left = -8

        // House Light (Point)
        houseLight.castShadow = true
        houseLight.shadow.mapSize.width = config.shadows.mapSize ?? 256
        houseLight.shadow.mapSize.height = config.shadows.mapSize ?? 256
        houseLight.shadow.camera.far = 10

        // Ghost Lights (Point)
        ghostLight1.castShadow = true
        ghostLight2.castShadow = true
        ghostLight3.castShadow = true
        ghostLight1.shadow.mapSize.width = config.shadows.mapSize ?? 256
        ghostLight2.shadow.mapSize.width = config.shadows.mapSize ?? 256
        ghostLight3.shadow.mapSize.width = config.shadows.mapSize ?? 256
        ghostLight1.shadow.mapSize.height = config.shadows.mapSize ?? 256
        ghostLight2.shadow.mapSize.height = config.shadows.mapSize ?? 256
        ghostLight3.shadow.mapSize.height = config.shadows.mapSize ?? 256
        ghostLight1.shadow.camera.far = 10
        ghostLight2.shadow.camera.far = 10
        ghostLight3.shadow.camera.far = 10
    }
    lights.push(ambientLight, moonLight, houseLight, ghostLight1, ghostLight2, ghostLight3)
    lightHelpers.push(houseLightHelper, moonLightHelper)

    return {lights, lightHelpers}
}

export { createLights }