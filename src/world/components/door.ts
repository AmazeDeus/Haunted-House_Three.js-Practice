import { config } from '../../config.js'
import * as THREE from 'three'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'

function createDoor(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
    const doorConfig = config.door
    // Height/Displacement maps require more geometry segments to show detail
    const geometry = new THREE.PlaneGeometry(
        doorConfig.width,
        doorConfig.height,
        doorConfig.material.displacementMap ? 100 : 1,
        doorConfig.material.displacementMap ? 100 : 1,
    )
    const material = createMaterialFromConfig(doorConfig.material, geometry)

    const door = new THREE.Mesh(geometry, material)
    door.rotation.y = -50
    door.position.x = 0.02
    door.position.y = doorConfig.height / 2 + 0.3
    door.position.z = config.house.depth / 2 + 0.05
    door.castShadow = config.shadows.enabled
    // door.receiveShadow = config.shadows.enabled

    return door
}

export { createDoor }