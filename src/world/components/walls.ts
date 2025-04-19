import * as THREE from 'three'
import { config } from '../../config.js'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'
import { createCustomHouse } from '../helpers/createCustomHouse.js'

function createWalls(): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    const wallsConfig ={ walls: config.house, door: config.door }
    const geometry = createCustomHouse(
        wallsConfig.walls.width,
        wallsConfig.walls.height,
        wallsConfig.walls.depth,
        wallsConfig.door.width,
        wallsConfig.door.height,
        1.0,
        1.0,
        1.0,
        0
    )
    const material = createMaterialFromConfig(config.house.material, geometry)
    const customHouseMesh = new THREE.Mesh(geometry, material)

    customHouseMesh.name = 'customHouse'
    customHouseMesh.castShadow = config.shadows.enabled
    customHouseMesh.receiveShadow = config.shadows.enabled

    return customHouseMesh
}

export { createWalls }