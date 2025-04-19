import * as THREE from 'three'
import { StandardMaterialConfig } from "../../types.js"
import { textureManager } from '../systems/TextureManager.js'

// Helper function to create and configure the material
function createMaterialFromConfig(
    materialConfig: StandardMaterialConfig,
    geometry?: THREE.BufferGeometry
): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
        color: materialConfig.color ?? 0xffffff,
        metalness: materialConfig.metalness ?? 0.0,
        roughness: materialConfig.roughness ?? 1.0,
        aoMapIntensity: materialConfig.aoMapIntensity ?? 1.0,
        displacementScale: materialConfig.displacementScale ?? 1.0,
        displacementBias: materialConfig.displacementBias ?? 0.0,
        transparent: (materialConfig.transparent || materialConfig.alphaMap !== undefined) ?? false,
        opacity: materialConfig.opacity ?? 1.0,
        side: materialConfig.side ?? THREE.FrontSide,
        wireframe: materialConfig.wireframe ?? false,
        emissive: materialConfig.emissive ?? 0x000000, 
        emissiveIntensity: materialConfig.emissiveIntensity ?? 1.0,
    })

    // Load and apply textures
    material.map = textureManager.getTexture(materialConfig.map)
    material.alphaMap = textureManager.getTexture(materialConfig.alphaMap)
    material.aoMap = textureManager.getTexture(materialConfig.aoMap)
    material.displacementMap = textureManager.getTexture(materialConfig.displacementMap)
    material.normalMap = textureManager.getTexture(materialConfig.normalMap)
    material.metalnessMap = textureManager.getTexture(materialConfig.metalnessMap)
    material.roughnessMap = textureManager.getTexture(materialConfig.roughnessMap)
    material.emissiveMap = textureManager.getTexture(materialConfig.emissiveMap)

    if (materialConfig.normalScale) {
        material.normalScale.set(materialConfig.normalScale.x, materialConfig.normalScale.y)
    }

    return material
}

export { createMaterialFromConfig }