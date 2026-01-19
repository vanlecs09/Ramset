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
    const freq = 5;

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