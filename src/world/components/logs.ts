import * as THREE from 'three'
import { config, sharedGeometries } from '../../config.js'
import { createMaterialFromConfig } from '../helpers/createMaterialFromConfig.js'
import { TranslationConfig } from '@/types.js'

const transformLog = (
    logConfig: TranslationConfig,
    geometry: THREE.CylinderGeometry,
    material: THREE.MeshStandardMaterial
): THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial> => {
    const log = new THREE.Mesh(geometry, material)

    typeof logConfig.scale == 'number'
        ? log.scale.setScalar(logConfig.scale)
        : log.scale.set(
            logConfig.scale?.x ?? 1,
            logConfig.scale?.y ?? 1,
            logConfig.scale?.z ?? 1
        )
    log.position.set(
        logConfig.position?.x ?? 0,
        logConfig.position?.y ?? 0,
        logConfig.position?.z ?? 0
    )
    log.rotation.set(
        logConfig.rotation?.x ?? 0,
        logConfig.rotation?.y ?? 0,
        logConfig.rotation?.z ?? 0
    )
    // log.castShadow = config.shadows.enabled
    return log
}

function createLogs(group: THREE.Group): void {
    const logConfig = config.log
    const geometry = sharedGeometries.logGeometry
    const material = createMaterialFromConfig(logConfig.material, geometry)

    logConfig.positions.forEach(logConf => {
        const log = transformLog(logConf, geometry, material)
        group.add(log)
    })
}

export { createLogs }