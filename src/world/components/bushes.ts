import * as THREE from 'three'
import { config, sharedGeometries } from '../../config.js'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'
import { TranslationConfig } from '../../types.js'

const transformBush = (
    bushConfig: TranslationConfig,
    geometry: THREE.SphereGeometry,
    material: THREE.MeshStandardMaterial
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> => {
    const bush = new THREE.Mesh(geometry, material)
    typeof bushConfig.scale == 'number'
        ? bush.scale.setScalar(bushConfig.scale)
        : bush.scale.set(bushConfig.scale?.x ?? 1, bushConfig.scale?.y ?? 1, bushConfig.scale?.z ?? 1)

    bush.position.set(
        bushConfig.position?.x ?? 0,
        bushConfig.position?.y ?? 0,
        bushConfig.position?.z ?? 0
    )
    bush.rotation.set(
        bushConfig.rotation?.x ?? 0,
        bushConfig.rotation?.y ?? 0,
        bushConfig.rotation?.z ?? 0
    )
    // bush.castShadow = config.shadows.enabled
    return bush
}

function createBushes(group: THREE.Group): void {
    const bushConfig = config.bush
    const geometry = sharedGeometries.bushGeometry
    const material = createMaterialFromConfig(bushConfig.material, geometry)

    bushConfig.positions.forEach(bushConf => {
        const bush = transformBush(bushConf, geometry, material)
        group.add(bush)
    })
}

export { createBushes }