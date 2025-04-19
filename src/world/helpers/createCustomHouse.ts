import * as THREE from 'three'
import { safeDivide } from './safeDivide.js'
import { HOUSE_CONSTANTS } from '../../constants.js'

// --- Constants ---
const {
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT,
    DEFAULT_DEPTH,
    DEFAULT_DOOR_WIDTH,
    DEFAULT_DOOR_HEIGHT,
    DEFAULT_DOOR_BOTTOM_HEIGHT,
    DEFAULT_WALL_THICKNESS,
    DEFAULT_WINDOW_WIDTH,
    DEFAULT_WINDOW_HEIGHT,
    DEFAULT_WINDOW_BOTTOM_Y,
    DEFAULT_WINDOW_CENTER_Z,
} = HOUSE_CONSTANTS

// V maps to World Y [originY, originY+extentY]
// U maps to World Z [originZ, originZ+extentZ]
const calculateLeftRightUVs = (
    corners: THREE.Vector3[],
    originY: number, extentY: number,
    originZ: number, extentZ: number
    // flipU = false (could probably be used for inner vs outer)
): THREE.Vector2[] => {
    return corners.map(corner => new THREE.Vector2(
        safeDivide(corner.z - originZ, extentZ), // U = Z
        safeDivide(corner.y - originY, extentY)  // V = Y
    ))
}

// V maps to World Y [originY, originY+extentY]
// U maps to World X [originX, originX+extentX]
const calculateFrontBackUVs = (
    corners: THREE.Vector3[],
    originX: number, extentX: number,
    originY: number, extentY: number
    // flipU = false
): THREE.Vector2[] => {
    return corners.map(corner => new THREE.Vector2(
        safeDivide(corner.x - originX, extentX), // U = X
        safeDivide(corner.y - originY, extentY)  // V = Y
    ))
}

// V maps to World Z [originZ, originZ+extentZ]
// U maps to World X [originX, originX+extentX]
const calculateTopBottomUVs = (
    corners: THREE.Vector3[],
    originX: number, extentX: number,
    originZ: number, extentZ: number
    // flipV = false (could flip for ceiling vs floor)
): THREE.Vector2[] => {
    return corners.map(corner => new THREE.Vector2(
        safeDivide(corner.x - originX, extentX), // U = X
        safeDivide(corner.z - originZ, extentZ)  // V = Z
    ))
}

// --- Helper Function to add a Quadrilateral Face ---
// Creates two triangles (a quad) for a face given four corner vertices.
// Assumes counter-clockwise order for vertices when looking at the visible side.
const addQuad = (
    vertices: number[],
    uvs: number[],
    normals: number[],
    indices: number[],
    v1: THREE.Vector3, // Bottom-Left / Start
    v2: THREE.Vector3, // Bottom-Right / Second
    v3: THREE.Vector3, // Top-Right / Third
    v4: THREE.Vector3, // Top-Left / Fourth
    normal: THREE.Vector3,
    uvCoords: THREE.Vector2[] = [ // Default simple UV mapping
        new THREE.Vector2(0, 0), // Corresponds to v1
        new THREE.Vector2(1, 0), // Corresponds to v2
        new THREE.Vector2(1, 1), // Corresponds to v3
        new THREE.Vector2(0, 1), // Corresponds to v4
    ]
) => {
    const startIndex = vertices.length / 3
    const corners = [v1, v2, v3, v4]

    for (let i = 0; i < 4; i++) {
        vertices.push(corners[i].x, corners[i].y, corners[i].z)
        uvs.push(uvCoords[i].x, uvCoords[i].y)
        normals.push(normal.x, normal.y, normal.z)
    }

    // Triangle 1 (v1, v2, v3) - Assumes CCW order for the visible face
    indices.push(startIndex + 0, startIndex + 1, startIndex + 2)
    // Triangle 2 (v1, v3, v4) - Assumes CCW order for the visible face
    indices.push(startIndex + 0, startIndex + 2, startIndex + 3)

    // Return the number of vertices added
    return 4
}

