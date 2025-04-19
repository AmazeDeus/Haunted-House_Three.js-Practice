import * as THREE from 'three'
import { texturePaths } from './lib/textures.js'
import { AppConfig, SharedGeometries } from './types.js'

// Centralized debug, measurements, colors, counts, etc.
export const config: AppConfig = {
    // --- Debug ---
    debug: {
        enabled: true, // Enable/disable lil-gui
        floor: {
            material: {
                displacementScale: 0.5
            }
        }
    },

    // --- Scene settings ---
    backgroundColor: '#000000',
    // backgroundColor: '#262837',

    // --- Objects ---
    house: {
        width: 4,
        height: 2.5,
        depth: 4,
        material: {
            //color: '#ac8e82',
            map: {
                path: texturePaths.bricks.color,
                repeat: { x: 2, y: 2 },
                colorSpace: 'srgb',
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            aoMap: {
                path: texturePaths.bricks.ambientOcclusion,
                repeat: { x: 2, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            normalMap: {
                path: texturePaths.bricks.normal,
                repeat: { x: 2, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            roughnessMap: {
                path: texturePaths.bricks.roughness,
                repeat: { x: 2, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            aoMapIntensity: 1,
        }
    },
    roof: {
        radius: 3.5,
        height: 1.5,
        segments: 4,
        material: {
            // color: '#b35f45',
            map: {
                path: texturePaths.roof.color,
                repeat: { x: 3, y: 2 },
                colorSpace: 'srgb',
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            aoMap: {
                path: texturePaths.roof.ambientOcclusion,
                repeat: { x: 3, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            normalMap: {
                path: texturePaths.roof.normal,
                repeat: { x: 3, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            roughnessMap: {
                path: texturePaths.roof.roughness,
                repeat: { x: 3, y: 2 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
        }
    },
    door: {
        width: 1.2,
        height: 2.0,
        material: {
            map: { path: texturePaths.door.color, colorSpace: 'srgb' },
            // alphaMap: texturePaths.door.alpha,
            aoMap: texturePaths.door.ambientOcclusion,
            displacementMap: texturePaths.door.displacement,
            normalMap: texturePaths.door.normal,
            roughnessMap: texturePaths.door.roughness,
            aoMapIntensity: 1,
            // transparent: true, // REQUIRED for alphaMap to work
            displacementScale: 0.15,
            displacementBias: -0.091,
            side: 2
        }
    },
    bush: {
        baseRadius: 1,
        segments: 16,
        material: {
            color: '#ccffcc',
            map: {
                path: texturePaths.bush.color,
                colorSpace: 'srgb',
                repeat: { x: 1, y: 0.5 },
                wrapS: THREE.RepeatWrapping,
                /* wrapT: THREE.RepeatWrapping */
            },
            alphaMap: {
                path: texturePaths.bush.alpha,
                repeat: { x: 1, y: 0.5 },
                wrapS: THREE.RepeatWrapping,
                /* wrapT: THREE.RepeatWrapping */
            },
            transparent: true,
            normalMap: {
                path: texturePaths.bush.normal,
                repeat: { x: 1, y: 0.5 },
                wrapS: THREE.RepeatWrapping,
                /* wrapT: THREE.RepeatWrapping */
            },
            roughnessMap: {
                path: texturePaths.bush.roughness,
                repeat: { x: 1, y: 0.5 },
                wrapS: THREE.RepeatWrapping,
                /* wrapT: THREE.RepeatWrapping */
            },
            displacementMap: texturePaths.bush.displacement,
            displacementScale: 0.4
        },
        positions: [
            { scale: 0.5, position: { x: 0.8, y: 0.3, z: 2.51 }, rotation: { x: -0.75, y: 4.5 } },
            { scale: 0.25, position: { x: 1.4, y: 0.3, z: 2.1 }, rotation: { x: -0.75, y: 5 } },
            { scale: 0.4, position: { x: -1.8, y: 0.3, z: 2.2 }, rotation: { x: -0.75, y: 4.5 } },
            { scale: 0.15, position: { x: -1.4, y: 0.15, z: 2.6 }, rotation: { x: -0.75, y: 5 } },
        ],
    },
    grave: {
        width: 0.6,
        height: 0.8,
        depth: 0.2,
        material: {
            color: '#ffffff',
            map: {
                path: texturePaths.grave.color,
                colorSpace: 'srgb',
                repeat: { x: 0.3, y: 0.4 }
            },
            aoMap: {
                path: texturePaths.grave.ambientOcclusion,
                repeat: { x: 0.3, y: 0.4 }
            },
            normalMap: {
                path: texturePaths.grave.normal,
                repeat: { x: 0.3, y: 0.4 }
            },
            roughnessMap: {
                path: texturePaths.grave.roughness,
                repeat: { x: 0.3, y: 0.4 }
            },
            aoMapIntensity: 1,
        },
        count: 30,
        minRadius: 3.5,
        maxRadius: 9,
    },
    floor: {
        width: 20,
        height: 20,
        widthSegments: 100,
        heightSegments: 100,
        material: {
            //color: '#a9c388',
            map: {
                path: texturePaths.floor.color,
                repeat: { x: 3, y: 3 },
                colorSpace: 'srgb',
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            alphaMap: { path: texturePaths.floor.alpha },
            displacementMap: {
                path: texturePaths.floor.displacement,
                repeat: { x: 3, y: 3 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            aoMap: {
                path: texturePaths.floor.ambientOcclusion,
                repeat: { x: 3, y: 3 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            normalMap: {
                path: texturePaths.floor.normal,
                repeat: { x: 3, y: 3 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            roughness: 1,
            roughnessMap: {
                path: texturePaths.floor.roughness,
                repeat: { x: 3, y: 3 },
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            },
            aoMapIntensity: 1,
            displacementScale: 0.362,
            displacementBias: -0.1 // Offset the displacement down
        }
    },
    log: {
        radiusTop: 0.2,
        radiusBottom: 0.2,
        height: 3,
        material: {
            // color: '#ac8e82',
            map: {
                path: texturePaths.log.color,
                colorSpace: 'srgb',
            },
            normalMap: {
                path: texturePaths.log.normal,
            },
            roughnessMap: {
                path: texturePaths.log.roughness,
            },
            aoMap: texturePaths.log.ambientOcclusion,
            aoMapIntensity: 1,
        },
        positions: [
            { scale: { y: 1 }, position: { x: -2.3, y: 0.2 }, rotation: { x: 89.5 } },
            { scale: { y: 0.8 }, position: { x: -2.6, y: 0.45 }, rotation: { x: 89.5 } },
            { scale: { y: 0.7 }, position: { x: -2.9, y: 0.2 }, rotation: { x: 89.5 } },
        ],
    },
    pentagram: {
        radius: 1,
        material: {
            // color: 0xff0000,
            map: {
                path: texturePaths.pentagram.color,
                colorSpace: 'srgb',
            },
            alphaMap: { path: texturePaths.pentagram.alpha },
            roughnessMap: {
                path: texturePaths.pentagram.roughness,
            },
            emissive: 0xff0000,
            emissiveIntensity: 1,
            transparent: true,
        }
    },
    window: {
        width: 1.1,
        height: 1.1,
        depth: 0.1,
        material: {
            color: "#909288",
            metalness: 0.0,
            roughness: 0.0,
            transmission: 1,
            thickness: 0.1,
            ior: 1.52, // Index of Refraction for glass
            clearcoat: 1,
            clearcoatRoughness: 0,
            transparent: true,
            depthWrite: false,
        }
    },

    // --- Lights ---
    ambientLight: {
        color: '#86cdff',
        intensity: 0.275 // Having a dimmed ambientLight allows people to enjoy the surfaces in the shade and mimics the light's bounce of the Directionalight
    },
    moonLight: { // Directional light
        color: '#86cdff',
        intensity: 0.55,
        position: { x: 3, y: 2, z: -8 },
    },
    houseLight: { // Point Light
        color: '#f73116',
        intensity: 18, // 5
        distance: 28, // 7
        position: { x: 0, y: 1.5, z: 1.4 },
    },
    ghost1: { // Point Light
        color: '#8800ff',
        intensity: 6
    },
    ghost2: { // Point Light
        color: '#ff0088',
        intensity: 6
    },
    ghost3: { // Point Light
        color: '#ff0000',
        intensity: 6
    },

    // --- Camera ---
    camera: {
        fov: 75,
        near: 0.1,
        far: 100,
        initialPosition: { x: 4, y: 2, z: 5 }
    },

    // --- Fog ---
    fog: {
        color: '#104553',
        near: 1,
        far: 13,
    },

    // --- Shadows ---
    shadows: {
        enabled: true,
        mapSize: 256
    },
}

// Shared Geometries
export const sharedGeometries: SharedGeometries = {
    bushGeometry: new THREE.SphereGeometry(
        config.bush.baseRadius,
        config.bush.segments,
        config.bush.segments
    ),
    logGeometry: new THREE.CylinderGeometry(
        config.log.radiusTop,
        config.log.radiusBottom,
        config.log.height
    )
}