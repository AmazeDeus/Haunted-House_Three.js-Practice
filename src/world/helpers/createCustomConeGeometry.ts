import * as THREE from 'three'

/**
 * Creates a custom BufferGeometry for a cone/pyramid shape.
 * This provides more control over UVs and Normals than THREE.ConeGeometry,
 * especially useful for a 4-sided pyramid with specific texture mapping and flat shading.
 *
 * @param radius - The radius of the cone's base.
 * @param height - The height of the cone.
 * @param radialSegments - The number of triangular segments around the cone. Should be 4 for the intended pyramid shape.
 * @returns A THREE.BufferGeometry representing the custom cone/pyramid.
 */
function createCustomConeGeometry(
    radius: number,
    height: number,
    radialSegments: number // Should be 4 for the pyramid
): THREE.BufferGeometry {
    // 1. Initialize Geometry and Data Arrays
    // BufferGeometry is used for custom shapes where you define everything manually
    const geometry = new THREE.BufferGeometry()

    // Arrays to hold the raw data for the geometry
    const vertices: number[] = []                               // vertices: Holds 3D coordinates (x, y, z) for each point
    const uvs: number[] = []                                    // uvs: Holds 2D texture coordinates (u, v) corresponding to each vertex
    const normals: number[] = []                                // normals: Holds 3D normal vectors (nx, ny, nz) corresponding to each vertex, defining surface direction for lighting. These will be calculated manually for flat shading
    const indices: number[] = []                                // Holds indices (pointers) into the vertices array to define triangles (faces)
    // Keeps track of the current vertex index being added
    let index = 0

    // Define key points of the pyramid/cone
    const tip = new THREE.Vector3(0, height / 2, 0)             // Top point of the pyramid
    const baseCenter = new THREE.Vector3(0, -height / 2, 0)     // Center of the base (used for non-4-segment bases)

    // --- Part 1: Create the Sloped Sides (Triangular Faces) ---
    // Create vertices, UVs, and normals for each side face independently
    for (let i = 0; i < radialSegments; i++) {
        // First Triangle Analysis (i=0):
            // tip = +y
            // angle1 = 0. v1 = (radius, -height/2, 0) => On the X-axis base
            // angle2 = Small positive. v2 = Slightly rotated CCW from v1 on the base (sin(a2) - positive Z)
            // => now know vertices push order = Tip -> v2 -> v1 results in CCW (counter-clockwise)
            // => => Push the UV position for each pushed vertex (Pushing the tip first is the important thing here for it to match the push order of the vertices)

        // Calculate the angles for the two base vertices of the current triangular face
        const angle1 = (i / radialSegments) * Math.PI * 2       // Angle for the first base vertex
        const angle2 = ((i + 1) / radialSegments) * Math.PI * 2 // Angle for the second base vertex

        // Calculate the 3D positions of the two base vertices using trigonometry on a circle (cos(x) and sin(x))
        const v1 = new THREE.Vector3(
            Math.cos(angle1) * radius,          // x coordinate
            -height / 2,                        // y coordinate (base level)
            Math.sin(angle1) * radius           // z coordinate
        )
        const v2 = new THREE.Vector3(
            Math.cos(angle2) * radius,          // x coordinate
            -height / 2,                        // y coordinate (base level)
            Math.sin(angle2) * radius           // z coordinate
        )

        // --- Define the vertices for this triangle face ---
        // Order matters for face orientation (clockwise or counter-clockwise)
        // Here: Tip -> v2 -> v1 forms one side triangle for CCW winding (counter-clockwise)
        vertices.push(tip.x, tip.y, tip.z)      // Vertex 0 (Tip) - index 'index'
        vertices.push(v2.x, v2.y, v2.z)         // Vertex 1 (Base Right) - index 'index + 1'
        vertices.push(v1.x, v1.y, v1.z)         // Vertex 2 (Base Left) - index 'index + 2'

        // --- Define the UV coordinates for this triangle's vertices ---
        // These values determine how the texture maps onto this face
        // (0.5, 1) maps to the texture's top-center (for the tip)
        // (1, 0) maps to the texture's bottom-right (for v2)
        // (0, 0) maps to the texture's bottom-left (for v1)
        // This means each side face uses a triangular portion of the texture from the bottom edge up to the center top
        uvs.push(0.5, 1) // UV for Tip
        uvs.push(1, 0)   // UV for V2
        uvs.push(0, 0)   // UV for V1

        // --- Calculate the Normal vector for this triangle face ---
        // The normal determines how light reflects off this face.
        // Calculate two vectors along the edges of the triangle (Tip -> v1 and Tip -> v2).
        const edge1 = new THREE.Vector3().subVectors(v1, tip)   // Edge V1 -> Tip (reversed for cross product order)
        const edge2 = new THREE.Vector3().subVectors(v2, tip)   // Edge V2 -> Tip

        // The cross product gives a vector perpendicular to both edge vectors (i.e., perpendicular to the face)
        // normalize() makes the vector length 1, which is standard for normals
        const normal = new THREE.Vector3().crossVectors(edge2, edge1).normalize()

        // Note:
        // I had to reverse the positions of "edge2" and "edge1" in the crossVectors method above to fix inward-pointing normals
        // There might be some slight discrepancies in the earlier comments, or a misunderstanding of the order on my part

        // --- Assign the *same* normal to all 3 vertices of this triangle ---
        // This results in "flat shading" - The entire face is lit uniformly
        normals.push(normal.x, normal.y, normal.z)              // Normal for tip vertex
        normals.push(normal.x, normal.y, normal.z)              // Normal for v2 vertex
        normals.push(normal.x, normal.y, normal.z)              // Normal for v1 vertex

        // --- Define the indices for this triangle ---
        // Tell Three.js to form a triangle using the 3 vertices that were just added
        // Order matters for winding (and backface culling)
        // Tip, V2, V1 for CCW from outside
        indices.push(index, index + 1, index + 2)

        // Increment the index counter because of the added 3 vertices
        index += 3
    }

    // --- Part 2: Create the Bottom Cap (Base) ---
    // Create the base as two triangles (a quad) for proper square UV mapping

    // Special handling for a 4-sided pyramid (square base)
    if (radialSegments === 4) {
        // Define the 4 corner vertices of the square base explicitly.
        // These align with the axes when rotation is applied later.
        const baseCorners = [
            new THREE.Vector3(radius, -height / 2, 0),          // Front-right = +X, Z=0 (angle 0)
            new THREE.Vector3(0, -height / 2, radius),          // Back-right = X=0, +Z (angle PI/2)
            new THREE.Vector3(-radius, -height / 2, 0),         // Back-left = -X, Z=0 (angle PI)
            new THREE.Vector3(0, -height / 2, -radius)          // Front-left = X=0, -Z (angle 3PI/2)
        ]

        // Define UV coordinates for the base corners, mapping a square texture area (mapping to 0,0 -> 1,1)
        // Here you would adjust order to match how triangles will be built
        const baseUVs = [
            new THREE.Vector2(1, 0),                            // Corresponds to baseCorners[0] (Front-right of texture) - (+X, Z=0)
            new THREE.Vector2(1, 1),                            // Corresponds to baseCorners[1] (Back-right of texture) - (X=0, +Z)
            new THREE.Vector2(0, 1),                            // Corresponds to baseCorners[2] (Back-left of texture) - (-X, Z=0)
            new THREE.Vector2(0, 0)                             // Corresponds to baseCorners[3] (Front-left of texture) - (X=0, -Z)
        ]

        // The normal for the base faces straight down.
        const baseNormal = new THREE.Vector3(0, -1, 0)

        // --- Create the first triangle of the square base (corners 0, 1, 2) ---
        vertices.push(baseCorners[0].x, baseCorners[0].y, baseCorners[0].z)         // index 'index'
        vertices.push(baseCorners[1].x, baseCorners[1].y, baseCorners[1].z)         // index 'index + 1'
        vertices.push(baseCorners[2].x, baseCorners[2].y, baseCorners[2].z)         // index 'index + 2'
        // Assign corresponding UVs
        uvs.push(baseUVs[0].x, baseUVs[0].y)
        uvs.push(baseUVs[1].x, baseUVs[1].y)
        uvs.push(baseUVs[2].x, baseUVs[2].y)
        // Assign the downward-facing normal to all 3 vertices for flat shading
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        // Define indices for this triangle
        // CCW from below
        indices.push(index, index + 1, index + 2)
        // Added 3 vertices
        index += 3

        // --- Create the second triangle of the square base (corners 0, 2, 3) ---
        vertices.push(baseCorners[0].x, baseCorners[0].y, baseCorners[0].z)         // index 'index'
        vertices.push(baseCorners[2].x, baseCorners[2].y, baseCorners[2].z)         // index 'index + 1'
        vertices.push(baseCorners[3].x, baseCorners[3].y, baseCorners[3].z)         // index 'index + 2'
        // Assign corresponding UVs
        uvs.push(baseUVs[0].x, baseUVs[0].y)
        uvs.push(baseUVs[2].x, baseUVs[2].y)
        uvs.push(baseUVs[3].x, baseUVs[3].y)
        // Assign the downward-facing normal to all 3 vertices
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        normals.push(baseNormal.x, baseNormal.y, baseNormal.z)
        // Define indices for this triangle
        indices.push(index, index + 1, index + 2)
        // Added 3 vertices
        index += 3

    } else {
        // --- Fallback: Create a circular base cap for non-4 segments (like a standard cone) - (original triangle fan, might still have UV issues) ---
        // This part creates a fan of triangles originating from the base center vertex.

        // Add the center vertex of the base cap
        vertices.push(baseCenter.x, baseCenter.y, baseCenter.z)
        uvs.push(0.5, 0.5)                                              // UV for the center (often the middle of the texture)
        normals.push(0, -1, 0)                                          // Normal points down
        const baseCenterIndex = index                                   // Store the index of this center vertex
        index++

        // Add vertices around the edge of the base circle (with planar UVs - potential distortion)
        const capEdgeStartIndex = index                                 // Store the index where edge vertices start
        for (let i = 0; i <= radialSegments; i++) {                     // Loop one extra time to close the circle
            const angle = (i / radialSegments) * Math.PI * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            vertices.push(x, -height / 2, z)                            // Add edge vertex position
            normals.push(0, -1, 0)                                      // Normal points down

            // Calculate UVs for the edge vertices - Original planar UV mapping (mapping radially from the center - causes diamond distortion on square)
            const u_cap = (x / radius) * 0.5 + 0.5                      // Map x from [-radius, radius] to [0, 1] for U
            const v_cap = (z / radius) * 0.5 + 0.5                      // Map z from [-radius, radius] to [0, 1] for V
            uvs.push(u_cap, v_cap)
            index++
        }

        // Create the triangular faces for the base cap
        for (let i = 0; i < radialSegments; i++) {
            const edgeV1Index = capEdgeStartIndex + i                   // Index of the first edge vertex
            const edgeV2Index = capEdgeStartIndex + i + 1               // Index of the second edge vertex

            // Create a triangle: Base Center -> Edge Vertex 1 -> Edge Vertex 2
            // CCW from below
            indices.push(baseCenterIndex, edgeV1Index, edgeV2Index)
        }
    }

    // --- Part 3: Assign data to the BufferGeometry ---
    // Three.js needs the data in specific "Attribute" objects

    // Set the 'position' attribute using the vertices array
    // '3' means each vertex position consists of 3 numbers (x, y, z)
    // --- Set Attributes ---
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
    )

    // Set the 'uv' attribute using the uvs array
    // '2' means each UV coordinate consists of 2 numbers (u, v)
    geometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
    )

    // Set the 'normal' attribute using the manually calculated normals array
    // '3' means each normal vector consists of 3 numbers (nx, ny, nz)
    geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3)
    )

    // Set the 'index' attribute using the indices array
    // This tells Three.js how to connect the vertices into triangles
    geometry.setIndex(indices)

    // Optional but good practice: Calculate a sphere that encloses the geometry.
    // Used for performance optimizations like view frustum culling.
    geometry.computeBoundingSphere()

    // IMPORTANT: Since the normals are calculated manually for flat shading,
    // DO NOT call geometry.computeVertexNormals() as that would
    // overwrite the custom normals and try to smooth them
    // geometry.computeVertexNormals()

    // Return the finished custom geometry
    return geometry
}

export { createCustomConeGeometry }