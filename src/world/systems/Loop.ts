import * as THREE from 'three'
import { Timer } from 'three/examples/jsm/misc/Timer.js'

// Interface for objects that can be updated by the loop
export interface Updatable {
    update(elapsedTime: number, deltaTime: number): void
}

class Loop {
    private camera: THREE.Camera // Base camera type for flexibility
    private scene: THREE.Scene
    private renderer: THREE.WebGLRenderer
    private timer: Timer
    private updatables: Updatable[]

    constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.camera = camera
        this.scene = scene
        this.renderer = renderer
        this.timer = new Timer()
        this.updatables = []
    }

    start(): void {
        this.renderer.setAnimationLoop(() => {
            this.timer.update()
            const elapsedTime = this.timer.getElapsed()
            const deltaTime = this.timer.getDelta()

            // --- Ghost Light Animations ---
            const ghost1Angle = elapsedTime * 0.5 // Slow down speed
            const ghost1 = this.scene.getObjectByName('ghostLight1')
            if (ghost1) {
                ghost1.position.x = Math.cos(ghost1Angle) * 4
                ghost1.position.z = Math.sin(ghost1Angle) * 4
                // Multiplying with multiple and different sin(x) results in irregular paths (ref: https://www.desmos.com/calculator/1rnripshdv)
                ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45)
            }
            const ghost2Angle = -elapsedTime * 0.38 // Slow down speed
            const ghost2 = this.scene.getObjectByName('ghostLight2')
            if (ghost2) {
                ghost2.position.x = Math.cos(ghost2Angle) * 5
                ghost2.position.z = Math.sin(ghost2Angle) * 5
                // Multiplying with multiple and different sin(x) results in irregular paths (ref: https://www.desmos.com/calculator/1rnripshdv)
                ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45)
            }
            const ghost3Angle = elapsedTime * 0.23 // Slow down speed
            const ghost3 = this.scene.getObjectByName('ghostLight3')
            if (ghost3) {
                ghost3.position.x = Math.cos(ghost3Angle) * 7
                ghost3.position.z = Math.sin(ghost3Angle) * 7
                // Multiplying with multiple and different sin(x) results in irregular paths (ref: https://www.desmos.com/calculator/1rnripshdv)
                ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45)
            }

            // --- Pentagram Animation ---
            const pentagramSpeed = elapsedTime * 0.05
            const pentagram = this.scene.getObjectByName('pentagram')
            if(pentagram) {
                pentagram.rotation.z = -(Math.PI * 2) * pentagramSpeed
            }

            this.tick(elapsedTime, deltaTime)
            this.renderer.render(this.scene, this.camera)
        })
    }

    stop(): void {
        this.renderer.setAnimationLoop(null)
    }

    addUpdatable(object: Updatable): void {
        // Check if the object actually has the update method
        if (typeof object.update !== 'function') {
            console.warn('Object added to Loop does not have an update method: ', object)
            return
        }
        this.updatables.push(object)
    }

    tick(elapsedTime: number, deltaTime: number): void {
        for (const object of this.updatables) {
            object.update(elapsedTime, deltaTime)
        }
    }
}

export { Loop }