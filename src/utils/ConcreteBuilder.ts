import * as BABYLON from '@babylonjs/core';

export interface ConcreteGroup {
    mesh?: BABYLON.Mesh;
    material?: BABYLON.StandardMaterial;
    infiniteBlocks?: BABYLON.Mesh[];
}

// Global concrete material - shared across all concrete instances
let concreteMaterial: BABYLON.StandardMaterial | null = null;
let sinBlockMaterial: BABYLON.StandardMaterial | null = null;

const initializeConcreteMaterial = (scene: BABYLON.Scene) => {
    if (!concreteMaterial) {
        concreteMaterial = new BABYLON.StandardMaterial('concreteMaterial', scene);
        concreteMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
        concreteMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        concreteMaterial.alpha = 0.4;                                    // transparency (0 = invisible, 1 = opaque)
        concreteMaterial.backFaceCulling = false;
    }
    return concreteMaterial;
};

const initializeSinBlockMaterial = (scene: BABYLON.Scene) => {
    if (!sinBlockMaterial) {
        sinBlockMaterial = new BABYLON.StandardMaterial('sinBlockMaterial', scene);
        sinBlockMaterial.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);   // tan/beige color
        sinBlockMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        sinBlockMaterial.alpha = 0.5;  // semi-transparent
        // sinBlockMaterial.backFaceCulling = false;
        sinBlockMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    }
    return sinBlockMaterial;
};


export const createConcrete = (
    scene: BABYLON.Scene,
    concreteThickness: number = 1,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    finiteBlockPositions: BABYLON.Vector3[] = [],
    parent?: BABYLON.TransformNode,
    isFiniteConcrete: boolean = true
): ConcreteGroup => {
    const material = initializeConcreteMaterial(scene);

    const concrete = BABYLON.MeshBuilder.CreateBox(
        'concrete',
        { width: concreteWidth, height: concreteThickness, depth: concreteDepth },
        scene
    );
    concrete.position = concretePosition;
    concrete.material = material;
    concrete.receiveShadows = true;

    if (parent) {
        concrete.parent = parent as BABYLON.Node;
    }


    const sinBlocks = !isFiniteConcrete
        ? createInfiniteBlocks(
            scene,
            finiteBlockPositions,
            concreteWidth,
            concreteDepth,
            concreteThickness,
            concretePosition,
            parent
        )
        : [];

    return {
        mesh: concrete,
        material: material,
        infiniteBlocks: sinBlocks,
    };
};

export const updateConcrete = (
    concreteGroup: ConcreteGroup,
    scene: BABYLON.Scene,
    concreteThickness: number = 1,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    finiteBlockPositions: BABYLON.Vector3[] = [],
    parent?: BABYLON.TransformNode,
    isFiniteConcrete: boolean = true
) => {
    // Dispose old concrete mesh
    if (concreteGroup.mesh) {
        concreteGroup.mesh.dispose();
    }

    // Dispose old sin blocks
    if (concreteGroup.infiniteBlocks) {
        for (let i = concreteGroup.infiniteBlocks.length - 1; i >= 0; i--) {
            concreteGroup.infiniteBlocks[i].dispose();
        }
        concreteGroup.infiniteBlocks = [];
    }

    const material = initializeConcreteMaterial(scene);

    const concrete = BABYLON.MeshBuilder.CreateBox(
        'concrete',
        { width: concreteWidth, height: concreteThickness, depth: concreteDepth },
        scene
    );
    concrete.position = concretePosition;
    concrete.material = material;
    concrete.receiveShadows = true;

    if (parent) {
        concrete.parent = parent as BABYLON.Node;
    }

    const sinBlocks = !isFiniteConcrete
        ? createInfiniteBlocks(
            scene,
            finiteBlockPositions,
            concreteWidth,
            concreteDepth,
            concreteThickness,
            concrete.position,
            parent
        )
        : [];

    concreteGroup.mesh = concrete;
    concreteGroup.material = material;
    concreteGroup.infiniteBlocks = sinBlocks;
};

