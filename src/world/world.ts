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
import { AppMaterials, GuiControlOptions, Helpers } from '../types.js'

// Class members
class World {
    private camera: THREE.PerspectiveCamera
    private renderer: THREE.WebGLRenderer
    private scene: THREE.Scene
    private loop: Loop
    private controls: OrbitControls
    private gui?: GUI
    private floorMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> // Defined as a class member in order to easily have access to the material in the debug method
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
        if (config.debug.enabled) {
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

    /**
     * Helper to add controls to a specific GUI folder or the root GUI.
     * @param target The object containing the property to control.
     * @param propName The name of the property (key) on the target object.
     * @param options Optional configuration for the control (min, max, step, name, onChange).
     * @param folder The lil-gui folder to add the control to (defaults to the root gui).
     */
    private addGuiControl(
        target: any,
        propName: string,
        options: GuiControlOptions = {},
        folder?: GUI
    ): void {
        const guiInstance = folder ?? this.gui // Folder or 'root' gui
        if (!guiInstance) return

        const { min, max, step, name, onChange } = options
        const controlName = name ?? propName

        const controller = guiInstance.add(target, propName)

        if (min !== undefined) controller.min(min)
        if (max !== undefined) controller.max(max)
        if (step !== undefined) controller.step(step)

        controller.name(controlName)

        if (onChange) {
            controller.onChange(onChange)
        }
    }


    private setupDebugGUI(): void {
        if (!this.gui) return;

        /*
         * Helper Definitions
         */
        const createVertexNormalsHelper = (object: THREE.Object3D, name?: string, size?: number, hex?: number) => {
            const helper = new VertexNormalsHelper(object, size ?? 0.2, hex ?? 0xff0000)
            helper.name = name ?? helper.type
            helper.visible = false
            this.helpers.push(helper)

            return helper
        }

        const createAxesHelper = (size?: number) => {
            const axesHelper = new THREE.AxesHelper(size ?? 5)
            axesHelper.name = 'Axes Helper'
            axesHelper.position.set(0, 4, 0)
            axesHelper.visible = false
            this.helpers.push(axesHelper)

            return axesHelper
        }

        /*
         * Setup Object Specific Debug & Helpers
         */
        const roof = this.scene.getObjectByName('roof')
        if (roof) {
            createVertexNormalsHelper(roof, 'Show Roof Normals')
        }

        const customHouse = this.scene.getObjectByName('customHouse')
        if (customHouse) {
            createVertexNormalsHelper(customHouse, 'Show House Normals')
        }

        const floorMaterial = this.floorMesh?.material as AppMaterials['standard']
        if (floorMaterial) {
            const floorFolder = this.gui.addFolder('Floor Material')
            // floorFolder.close()

            this.addGuiControl(floorMaterial, 'displacementScale', {
                min: 0,
                max: (config.debug.floor.material.displacementScale ?? 1) * 2,
                step: 0.001,
                name: 'Displacement Scale'
            }, floorFolder)

            this.addGuiControl(floorMaterial, 'displacementBias', {
                min: -1,
                max: 1,
                step: 0.001,
                name: 'Displacement Bias'
            }, floorFolder)
        }

        /* 
         * Setup Other Helpers
        */
        const axesHelperInstance = createAxesHelper()
        // Debug: Controlling AxesHelper position
        if (axesHelperInstance) {
            const axesFolder = this.gui.addFolder('Axes Helper Position')
            this.addGuiControl(axesHelperInstance.position, 'x', { min: -10, max: 10, step: 0.1, name: 'Horizontal (x)' }, axesFolder)
            this.addGuiControl(axesHelperInstance.position, 'y', { min: 0, max: 10, step: 0.1, name: 'Vertical (y)' }, axesFolder)
            this.addGuiControl(axesHelperInstance.position, 'z', { min: -10, max: 10, step: 0.1, name: 'Horizontal (z)' }, axesFolder)
        }

        /* 
         * Adding the Helpers to the GUI
        */
        if (this.helpers.length) {
            const helpersFolder = this.gui.addFolder('Scene Helpers')
            // helpersFolder.close()

            this.helpers.forEach(helper => {
                this.scene.add(helper)

                // helper for the 'visible' property (boolean checkbox)
                this.addGuiControl(helper, 'visible', {
                    name: helper.name || helper.type
                }, helpersFolder)
            })
        }
    }
}

export { World }