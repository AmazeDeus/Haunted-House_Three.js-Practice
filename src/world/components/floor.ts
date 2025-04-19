import * as THREE from 'three'
import { config } from '../../config.js'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'

const createFloor = (): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> => {
    const floorConfig = config.floor
    const geometry = new THREE.PlaneGeometry(
        floorConfig.width,
        floorConfig.height,
        floorConfig.widthSegments,
        floorConfig.heightSegments
    )
    const material = createMaterialFromConfig(floorConfig.material, geometry)

    const floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -(Math.PI * 0.5)
    floor.receiveShadow = config.shadows.enabled

    // Manually set renderOrder for "window" and "floor"
    // When rendering transparent objects, always render the floor before the window.
    // If not manually set, the floor becomes invisible when looking through the window from inside
    floor.renderOrder = 0

    return floor
}

export { createFloor }