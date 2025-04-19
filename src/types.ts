import * as THREE from 'three'

export interface TextureConfig {
    path: string
    repeat?: { x: number, y: number }
    offset?: { x: number; y: number }
    wrapS?: THREE.Wrapping
    wrapT?: THREE.Wrapping
    magFilter?: THREE.MagnificationTextureFilter
    minFilter?: THREE.MinificationTextureFilter
    colorSpace?: THREE.ColorSpace
}

export interface StandardMaterialConfig {
    color?: THREE.ColorRepresentation
    map?: TextureConfig | string
    alphaMap?: TextureConfig | string
    aoMap?: TextureConfig | string
    displacementMap?: TextureConfig | string
    normalMap?: TextureConfig | string
    metalnessMap?: TextureConfig | string
    roughnessMap?: TextureConfig | string
    emissiveMap?: TextureConfig | string
    metalness?: number
    roughness?: number
    aoMapIntensity?: number
    displacementScale?: number
    displacementBias?: number
    normalScale?: { x: number; y: number }
    transparent?: boolean
    opacity?: number
    side?: THREE.Side
    wireframe?: boolean
    emissive?: THREE.ColorRepresentation
    emissiveIntensity?: number
    depthWrite?: boolean
}

export interface PhysicalMaterialConfig extends StandardMaterialConfig {
    transmission?: number
    thickness?: number
    ior?: number
    clearcoat?: number
    clearcoatRoughness?: number
    reflectivity?: number
    thicknessMap?: TextureConfig | string
}

export interface HouseConfig {
    width: number
    height: number
    depth: number
    material: StandardMaterialConfig
}

export interface RoofConfig {
    radius: number
    height: number
    segments: number
    material: StandardMaterialConfig
}

export interface DoorConfig {
    width: number
    height: number
    material: StandardMaterialConfig
}

export interface TranslationConfig {
    scale?: number | { x?: number; y?: number; z?: number }
    position?: { x?: number; y?: number; z?: number }
    rotation?: { x?: number, y?: number, z?: number }
}

export interface BushConfig {
    baseRadius: number
    segments: number
    material: StandardMaterialConfig
    positions: TranslationConfig[]
}

export interface GraveConfig {
    width: number
    height: number
    depth: number
    material: StandardMaterialConfig
    count: number
    minRadius: number
    maxRadius: number
}

export interface FloorConfig {
    width: number
    height: number
    widthSegments: number
    heightSegments: number
    material: StandardMaterialConfig
}

export interface LogConfig {
    radiusTop: number
    radiusBottom: number
    height: number
    material: StandardMaterialConfig
    positions: TranslationConfig[]
}

export interface PentagramConfig {
    radius: number,
    material: StandardMaterialConfig
}

export interface WindowConfig {
    width: number
    height: number
    depth: number
    material: PhysicalMaterialConfig
}

export interface LightConfig {
    color: THREE.ColorRepresentation
    intensity: number
}

export interface DirectionalLightConfig extends LightConfig {
    position: { x: number; y: number; z: number }
}

export interface PointLightConfig extends LightConfig {
    distance: number
    position: { x: number; y: number; z: number }
}

export interface CameraConfig {
    fov: number
    near: number
    far: number
    initialPosition: { x: number; y: number; z: number }
}

export interface FogConfig {
    color: THREE.ColorRepresentation
    near: number
    far: number
}

export interface ShadowConfig {
    enabled: boolean
    mapSize?: number
}

export interface AppConfig {
    debug: boolean
    backgroundColor: THREE.ColorRepresentation
    house: HouseConfig
    roof: RoofConfig
    door: DoorConfig
    bush: BushConfig
    grave: GraveConfig
    floor: FloorConfig
    log: LogConfig
    pentagram: PentagramConfig
    window: WindowConfig
    ambientLight: LightConfig
    moonLight: DirectionalLightConfig
    houseLight: PointLightConfig
    ghost1: LightConfig
    ghost2: LightConfig
    ghost3: LightConfig
    camera: CameraConfig
    fog?: FogConfig
    shadows: ShadowConfig
}

export interface SharedGeometries {
    bushGeometry: THREE.SphereGeometry
    logGeometry: THREE.CylinderGeometry
}

export type Helpers =
THREE.SpotLightHelper |
THREE.PointLightHelper |
THREE.HemisphereLightHelper |
THREE.DirectionalLightHelper |
THREE.AxesHelper