const createCustomHouse = (
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    depth = DEFAULT_DEPTH,
    doorWidth = DEFAULT_DOOR_WIDTH,
    doorHeight = DEFAULT_DOOR_HEIGHT,
    windowWidth = DEFAULT_WINDOW_WIDTH,
    windowHeight = DEFAULT_WINDOW_HEIGHT,
    windowBottomY = DEFAULT_WINDOW_BOTTOM_Y,
    windowCenterZ = DEFAULT_WINDOW_CENTER_Z
) => {
    const geometry = new THREE.BufferGeometry()

    // --- Vertex Data Arrays ---
    const vertices: number[] = []
    const uvs: number[] = []
    const normals: number[] = []
    const indices: number[] = []
    let vertexCount = 0 // Keep track of total vertices added

    // --- Dimensions and Coordinates ---
    // Use origin at the center of the base for easier calculations
    const halfWidth = width / 2
    const halfDepth = depth / 2
    const floorY = 0 // Let the base of the house sit at y=0
    const ceilingY = height // Top of the outer shell

    // --- UV Mapping Parameters ---
    // Parameters for the bounds/axes being mapped when calculating the UVs
    const originX = -halfWidth; const extentX = width
    const originY = floorY; const extentY = height
    const originZ = -halfDepth; const extentZ = depth

    // --- Outer Corners ---
    // Base Corners (Y = floorY = 0)
    const baseBL = new THREE.Vector3(-halfWidth, floorY, -halfDepth) // Back-Left
    const baseBR = new THREE.Vector3(halfWidth, floorY, -halfDepth) // Back-Right
    const baseFL = new THREE.Vector3(-halfWidth, floorY, halfDepth) // Front-Left
    const baseFR = new THREE.Vector3(halfWidth, floorY, halfDepth) // Front-Right

    // Top Corners (Y = ceilingY)
    const topBL = new THREE.Vector3(-halfWidth, ceilingY, -halfDepth) // Back-Left
    const topBR = new THREE.Vector3(halfWidth, ceilingY, -halfDepth) // Back-Right
    const topFL = new THREE.Vector3(-halfWidth, ceilingY, halfDepth) // Front-Left
    const topFR = new THREE.Vector3(halfWidth, ceilingY, halfDepth) // Front-Right

    // --- 1. Base Face (Outer Bottom) ---
    // Visible from below, normal (0, -1, 0)
    // Order: baseBL, baseBR, baseFR, baseFL (CCW from below)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        baseBL, baseBR, baseFR, baseFL,
        new THREE.Vector3(0, -1, 0)
    )

    // --- 2. Top Face (Outer Roof) ---
    // Visible from above, normal (0, 1, 0)
    // Order: topFL, topFR, topBR, topBL (CCW from above)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        topFL, topFR, topBR, topBL,
        new THREE.Vector3(0, 1, 0)
    )

    // --- 3. Back Face (Outer) ---
    // Visible from back, normal (0, 0, -1)
    // Order: topBL, topBR, baseBR, baseBL (CCW from back)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        topBL, topBR, baseBR, baseBL,
        new THREE.Vector3(0, 0, -1)
    )

    // --- 4. Left Face (Outer) ---
    // Visible from left, normal (-1, 0, 0)
    // Order: topFL, topBL, baseBL, baseFL (CCW from left)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        topFL, topBL, baseBL, baseFL,
        new THREE.Vector3(-1, 0, 0)
    )

    // --- 5. Right Face (Outer - With Window) ---
    const rightNormal = new THREE.Vector3(1, 0, 0) // Visible from right
    const windowYTop = windowBottomY + windowHeight
    const windowZLeft = windowCenterZ - windowWidth / 2 // Towards -Z (back)
    const windowZRight = windowCenterZ + windowWidth / 2 // Towards +Z (front)

    // Outer Window Corners (at X = halfWidth)
    const windowOuterBottomRight = new THREE.Vector3(halfWidth, windowBottomY, windowZLeft)
    const windowOuterBottomLeft = new THREE.Vector3(halfWidth, windowBottomY, windowZRight)
    const windowOuterTopRight = new THREE.Vector3(halfWidth, windowYTop, windowZLeft)
    const windowOuterTopLeft = new THREE.Vector3(halfWidth, windowYTop, windowZRight)

    const getRightUVs = (corners: THREE.Vector3[]) => calculateLeftRightUVs(corners, originY, extentY, originZ, extentZ)

    // --- Right Face Segments (CCW from Right / +X view) ---
    // v1=BottomLeft, v2=BottomRight, v3=TopRight, v4=TopLeft relative to segment

    // Bottom Segment (Below Window)
    // Order: baseFR, baseBR, windowOuterBottomLeft, windowOuterBottomRight
    let corners = [baseFR, baseBR, windowOuterBottomRight, windowOuterBottomLeft]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], rightNormal, getRightUVs(corners))

    // Right Segment (Right side of window)
    // Order: baseBR, windowOuterBottomLeft, windowOuterTopLeft, topBR
    corners = [windowOuterBottomRight, baseBR, topBR, windowOuterTopRight]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], rightNormal, getRightUVs(corners))

    // Left Segment (Left side of window)
    // Order: windowOuterTopLeft, topFR, baseFR, windowOuterBottomLeft
    corners = [windowOuterTopLeft, topFR, baseFR, windowOuterBottomLeft]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], rightNormal, getRightUVs(corners))

    // Top Segment (Above Window)
    // Order: windowOuterTopLeft, windowOuterTopRight, topBR, topFR
    corners = [windowOuterTopLeft, windowOuterTopRight, topBR, topFR]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], rightNormal, getRightUVs(corners))


    // --- 6. Front Face (Outer - with Doorway) ---
    const frontNormal = new THREE.Vector3(0, 0, 1) // Visible from front
    const doorXLeft = -doorWidth / 2
    const doorXRight = doorWidth / 2
    // Door Y coordinates (relative to the base + DOOR_BOTTOM_HEIGHT)
    const doorYBottom = floorY + DEFAULT_DOOR_BOTTOM_HEIGHT
    const doorYTop = doorYBottom + doorHeight

    // Outer Front Doorway Corners (at Z = halfDepth)
    const doorBottomLeft = new THREE.Vector3(doorXLeft, doorYBottom, halfDepth)
    const doorBottomRight = new THREE.Vector3(doorXRight, doorYBottom, halfDepth)
    const doorTopLeft = new THREE.Vector3(doorXLeft, doorYTop, halfDepth)
    const doorTopRight = new THREE.Vector3(doorXRight, doorYTop, halfDepth)

    // Helper function to calculate UVs for the front face segments relative to the whole front face
    const getFrontUVs = (corners: THREE.Vector3[]) => calculateFrontBackUVs(corners, originX, extentX, originY, extentY)

    // Front - Left Segment (CCW from front)
    corners = [baseFL, doorBottomLeft, doorTopLeft, topFL]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], frontNormal, getFrontUVs(corners)) // Using default UVs for simplicity now

    // Front - Right Segment (CCW from front)
    corners = [doorBottomRight, baseFR, topFR, doorTopRight]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], frontNormal, getFrontUVs(corners))

    // Front - Top Segment (Above Door) (CCW from front)
    corners = [doorTopLeft, doorTopRight, topFR, topFL]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], frontNormal, getFrontUVs(corners))

    // Front - Bottom Segment (Below Door - Threshold outer face) (CCW from front)
    corners = [baseFL, baseFR, doorBottomRight, doorBottomLeft]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], frontNormal, getFrontUVs(corners))


    // --- 7. Doorway Inner Faces (Thickness faces) ---
    const innerZ = halfDepth - DEFAULT_WALL_THICKNESS // Z-coordinate of the inner wall face

    // Inner Doorway Corners (at Z = innerZ)
    const doorInnerBottomLeft = new THREE.Vector3(doorXLeft, doorYBottom, innerZ)
    const doorInnerBottomRight = new THREE.Vector3(doorXRight, doorYBottom, innerZ)
    const doorInnerTopLeft = new THREE.Vector3(doorXLeft, doorYTop, innerZ)
    const doorInnerTopRight = new THREE.Vector3(doorXRight, doorYTop, innerZ)

    // Doorway Left Side (Inner Jamb) - Normal points right (+X)
    // Order: doorInnerTopLeft, doorTopLeft, doorBottomLeft, doorInnerBottomLeft (CCW from Right)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopLeft, doorTopLeft, doorBottomLeft, doorInnerBottomLeft,
        new THREE.Vector3(1, 0, 0)
    )

    // Doorway Right Side (Inner Jamb) - Normal points left (-X)
    // Order: doorTopRight, doorInnerTopRight, doorInnerBottomRight, doorBottomRight (CCW from Left)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorTopRight, doorInnerTopRight, doorInnerBottomRight, doorBottomRight,
        new THREE.Vector3(-1, 0, 0)
    )

    // Doorway Top Side (Inner Lintel) - Normal points down (-Y)
    // Order: doorInnerTopLeft, doorInnerTopRight, doorTopRight, doorTopLeft (CCW from Below)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopLeft, doorInnerTopRight, doorTopRight, doorTopLeft,
        new THREE.Vector3(0, -1, 0)
    )

    // Doorway Bottom Side (Inner Threshold) - Normal points up (+Y)
    // Order: doorBottomRight, doorInnerBottomRight, doorInnerBottomLeft, doorBottomLeft (CCW from Above)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorBottomRight, doorInnerBottomRight, doorInnerBottomLeft, doorBottomLeft,
        new THREE.Vector3(0, 1, 0)
    )


    // --- 7b. Window Jamb Faces (Thickness faces) ---
    const innerXRight_Win = halfWidth - DEFAULT_WALL_THICKNESS // X-coord for inner window corners

    // Inner Window Corners (at X = innerXRight_Win)
    const windowInnerBottomRight = new THREE.Vector3(innerXRight_Win, windowBottomY, windowZLeft)
    const windowInnerBottomLeft = new THREE.Vector3(innerXRight_Win, windowBottomY, windowZRight)
    const windowInnerTopRight = new THREE.Vector3(innerXRight_Win, windowYTop, windowZLeft)
    const windowInnerTopLeft = new THREE.Vector3(innerXRight_Win, windowYTop, windowZRight)

    // Window Top Jamb (Normal 0, -1, 0) - CCW from Below
    vertexCount += addQuad(vertices, uvs, normals, indices,
        windowInnerTopLeft, windowInnerTopRight, windowOuterTopRight, windowOuterTopLeft,
        new THREE.Vector3(0, -1, 0)
    )

    // Window Bottom Jamb (Normal 0, 1, 0) - CCW from Above
    vertexCount += addQuad(vertices, uvs, normals, indices,
        windowOuterBottomLeft, windowOuterBottomRight, windowInnerBottomRight, windowInnerBottomLeft,
        new THREE.Vector3(0, 1, 0)
    )

    // Window Left Jamb (Back side, -Z direction) - Normal (0, 0, 1) - CCW looking from Back (-Z)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        windowOuterTopLeft, windowOuterBottomLeft, windowInnerBottomLeft, windowInnerTopLeft,
        new THREE.Vector3(0, 0, -1)
    )

    // Window Right Jamb (Front side, +Z direction) - Normal (0, 0, -1) - CCW looking from Front (+Z)
    vertexCount += addQuad(vertices, uvs, normals, indices,
        windowOuterBottomRight, windowOuterTopRight, windowInnerTopRight, windowInnerBottomRight,
        new THREE.Vector3(0, 0, 1)
    )


    // --- 8. Define Inner Room Corners ---
    // Inner dimensions
    const innerXLeft = -halfWidth + DEFAULT_WALL_THICKNESS
    const innerXRight = halfWidth - DEFAULT_WALL_THICKNESS
    const innerZBack = -halfDepth + DEFAULT_WALL_THICKNESS
    const innerZFront = halfDepth - DEFAULT_WALL_THICKNESS

    const innerFloorY = doorYBottom
    const innerCeilingY = doorYTop - 0.15 // Slight roof slant

    // --- Inner Floor Corners (Y = innerFloorY) ---
    // Back Wall
    const innerFloorBL = new THREE.Vector3(innerXLeft, innerFloorY, innerZBack)
    const innerFloorBR = new THREE.Vector3(innerXRight, innerFloorY, innerZBack)
    // Front Wall Line (Z = innerZFront) - Corners adjacent to Doorway
    const innerFloorFL_DoorAdjacent = new THREE.Vector3(innerXLeft, innerFloorY, innerZFront) // Left corner on front wall line
    const innerFloorFR_DoorAdjacent = new THREE.Vector3(innerXRight, innerFloorY, innerZFront) // Right corner on front wall line
    // Points on Back Wall Line (Z = innerZBack) aligned with Doorway edges
    const innerFloorBL_NearDoor = new THREE.Vector3(doorXLeft, innerFloorY, innerZBack)
    const innerFloorBR_NearDoor = new THREE.Vector3(doorXRight, innerFloorY, innerZBack)

    // --- Inner Ceiling Corners (Y = innerCeilingY) ---
    // Back Wall
    const innerCeilBL = new THREE.Vector3(innerXLeft, innerCeilingY, innerZBack)
    const innerCeilBR = new THREE.Vector3(innerXRight, innerCeilingY, innerZBack)
    // Front Wall Line (Z = innerZFront) - Corners adjacent to Doorway
    const innerCeilFL_DoorAdjacent = new THREE.Vector3(innerXLeft, innerCeilingY, innerZFront) // Left corner on front wall line
    const innerCeilFR_DoorAdjacent = new THREE.Vector3(innerXRight, innerCeilingY, innerZFront) // Right corner on front wall line
    // Points on Back Wall Line (Z = innerZBack) aligned with Doorway edges
    const innerCeilBL_NearDoor = new THREE.Vector3(doorXLeft, innerCeilingY, innerZBack)
    const innerCeilBR_NearDoor = new THREE.Vector3(doorXRight, innerCeilingY, innerZBack)


    // --- 9. Inside Floor ---
    // Normal points UP (0, 1, 0). Vertices CCW from above.
    const floorNormal = new THREE.Vector3(0, 1, 0)

    // Floor - Left Strip (Texture flow: Front Wall to Back Wall, Left of Door)
    // TR, BR, BL, TL (relative to this quad, looking down)
    // TR = doorInnerBottomLeft, BR = innerFloorBL_NearDoor, BL = innerFloorBL, TL = innerFloorFL_DoorAdjacent
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerBottomLeft, innerFloorBL_NearDoor, innerFloorBL, innerFloorFL_DoorAdjacent,
        floorNormal
    )

    // Floor - Right Strip (Texture flow: Front Wall to Back Wall, Right of Door)
    // TR, BR, BL, TL
    // TR = innerFloorFR_DoorAdjacent, BR = innerFloorBR, BL = innerFloorBR_NearDoor, TL = doorInnerBottomRight
    vertexCount += addQuad(vertices, uvs, normals, indices,
        innerFloorFR_DoorAdjacent, innerFloorBR, innerFloorBR_NearDoor, doorInnerBottomRight,
        floorNormal
    )

    // Floor - Middle Strip (Texture flow: Front Wall to Back Wall, Between Door Alignments)
    // TL, BL, BR, TR
    // TL = doorInnerBottomRight, BL = innerFloorBR_NearDoor, BR = innerFloorBL_NearDoor, TR = doorInnerBottomLeft
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerBottomRight, innerFloorBR_NearDoor, innerFloorBL_NearDoor, doorInnerBottomLeft,
        floorNormal
    )


    // --- 10. Inside Ceiling ---
    // Normal points DOWN (0, -1, 0). Vertices CCW from below.
    // Order: BL, BR, TR, TL (looking from right to left, looking up)
    const ceilNormal = new THREE.Vector3(0, -1, 0)

    // Ceiling - Left Strip (Texture Flow: Front Wall to Back Wall, Left of Door)
    // BL = innerCeilFL_DoorAdjacent, BR = innerCeilBL, TR = innerCeilBL_NearDoor, TL = doorInnerTopLeft
    vertexCount += addQuad(vertices, uvs, normals, indices,
        innerCeilFL_DoorAdjacent, innerCeilBL, innerCeilBL_NearDoor, doorInnerTopLeft,
        ceilNormal
    )

    // Ceiling - Right Strip (Texture Flow: Front Wall to Back Wall, Right of Door)
    // BL = doorInnerTopRight, BR = innerCeilBR, TR = innerCeilBR_NearDoor, TL = innerCeilFR_DoorAdjacent
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopRight, innerCeilBR_NearDoor, innerCeilBR, innerCeilFR_DoorAdjacent,
        ceilNormal
    )

    // Ceiling - Middle Strip (Texture Flow: Front Wall to Back Wall, Between Door Alignments)
    // BL = doorInnerTopLeft, BR = innerCeilBL_NearDoor, TR = innerCeilBR_NearDoor, TL = doorInnerTopRight
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopLeft, innerCeilBL_NearDoor, innerCeilBR_NearDoor, doorInnerTopRight,
        ceilNormal
    )


    // --- 11. Inside Walls ---
    // Normals point inwards relative to the house center.
    // All walls go from innerFloorY to innerCeilingY

    // Inside Back Wall (Normal points forward +Z)
    // Order: BL, BR, TR, TL (CCW from front)
    // BL=innerFloorBL, BR=innerFloorBR, TR=innerCeilBR, TL=innerCeilBL
    vertexCount += addQuad(vertices, uvs, normals, indices,
        innerFloorBL, innerFloorBR, innerCeilBR, innerCeilBL,
        new THREE.Vector3(0, 0, 1)
    )

    // Inside Left Wall (Normal points right +X)
    // Order: BL, BR, TR, TL (CCW from right)
    // BL=innerFloorFL_DoorAdjacent, BR=innerFloorBL, TR=innerCeilBL, TL=innerCeilFL_DoorAdjacent
    vertexCount += addQuad(vertices, uvs, normals, indices,
        innerFloorFL_DoorAdjacent, innerFloorBL, innerCeilBL, innerCeilFL_DoorAdjacent,
        new THREE.Vector3(1, 0, 0)
    )

    // Inside Right Wall (Normal points left -X)
    const innerRightNormal = new THREE.Vector3(-1, 0, 0)

    // --- Right Inner Wall Segments (CCW from Left / -X view) ---
    // v1=BottomLeft, v2=BottomRight, v3=TopRight, v4=TopLeft relative to segment view
    // Note: windowInnerBottom(Left,Right,Top,Bottom) - As seen from outside (right) / +X view

    // Right Inner - Bottom Segment (Below Window)
    // Order: BL, BR, TR, TL
    corners = [innerFloorBR, innerFloorFR_DoorAdjacent, windowInnerBottomLeft, windowInnerBottomRight]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], innerRightNormal, getRightUVs(corners))

    // Right Inner - Right Segment (Right side of window)
    // Order: BL, BR, TR, TL
    corners = [windowInnerBottomLeft, innerFloorFR_DoorAdjacent, innerCeilFR_DoorAdjacent, windowInnerTopLeft]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], innerRightNormal, getRightUVs(corners))

    // Right Inner - Left Segment (Left side of window)
    // Order: BL, BR, TR, TL
    corners = [innerFloorBR, windowInnerBottomRight, windowInnerTopRight, innerCeilBR]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], innerRightNormal, getRightUVs(corners))

    // Right Inner - Top Segment (Above Window)
    // Order: BL, BR, TR, TL
    corners = [innerCeilBR, windowInnerTopRight, windowInnerTopLeft, innerCeilFR_DoorAdjacent]
    vertexCount += addQuad(vertices, uvs, normals, indices, corners[0], corners[1], corners[2], corners[3], innerRightNormal, getRightUVs(corners))

    // Inside Front Wall Segments (around doorway)
    const innerFrontNormal = new THREE.Vector3(0, 0, -1) // Normal points backward (into the house)

    // Inside Front Right (Right of Doorway from back)
    // Order: TL, BL, BR, TR (CCW from back)
    // TL=doorInnerTopLeft, BL=doorInnerBottomLeft, BR=innerFloorFL_DoorAdjacent, TR=innerCeilFL_DoorAdjacent
    vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopLeft, doorInnerBottomLeft, innerFloorFL_DoorAdjacent, innerCeilFL_DoorAdjacent,
        innerFrontNormal
    )

    // Inside Front Left (Left of Doorway from back)
    // Order: TL, BL, BR, TR (CCW from back)
    // TL=innerCeilFR_DoorAdjacent, BL=innerFloorFR_DoorAdjacent BR=doorInnerBottomRight, TR=doorInnerTopRight
    vertexCount += addQuad(vertices, uvs, normals, indices,
        innerCeilFR_DoorAdjacent, innerFloorFR_DoorAdjacent, doorInnerBottomRight, doorInnerTopRight,
        innerFrontNormal
    )

    // Inside Front Top (Above Doorway)
    // Order: 
    // TR=doorInnerTopLeft, TL=doorInnerTopRight, TR=innerCeilFR_DoorAdjacent, TL=innerCeilFL_DoorAdjacent
    /* vertexCount += addQuad(vertices, uvs, normals, indices,
        doorInnerTopLeft, doorInnerTopRight, innerCeilFR_DoorAdjacent, innerCeilFL_DoorAdjacent,
        innerFrontNormal
    ) */


    // --- 12. Assign the Data ---
    // --- Assign data to BufferGeometry ---
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setIndex(indices)

    geometry.computeBoundingSphere()
    // geometry.computeVertexNormals() // Use if there are problems with normals added via addQuad, or need smoothing

    return geometry
}

export { createCustomHouse }