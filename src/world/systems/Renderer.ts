import * as THREE from 'three'
import { config } from '../../config.js'

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
    })

    renderer.outputColorSpace = THREE.SRGBColorSpace // Correct color output (Also default)
    renderer.toneMapping = THREE.CineonToneMapping // Nice tone mapping
    renderer.toneMappingExposure = 1.75
    renderer.shadowMap.enabled = config.shadows.enabled
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // Softer shadows
    renderer.setClearColor(config.fog?.color ?? config.backgroundColor) // Use fog color if available

    return renderer
}

export { createRenderer }