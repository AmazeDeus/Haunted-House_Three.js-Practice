import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/Addons.js'

// Helpers
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js'

// Config
import { config } from '../config.js'

// Components
import { createCamera, createControls } from '../world/components/camera.js'
import { createFloor } from './components/floor.js'
import { createHouse } from './components/house.js'
import { createGraves } from './components/graves.js'
import { createLights } from './components/lights.js'

// Systems
import { createRenderer } from './systems/Renderer.js'
import { Resizer } from './systems/Resizer.js'
import { Loop } from './systems/Loop.js'

// Types
import { Helpers } from '../types.js'

// Class members
class World {
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private scene: THREE.Scene
    private loop: Loop
    private controls: OrbitControls
    private gui?: GUI
    private floorMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
    private resizer: Resizer
    private helpers: Helpers[]

    constructor(container: HTMLElement) {
        if (!container) {
            throw new Error('Container element is required for World constructor.')
        }

        this.camera = createCamera(container)
        this.scene = new THREE.Scene()
        this.helpers = []

        // Canvas element for the container
        const canvas = container.querySelector<HTMLCanvasElement>('canvas.webgl')
        if (!canvas) {
            throw new Error('Canvas element with class "webgl" not found inside the container.')
        }
        this.renderer = createRenderer(canvas)

        this.controls = createControls(this.camera, this.renderer.domElement)
        this.loop = new Loop(this.camera, this.scene, this.renderer)
        this.loop.addUpdatable(this.controls) // OrbitControls has an 'update' method

        /* 
         * Fog
        */
        if (config.fog) {
            this.scene.fog = new THREE.Fog(
                config.fog.color,
                config.fog.near,
                config.fog.far
            )
            // Renderer clear color set in 'createRenderer'
        }

        /* 
         * Objects
        */
        this.floorMesh = createFloor()
        const house = createHouse()
        const graves = createGraves()
        this.scene.add(this.floorMesh, house, graves)

        /* 
         * Lights
        */
        const { lights, lightHelpers } = createLights()
        lightHelpers.forEach(helper => this.helpers.push(helper))
        lights.forEach(light => this.scene.add(light))

        /* 
        * Sky
        */
        const sky = new Sky()
        sky.scale.setScalar(100) // Sky inherits from Mesh, so it has access to scale
        this.scene.add(sky)
        // To tweak the params of the sky, you can update some uniforms on the material of 'sky'
        // (specific to shader materials)
        sky.material.uniforms['turbidity'].value = 10
        sky.material.uniforms['rayleigh'].value = 3
        sky.material.uniforms['mieCoefficient'].value = 0.1
        sky.material.uniforms['mieDirectionalG'].value = 0.95
        sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

        this.resizer = new Resizer(container, this.camera, this.renderer)
        // Example of using the resizer hook if needed in the future. Currently no need:
        // this.resizer.onResize = () => {
        //     console.log('Resized!')
        // }

        /* 
         * Debug
        */
        if (config.debug) {
            this.gui = new GUI()
            this.setupDebugGUI()
        }
    }

    render(): void {
        this.renderer.render(this.scene, this.camera)
    }

    start(): void {
        this.loop.start()
    }

    stop(): void {
        this.loop.stop()
    }

    // Debug GUI setup method
    private setupDebugGUI(): void {
        if (!this.gui) return
        /* 
        * Setup Helpers
        */
        // --- Axes Helper ---
        const axesHelper = new THREE.AxesHelper(5)
        axesHelper.name = 'Axes Helper'
        axesHelper.position.set(0, 4, 0)
        this.helpers.push(axesHelper)

        // --- Roof Debug ---
        const roof = this.scene.getObjectByName('roof')
        if (roof) {
            const roofNormalsHelper = new VertexNormalsHelper(roof, 0.2, 0xff0000)
            this.scene.add(roofNormalsHelper)
            this.gui
                .add(roofNormalsHelper, 'visible')
                .name('Show Roof Normal Direction')
        }
        // --- House Debug ---
        const customHouse = this.scene.getObjectByName('customHouse')
        if (customHouse) {
            const houseNormalsHelper = new VertexNormalsHelper(customHouse, 0.2, 0xff0000)
            this.scene.add(houseNormalsHelper)
            this.gui
                .add(houseNormalsHelper, 'visible')
                .name('Show House Normal Direction')
        }

        // --- Floor/Ground Debug ---
        const floorMaterial = this.floorMesh?.material
        if (floorMaterial) {
            this.gui
                .add(floorMaterial, 'displacementScale')
                .min(0)
                .max((config.floor.material.displacementScale ?? 1) * 2)
                .step(0.001)
                .name('floorDisplacementScale')
            this.gui
                .add(floorMaterial, 'displacementBias')
                .min(-1)
                .max(1)
                .step(0.001)
                .name('floorDisplacementBias')
        }

        // --- Helpers Debug ---
        if (this.helpers.length) {
            this.helpers.forEach(helper => {
                this.scene.add(helper)
                this.gui!
                    .add(helper, 'visible')
                    .name(helper.name || helper.type)
            })
        }
    }
}

export { World }