import * as THREE from 'three'
import { textureManager } from '../systems/TextureManager.js'
import { PhysicalMaterialConfig } from "../../types.js"

function createPhysicalMaterialFromConfig(
    materialConfig: PhysicalMaterialConfig,
    geometry?: THREE.BufferGeometry
): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial({
        color: materialConfig.color ?? 0xffffff,
        metalness: materialConfig.metalness ?? 0.0,
        roughness: materialConfig.roughness ?? 1.0,
        aoMapIntensity: materialConfig.aoMapIntensity ?? 1.0,
        displacementScale: materialConfig.displacementScale ?? 1.0,
        displacementBias: materialConfig.displacementBias ?? 0.0,
        transparent: materialConfig.transparent ?? (materialConfig.transmission !== undefined && materialConfig.transmission > 0),
        opacity: materialConfig.opacity ?? 1.0,
        side: materialConfig.side ?? THREE.FrontSide,
        wireframe: materialConfig.wireframe ?? false,
        emissive: materialConfig.emissive ?? 0x000000,
        emissiveIntensity: materialConfig.emissiveIntensity ?? 1.0,
        depthWrite: materialConfig.depthWrite ?? true,

        // MeshPhysicalMaterial specific properties
        transmission: materialConfig.transmission ?? 0.0,
        thickness: materialConfig.thickness ?? 0.0,
        ior: materialConfig.ior ?? 1.5,
        clearcoat: materialConfig.clearcoat ?? 0.0,
        clearcoatRoughness: materialConfig.clearcoatRoughness ?? 0.0,
        reflectivity: materialConfig.reflectivity ?? 0.5,
    })

    // Load textures
    material.map = textureManager.getTexture(materialConfig.map)
    material.alphaMap = textureManager.getTexture(materialConfig.alphaMap)
    material.aoMap = textureManager.getTexture(materialConfig.aoMap)
    material.displacementMap = textureManager.getTexture(materialConfig.displacementMap)
    material.normalMap = textureManager.getTexture(materialConfig.normalMap)
    material.metalnessMap = textureManager.getTexture(materialConfig.metalnessMap)
    material.roughnessMap = textureManager.getTexture(materialConfig.roughnessMap)
    material.emissiveMap = textureManager.getTexture(materialConfig.emissiveMap)
    material.thicknessMap = textureManager.getTexture(materialConfig.thicknessMap)

    if (materialConfig.normalScale) {
        material.normalScale.set(materialConfig.normalScale.x, materialConfig.normalScale.y)
    }

    return material
}

export { createPhysicalMaterialFromConfig }