const createInfiniteBlocks = (
    scene: BABYLON.Scene,
    finiteBlockPositions: BABYLON.Vector3[] = [],
    concreteWidth: number,
    concreteDepth: number,
    concreteThickness: number,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    parent?: BABYLON.TransformNode
): BABYLON.Mesh[] => {
    const sinBlockMat = initializeSinBlockMaterial(scene);

    // Create a single mesh that surrounds the concrete on all sides
    const surroundingMesh = createSurroundingConcreteMesh(
        scene,
        'infiniteBlock',
        concreteWidth,
        concreteDepth,
        concreteThickness,
        concretePosition,
        sinBlockMat
    );

    if (parent) {
        surroundingMesh.parent = parent as BABYLON.Node;
    }

    return [surroundingMesh];
};

const createSurroundingConcreteMesh = (
    scene: BABYLON.Scene,
    name: string,
    concreteWidth: number,
    concreteDepth: number,
    concreteThickness: number,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    material: BABYLON.StandardMaterial
): BABYLON.Mesh => {
    const blockThickness = 0.5;
    const amp = 0.05;
    const freq = 10;
    const divU = 50;
    const divV = 10;

    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    let vertexCount = 0;

    // Helper function to add a block's vertices and indices
    const addBlockVertices = (
        blockWidth: number,
        blockHeight: number,
        blockDepth: number,
        direction: 'x' | '-x' | 'z' | '-z'
    ) => {
        const startVertex = vertexCount;

        // Outer face vertices (wavy surface)
        const outerWidth = blockWidth + blockDepth * 2;
        for (let iv = 0; iv <= divV; iv++) {
            const v = (iv / divV) * blockHeight + concretePosition.y - blockHeight / 2;
            for (let iu = 0; iu <= divU; iu++) {
                const u = (iu / divU - 0.5) * outerWidth;
                const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

                if (direction === 'z') {
                    positions.push(u + concretePosition.x, v, blockDepth + waveDisplacement + concreteDepth / 2 + concretePosition.z);
                } else if (direction === '-z') {
                    positions.push(u + concretePosition.x, v, -blockDepth - waveDisplacement - concreteDepth / 2 + concretePosition.z);
                } else if (direction === 'x') {
                    positions.push(blockDepth + waveDisplacement + concreteWidth / 2 + concretePosition.x, v, u + concretePosition.z);
                } else if (direction === '-x') {
                    positions.push(-blockDepth - waveDisplacement - concreteWidth / 2 + concretePosition.x, v, u + concretePosition.z);
                }
                uvs.push(iu / divU, iv / divV);
            }
        }

        // Inner face vertices (flat surface)
        const offset = divV + 1;
        for (let iv = 0; iv <= divV; iv++) {
            const v = (iv / divV) * blockHeight + concretePosition.y - blockHeight / 2;
            for (let iu = 0; iu <= divU; iu++) {
                const u = (iu / divU - 0.5) * blockWidth;

                if (direction === 'z') {
                    positions.push(u + concretePosition.x, v, concreteDepth / 2 + concretePosition.z);
                } else if (direction === '-z') {
                    positions.push(u + concretePosition.x, v, - concreteDepth / 2 + concretePosition.z);
                } else if (direction === 'x') {
                    positions.push(concreteWidth / 2 + concretePosition.x, v, u + concretePosition.z);
                } else if (direction === '-x') {
                    positions.push(-concreteWidth / 2 + concretePosition.x, v, u + concretePosition.z);
                }
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

    // Add all four blocks with the margin
    addBlockVertices(
        concreteWidth,
        concreteThickness,
        blockThickness,
        'z'
    );
    addBlockVertices(
        concreteWidth,
        concreteThickness,
        blockThickness,
        '-z'
    );
    addBlockVertices(
        concreteDepth,
        concreteThickness,
        blockThickness,
        'x'
    );
    addBlockVertices(
        concreteDepth,
        concreteThickness,
        blockThickness,
        '-x'
    );

    const mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

    const normalsArray: number[] = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
    mesh.setIndices(indices);

    mesh.material = material;

    return mesh;
};

const createWaveBlock = (
    scene: BABYLON.Scene,
    name: string,
    position: BABYLON.Vector3,
    blockWidth: number,
    blockHeight: number,
    blockDepth: number,
    waveAxis: 'x' | 'y' | 'z' | '-x' | '-y' | '-z',
    material: BABYLON.StandardMaterial
): BABYLON.Mesh => {
    //  blockHeight = 2;

    const amp = 0.05;      // sine amplitude
    const freq = 10;        // wave frequency
    const divU = 50;       // subdivisions along wave direction
    const divV = 10;//Math.max(5, Math.floor(blockHeight * 10)); // subdivisions along height


    // blockWidth = 2

    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    // Outer face vertices (wavy surface)
    for (let iv = 0; iv <= divV; iv++) {
        const v = (iv / divV) * blockHeight;
        for (let iu = 0; iu <= divU; iu++) {
            const u = (iu / divU - 0.5) * blockWidth;
            const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

            if (waveAxis === 'x') {
                positions.push(blockDepth / 2 + waveDisplacement, v, u);
            } else if (waveAxis === '-x') {
                positions.push(-blockDepth / 2 - waveDisplacement, v, u);
            } else if (waveAxis === 'y') {
                positions.push(u, -blockDepth / 2 - waveDisplacement, v);
            } else if (waveAxis === '-y') {
                positions.push(u, -blockDepth / 2 + waveDisplacement, v);
            } else if (waveAxis === 'z') {
                positions.push(u, v, blockDepth / 2 + waveDisplacement);
            } else { // '-z'
                positions.push(u, v, -blockDepth / 2 - waveDisplacement);
            }
            uvs.push(iu / divU, iv / divV);
        }
    }

    // Inner face vertices (flat surface)
    const offset = positions.length / 3;
    for (let iv = 0; iv <= divV; iv++) {
        const v = (iv / divV) * blockHeight;
        for (let iu = 0; iu <= divU; iu++) {
            const u = (iu / divU - 0.5) * blockWidth;

            if (waveAxis === 'x' || waveAxis === '-x') {
                let bdepth = waveAxis == 'x' ? -blockDepth / 2 : blockDepth / 2;
                positions.push(bdepth, v, u);
            } else if (waveAxis === 'y' || waveAxis === '-y') {
                let bdepth = waveAxis == 'y' ? -blockDepth / 2 : blockDepth / 2;
                positions.push(u, bdepth, v);
            } else { // 'z' or '-z'
                let bdepth = waveAxis == 'z' ? -blockDepth / 2 : blockDepth / 2;
                positions.push(u, v, bdepth);
            }
            uvs.push(iu / divU, iv / divV);
        }
    }

    const ring = divU + 1;

    // Outer faces
    for (let iv = 0; iv < divV; iv++) {
        for (let iu = 0; iu < divU; iu++) {
            const a = iv * ring + iu;
            const b = a + 1;
            const c = a + ring;
            const d = c + 1;

            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    // Inner faces
    for (let iv = 0; iv < divV; iv++) {
        for (let iu = 0; iu < divU; iu++) {
            const a = offset + iv * ring + iu;
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
        const outerA = iv * ring;
        const outerB = (iv + 1) * ring;
        const innerA = outerA + offset;
        const innerB = outerB + offset;

        indices.push(outerA, outerB, innerA);
        indices.push(innerA, outerB, innerB);
    }

    for (let iv = 0; iv < divV; iv++) {
        const outerA = iv * ring + backCol;
        const outerB = (iv + 1) * ring + backCol;
        const innerA = outerA + offset;
        const innerB = outerB + offset;

        indices.push(outerA, innerA, outerB);
        indices.push(innerA, innerB, outerB);
    }

    for (let iu = 0; iu < divU; iu++) {
        const outerA = iu;
        const outerB = iu + 1;
        const innerA = outerA + offset;
        const innerB = outerB + offset;

        indices.push(outerA, innerA, outerB);
        indices.push(innerA, innerB, outerB);
    }

    const topRow = divV * ring;
    for (let iu = 0; iu < divU; iu++) {
        const outerA = topRow + iu;
        const outerB = topRow + iu + 1;
        const innerA = outerA + offset;
        const innerB = outerB + offset;

        indices.push(outerA, outerB, innerA);
        indices.push(innerA, outerB, innerB);
    }

    const mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

    const normalsArray: number[] = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
    mesh.setIndices(indices);

    mesh.material = material;
    mesh.position = position;

    return mesh;
};


export const getConcreteMaterial = (): BABYLON.StandardMaterial | null => {
    return concreteMaterial;
};
