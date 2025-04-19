import * as THREE from 'three'

const setSize = (
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer): void => {
    camera.aspect = container?.clientWidth / container?.clientHeight
    camera.updateProjectionMatrix()

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

class Resizer {
    constructor(
        container: HTMLElement,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer) {
            // Set inital size
            setSize(container, camera, renderer)

            window.addEventListener('resize', () => {
                // Set size again if container dimensions change
                setSize(container, camera, renderer)
                // Perform any other custom actions on resize (currently nothing)
                this.onResize()
            })
    }

    // Hook for custom resize actions if needed in the future
    onResize(): void {}
}

export { Resizer }