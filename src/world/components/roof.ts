import * as THREE from 'three'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'
import { createCustomConeGeometry } from '../helpers/createCustomConeGeometry.js'
import { config } from '../../config.js'

function createRoof(): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    const roofConfig = config.roof

    // Warn if the number of segments isn't 4, as the UVs and base are specifically designed for it
    if (roofConfig.segments !== 4) {
        console.warn("createCustomConeGeometry pyramid UV mapping is optimized for segments=4.")
        // TODO: Might want to default to 4 or handle other segment counts differently
    }

    // Create the custom pyramid geometry using the custom BufferGeometry function
    const geometry = createCustomConeGeometry(
        roofConfig.radius,
        roofConfig.height,
        roofConfig.segments // Should ideally be 4 based on the function's current logic
    )
    const material = createMaterialFromConfig(roofConfig.material, geometry)

    const roof = new THREE.Mesh(geometry, material)
    roof.name = 'roof'
    roof.position.y = config.house.height + config.roof.height / 2

    // For segments=4, rotating by PI/4 (45 degrees) aligns
    // the flat sides of the square base with the X and Z axes.
    // Without this, the corners would point along the axes.
    roof.rotation.y = Math.PI / roofConfig.segments // PI / 4 radians = 45 degrees

    roof.castShadow = config.shadows.enabled
    return roof
}

export { createRoof }