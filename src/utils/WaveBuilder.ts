import * as BABYLON from '@babylonjs/core';

export const createWaveBlock = (
    scene: BABYLON.Scene,
    name: string,
    position: BABYLON.Vector3,
    blockWidth: number,
    blockHeight: number,
    blockDepth: number,

    waveAxis: 'x' | 'y' | 'z' | '-x' | '-y' | '-z',
    material: BABYLON.StandardMaterial
): BABYLON.Mesh => {
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    addBlockVertices(
        blockWidth,
        blockHeight,
        blockDepth,
        waveAxis,
        position,
        positions,
        indices,
        0,
        uvs,
    )

    const mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

    const normalsArray: number[] = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
    mesh.setIndices(indices);

    mesh.material = material;
    // mesh.position = position;

    return mesh;
};


const addBlockVertices = (
    blockWidth: number,
    blockHeight: number,
    blockDepth: number,
    direction: 'x' | 'y' | 'z' | '-x' | '-y' | '-z',
    concretePosition: BABYLON.Vector3,
    positions: number[],
    indices: number[],
    vertexCount: number,
    uvs: number[],
) => {
    const startVertex = vertexCount;
    const divU = 50;
    const divV = 10;
    const amp = 0.04;
    const freq = blockWidth * 10; // blockDepth 1 = freq 5

    // Helper function to apply rotation and scaling
    const transformVertex = (vertex: [number, number, number]): [number, number, number] => {
        let [x, y, z] = vertex;

        // Scale the unit block
        x *= blockWidth;
        y *= blockHeight;
        z *= blockDepth;

        // Apply rotation based on direction
        let rotatedX = x, rotatedY = y, rotatedZ = z;

        switch (direction) {
            case 'x':
                // Rotate 90° around Z axis
                [rotatedX, rotatedY] = [y, -x];
                break;
            case '-x':
                // Rotate -90° around Z axis to point head to (-1, 0, 0)
                [rotatedX, rotatedY] = [-y, x];
                break;
            case 'z':
                // Rotate 90° around X axis to point head to (0, 0, 1)
                [rotatedY, rotatedZ] = [-z, y];
                break;
            case '-z':
                // Rotate -90° around X axis to point head to (0, 0, -1)
                [rotatedY, rotatedZ] = [z, -y];
                break;
            case '-y':
                // Rotate 180° around Z axis to point head to (0, -1, 0)
                rotatedX = -x;
                rotatedY = -y;
                break;
        }

        // Translate by concrete position
        rotatedX += concretePosition.x;
        rotatedY += concretePosition.y;
        rotatedZ += concretePosition.z;

        return [rotatedX, rotatedY, rotatedZ];
    };

    // Outer face vertices (wavy surface)
    for (let iv = 0; iv <= divV; iv++) {
        const z = iv / divV - 0.5; // Normalized depth (-0.5 to 0.5)
        for (let iu = 0; iu <= divU; iu++) {
            const x = iu / divU - 0.5; // Normalized width (-0.5 to 0.5)
            const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

            // Build unit block with wave in local coordinates
            let posLocalX = x;
            let posLocalY = 0.5 + waveDisplacement;
            let posLocalZ = z;

            const [posX, posY, posZ] = transformVertex([posLocalX, posLocalY, posLocalZ]);
            positions.push(posX, posY, posZ);
            uvs.push(iu / divU, iv / divV);
        }
    }

    // Inner face vertices (flat surface)
    const offset = divV + 1;
    for (let iv = 0; iv <= divV; iv++) {
        const z = iv / divV - 0.5; // Normalized depth (-0.5 to 0.5)
        for (let iu = 0; iu <= divU; iu++) {
            const x = iu / divU - 0.5; // Normalized width (-0.5 to 0.5)

            // Build unit block without wave in local coordinates
            let posLocalX = x;
            let posLocalY = -0.5;
            let posLocalZ = z;

            const [posX, posY, posZ] = transformVertex([posLocalX, posLocalY, posLocalZ]);
            positions.push(posX, posY, posZ);
            uvs.push(iu / divU, iv / divV);
        }
    }

    const ring = divU + 1;

    // Outer face triangles
    for (let iv = 0; iv < divV; iv++) {
        for (let iu = 0; iu < divU; iu++) {
            const a = startVertex + iv * ring + iu;
            const b = a + 1;
            const c = a + ring;
            const d = c + 1;

            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    // Inner face triangles
    for (let iv = 0; iv < divV; iv++) {
        for (let iu = 0; iu < divU; iu++) {
            const a = startVertex + offset * ring + iv * ring + iu;
            const b = a + 1;
            const c = a + ring;
            const d = c + 1;

            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    // Side walls
    const backCol = divU;
    for (let iv = 0; iv < divV; iv++) {
        const outerA = startVertex + iv * ring;
        const outerB = startVertex + (iv + 1) * ring;
        const innerA = startVertex + offset * ring + iv * ring;
        const innerB = startVertex + offset * ring + (iv + 1) * ring;

        indices.push(outerA, outerB, innerA);
        indices.push(innerA, outerB, innerB);
    }

    for (let iv = 0; iv < divV; iv++) {
        const outerA = startVertex + iv * ring + backCol;
        const outerB = startVertex + (iv + 1) * ring + backCol;
        const innerA = startVertex + offset * ring + iv * ring + backCol;
        const innerB = startVertex + offset * ring + (iv + 1) * ring + backCol;

        indices.push(outerA, innerA, outerB);
        indices.push(innerA, innerB, outerB);
    }

    // Bottom wall
    for (let iu = 0; iu < divU; iu++) {
        const outerA = startVertex + iu;
        const outerB = startVertex + iu + 1;
        const innerA = startVertex + offset * ring + iu;
        const innerB = startVertex + offset * ring + iu + 1;

        indices.push(outerA, innerA, outerB);
        indices.push(innerA, innerB, outerB);
    }

    // Top wall
    const topRow = startVertex + divV * ring;
    for (let iu = 0; iu < divU; iu++) {
        const outerA = topRow + iu;
        const outerB = topRow + iu + 1;
        const innerA = startVertex + offset * ring + divV * ring + iu;
        const innerB = startVertex + offset * ring + divV * ring + iu + 1;

        indices.push(outerA, outerB, innerA);
        indices.push(innerA, outerB, innerB);
    }

    vertexCount += (divV + 1) * (divU + 1) * 2;
};

/**
 * Create a 3D standing wave on top of a circular column
 * @param scene - Babylon.js scene
 * @param position - Center position of the wave
 * @param radius - Radius of the circular wave pattern
 * @param height - Height of the wave oscillation
 * @param material - Material to apply to the wave
 * @param waveAmplitude - Amplitude of the wave (default 0.05)
 * @param waveFrequency - Frequency of the wave pattern (default 5)
 * @returns Babylon.js Mesh representing the 3D standing wave
 */
export const createCircularStandingWave = (
    scene: BABYLON.Scene,
    position: BABYLON.Vector3,
    radius: number,
    height: number,
    material: BABYLON.StandardMaterial,
    waveAmplitude: number = 0.05,
    waveFrequency: number = 5
): BABYLON.Mesh => {
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const divTheta = 64; // Angular divisions (circumference segments)
    const divRadius = 16; // Radial divisions

    // Outer face vertices (wavy surface)
    for (let ir = 0; ir <= divRadius; ir++) {
        const r = (ir / divRadius) * radius;
        
        for (let itheta = 0; itheta <= divTheta; itheta++) {
            const theta = (itheta / divTheta) * Math.PI * 2; // Full circle

            // Calculate standing wave height based on radius and angle
            // This creates concentric circular waves
            const radialWave = Math.sin((ir / divRadius) * Math.PI) * waveAmplitude;
            const angularWave = Math.cos(theta * waveFrequency) * waveAmplitude;
            const waviness = (radialWave + angularWave) / 2;

            // Calculate position
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = height / 2 + (waviness * height);

            positions.push(
                position.x + x,
                position.y + y,
                position.z + z
            );

            // UV coordinates
            uvs.push(ir / divRadius, itheta / divTheta);
        }
    }

    // Inner face vertices (flat surface below the wave)
    const offset = (divRadius + 1) * (divTheta + 1);
    for (let ir = 0; ir <= divRadius; ir++) {
        const r = (ir / divRadius) * radius;
        
        for (let itheta = 0; itheta <= divTheta; itheta++) {
            const theta = (itheta / divTheta) * Math.PI * 2; // Full circle

            // Calculate position - flat surface at the bottom
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = position.y - height / 2; // Flat bottom surface

            positions.push(
                position.x + x,
                y,
                position.z + z
            );

            // UV coordinates
            uvs.push(ir / divRadius, itheta / divTheta);
        }
    }

    // Generate indices (triangles)
    const ring = divTheta + 1;
    
    // Outer face triangles (wavy surface)
    for (let ir = 0; ir < divRadius; ir++) {
        for (let itheta = 0; itheta < divTheta; itheta++) {
            const current = ir * ring + itheta;
            const next = current + 1;
            const nextRing = (ir + 1) * ring + itheta;
            const nextRingNext = nextRing + 1;

            // First triangle
            indices.push(current, nextRing, next);
            // Second triangle
            indices.push(next, nextRing, nextRingNext);
        }
    }

    // Inner face triangles (flat bottom surface - reversed winding for backface)
    for (let ir = 0; ir < divRadius; ir++) {
        for (let itheta = 0; itheta < divTheta; itheta++) {
            const current = offset + ir * ring + itheta;
            const next = current + 1;
            const nextRing = offset + (ir + 1) * ring + itheta;
            const nextRingNext = nextRing + 1;

            // Reversed winding for inner face
            indices.push(current, next, nextRing);
            indices.push(next, nextRingNext, nextRing);
        }
    }

    // Side walls connecting outer and inner surfaces
    for (let ir = 0; ir < divRadius; ir++) {
        const outerA = ir * ring;
        const outerB = (ir + 1) * ring;
        const innerA = offset + ir * ring;
        const innerB = offset + (ir + 1) * ring;

        // Center wall (first radial ring)
        indices.push(outerA, innerA, outerB);
        indices.push(innerA, innerB, outerB);
    }

    for (let ir = 0; ir < divRadius; ir++) {
        const outerA = ir * ring + divTheta;
        const outerB = (ir + 1) * ring + divTheta;
        const innerA = offset + ir * ring + divTheta;
        const innerB = offset + (ir + 1) * ring + divTheta;

        // Outer wall (last radial ring)
        indices.push(outerA, outerB, innerA);
        indices.push(innerA, outerB, innerB);
    }

    // Angular side walls
    for (let itheta = 0; itheta <= divTheta; itheta++) {
        for (let ir = 0; ir < divRadius; ir++) {
            const outerA = ir * ring + itheta;
            const outerB = (ir + 1) * ring + itheta;
            const innerA = offset + ir * ring + itheta;
            const innerB = offset + (ir + 1) * ring + itheta;

            indices.push(outerA, outerB, innerA);
            indices.push(innerA, outerB, innerB);
        }
    }

    // Create mesh
    const mesh = new BABYLON.Mesh('circularStandingWave', scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
    mesh.setIndices(indices);

    // Compute normals
    const normalsArray: number[] = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);

    mesh.material = material;

    return mesh;
};