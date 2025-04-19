import * as THREE from 'three'
import { createPhysicalMaterialFromConfig } from '../helpers/createPhysicalMaterialFromConfig.js'
import { config } from '../../config.js'
import { HOUSE_CONSTANTS } from '../../constants.js'

const { DEFAULT_DEPTH, DEFAULT_WINDOW_BOTTOM_Y, DEFAULT_WALL_THICKNESS } = HOUSE_CONSTANTS

const createWindow = (): THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> => {
    const windowConfig = config.window
    const geometry = new THREE.BoxGeometry(
        windowConfig.width,
        windowConfig.height,
        windowConfig.depth
    )
    const material = createPhysicalMaterialFromConfig(windowConfig.material, geometry)

    const window = new THREE.Mesh(geometry, material)

    window.rotation.y = Math.PI / 2 // Perpendicular
    window.position.y = DEFAULT_WINDOW_BOTTOM_Y + windowConfig.height / 2
    window.position.x = DEFAULT_DEPTH / 2 - DEFAULT_WALL_THICKNESS / 2

    // Manually set renderOrder for "window" and "floor"
    // When rendering transparent objects, always render the floor before the window.
    // If not manually set, the floor becomes invisible when looking through the window from inside
    window.renderOrder = 1

    return window
}

export { createWindow }