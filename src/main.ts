import { config } from './config.js'
import { textureManager } from './world/systems/TextureManager.js'
import { World } from './world/world.js'

const main = async (): Promise<void> => {
    // Get container, potentially null
    const container: HTMLElement | null = document.querySelector<HTMLElement>('#app')

    if (!container) {
        console.error("Container element '#app' not found.")
        return
    }

    // Ensure canvas exists within container before initializing World
    if (!container.querySelector('canvas.webgl')) {
        console.error("Canvas element '.webgl' not found inside '#app'. Creating one...")
        const canvas = document.createElement('canvas')
        canvas.classList.add('webgl')
        container.appendChild(canvas)
    }

    // --- Preload Critical Textures ---
    const texturesToPreload = [
        config.floor.material.map,
        config.floor.material.aoMap,
        config.door.material.map,
        config.door.material.alphaMap,
        config.house.material.map,
        // Other critical textures...
    ].filter(Boolean)

    try {
        console.log("Preloading textures...")
        await textureManager.preloadTextures(
            texturesToPreload as (string | import("./types.js").TextureConfig)[]
        )
            .then(res => console.log("Texture preloading complete."))
            .catch(res => console.log("Texture preloading failed: ", res))

        // --- Initialize World After Preloading ---
        const world = new World(container)
        world.start()
    } catch (e) {
        console.error('Error initializing World: ', e)
        // Display error to the user in some way
        if (container) {
            alert('Failed to initialize 3D scene. Check console for details.')
        }
    }
}

main().catch((e) => {
    // Catch errors from the async main function
    console.error('Critical error in main execution: ', e)
})