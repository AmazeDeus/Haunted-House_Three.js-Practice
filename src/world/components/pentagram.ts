import * as THREE from 'three'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'
import { config } from '../../config.js'

function createPentagram(): THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial> {
    const pentagramConfig = config.pentagram
    const geometry = new THREE.CircleGeometry(
        pentagramConfig.radius,
    )
    const material = createMaterialFromConfig(pentagramConfig.material, geometry)

    const pentagram = new THREE.Mesh(geometry, material)
    pentagram.name = 'pentagram'
    pentagram.position.z = -1.7
    pentagram.position.y = 1.35

    return pentagram
}

export { createPentagram }