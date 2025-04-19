/* 
 * Singleton for managing, loading and caching textures
*/

import * as THREE from 'three'
import { TextureConfig } from '../../types.js'

class TextureManager {
    private static instance: TextureManager
    private textureLoader: THREE.TextureLoader
    private textureCache: Map<string, THREE.Texture>
    private loadingManager: THREE.LoadingManager // for progress tracking (currently does no tracking)

    private constructor() {
        this.loadingManager = new THREE.LoadingManager(
            // Called when all textures are loaded
            () => { console.log("All textures loaded.") },
            // Called during loading (url, loaded, total)
            (url, itemsLoaded, itemsTotal) => {
                // console.log(`Loading texture: ${url}. Loaded ${itemsLoaded}/${itemsTotal}`)
            }
        )
        this.textureLoader = new THREE.TextureLoader(this.loadingManager)
        this.textureCache = new Map()
        console.log("TextureManager initialized")
    }

    public static getInstance(): TextureManager {
        if (!TextureManager.instance) {
            TextureManager.instance = new TextureManager()
        }
        return TextureManager.instance
    }

    /**
     * Loads a texture from a given path or TextureConfig object.
     * 
     * Returns cached texture if already loaded.
     * 
     * Applies texture configurations like repeat, offset, wrapping.
     */
    public getTexture(configOrPath?: TextureConfig | string): THREE.Texture | null {
        if (!configOrPath) return null

        const isConfig = typeof configOrPath !== 'string'
        const path = isConfig ? configOrPath.path : configOrPath

        if (!path) {
            console.warn("Texture path is empty.")
            return null
        }

        // Return from cache if available
        if (this.textureCache.has(path)) {
            const texture = this.textureCache.get(path)!
            // Re-apply config if TextureConfig object was passed,
            // as the cached texture might not have had these settings applied
            // for a different object that used the same path previously.
            if (isConfig) {
                this.applyTextureConfig(texture, configOrPath)
            }
            return texture
        }

        // Load texture
        try {
            const texture = this.textureLoader.load(path,
                // onLoad callback
                (tex) => {
                    // console.log(`Texture loaded: ${path}`)
                    // Apply configuration *after* loading is complete
                    if (isConfig) {
                        this.applyTextureConfig(tex, configOrPath)
                    } else {
                        // Apply default wrapping if just path was given
                        tex.wrapS = THREE.RepeatWrapping
                        tex.wrapT = THREE.RepeatWrapping
                    }
                    // Ensure update if config applied after initial load
                    tex.needsUpdate = true
                },
                // onProgress callback (handled by LoadingManager)
                undefined,
                // onError callback
                (error) => {
                    console.error(`Error loading texture: ${path}`, error)
                    this.textureCache.delete(path) // Remove potential failed entry
                }
            )

            // Store in cache immediately (TextureLoader handles async loading internally)
            this.textureCache.set(path, texture)
            return texture

        } catch (error) {
            console.error(`Failed to initiate texture loading for: ${path}`, error)
            return null
        }
    }

    /**
     * Applies configuration settings (repeat, offset, wrapping, filtering) to a texture.
     */
    public applyTextureConfig(texture: THREE.Texture, config: TextureConfig): void {
        if (config.repeat) {
            texture.repeat.set(config.repeat.x, config.repeat.y)
        }
        
        // Inform Three.js that the textures need to be repeated
        // Default is "THREE.ClampToEdgeWrapping" (results in stretched textures with repeat set)
        texture.wrapS = config.wrapS ?? THREE.ClampToEdgeWrapping
        texture.wrapT = config.wrapT ?? THREE.ClampToEdgeWrapping
        
        if(config.colorSpace) {
            texture.colorSpace = config.colorSpace
        }

        if (config.offset) {
            texture.offset.set(config.offset.x, config.offset.y)
        }

        if (config.magFilter) texture.magFilter = config.magFilter
        if (config.minFilter) texture.minFilter = config.minFilter

        // Mark texture for update if settings changed after initial load/cache retrieval
        texture.needsUpdate = true
    }

    /**
     * Preloads textures specified in an array of paths or configs.
     * 
     * Returns a Promise that resolves when all are loaded (or attempted).
     */
    public preloadTextures(configsOrPaths: (TextureConfig | string)[]): Promise<void[]> {
        const promises: Promise<void>[] = []
        configsOrPaths.forEach(configOrPath => {
            if (!configOrPath) return
            const isConfig = typeof configOrPath !== 'string'
            const path = isConfig ? configOrPath.path : configOrPath

            if (path && !this.textureCache.has(path)) {
                const promise = new Promise<void>((resolve, reject) => {
                    this.textureLoader.load(
                        path,
                        (texture) => {
                            // Apply config on *successful* load
                            if (isConfig) {
                                this.applyTextureConfig(texture, configOrPath)
                            } else {
                                texture.wrapS = THREE.RepeatWrapping
                                texture.wrapT = THREE.RepeatWrapping
                            }
                            this.textureCache.set(path, texture) // Cache it
                            // console.log(`Preloaded: ${path}`)
                            resolve()
                        },
                        undefined, // onProgress
                        (error) => {
                            console.error(`Error preloading texture: ${path}`, error)
                            reject(error) // Reject the promise on error
                        }
                    )
                })
                promises.push(promise)
            }
        })
        // Use LoadingManager.onLoad for overall completion, or Promise.all for individual tracking
        return Promise.all(promises) // Resolves when all load attempts complete (success or failure)
    }

    // Get loading manager for external progress tracking
    // Currently not used
    public getLoadingManager(): THREE.LoadingManager {
        return this.loadingManager
    }
}

// Export the singleton instance
export const textureManager = TextureManager.getInstance()