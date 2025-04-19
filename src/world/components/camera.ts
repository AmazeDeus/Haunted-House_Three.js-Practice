import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { config } from '../../config.js'

const createCamera = (container: HTMLElement): THREE.PerspectiveCamera => {
    const { fov, near, far, initialPosition } = config.camera
    const camera = new THREE.PerspectiveCamera(
        fov,
        container.clientWidth / container.clientHeight, // Initial aspect ratio
        near,
        far
    )

    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z)

    return camera
}

const createControls = (camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement): OrbitControls => {
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.target.set(0, 1, 0)// Aim controls slightly higher
    // The loop will handle controls.update()
    return controls
}

export { createCamera, createControls }