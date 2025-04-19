import * as THREE from 'three'
import { config } from '../../config.js'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'

function createGraves(): THREE.Group {
    const gravesGroup = new THREE.Group()
    const graveConfig = config.grave

    const geometry = new THREE.BoxGeometry(
        graveConfig.width, graveConfig.height, graveConfig.depth
    );
    const material = createMaterialFromConfig(graveConfig.material, geometry)

    for (let i = 0; i < config.grave.count; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = config.grave.minRadius + Math.random() * (config.grave.maxRadius - config.grave.minRadius)
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        const y = Math.random() * (config.grave.height * 0.4) - 0.3 // Slight sink/tilt offset

        const rotY = (Math.random() - 0.5) * 0.4
        const rotZ = (Math.random() - 0.5) * 0.4

        const grave = new THREE.Mesh(geometry, material)
        grave.position.set(x, y + config.grave.height * 0.5, z) // Adjusts y based on geometry origin
        grave.rotation.set(0, rotY, rotZ)
        grave.castShadow = config.shadows.enabled
        grave.receiveShadow = config.shadows.enabled

        gravesGroup.add(grave)
    }

    return gravesGroup
}

export { createGraves }