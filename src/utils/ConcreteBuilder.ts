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
        sinBlockMaterial.alpha = 0.2;  // semi-transparent
        sinBlockMaterial.backFaceCulling = false;
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
    parent?: BABYLON.TransformNode
): BABYLON.Mesh[] => {
    const sinBlockMat = initializeSinBlockMaterial(scene);
    const blockThickness = 0.5;

    const sinBlocks = [
        createWaveBlock(
            scene,
            'sinBlock_back',
            finiteBlockPositions[0],
            concreteWidth,
            concreteThickness,
            blockThickness,
            'z',
            sinBlockMat
        ),
        createWaveBlock(
            scene,
            'sinBlock_front',
            finiteBlockPositions[1],
            concreteWidth,
            concreteThickness,
            blockThickness,
            '-z',
            sinBlockMat
        ),
        createWaveBlock(
            scene,
            'sinBlock_left',
            finiteBlockPositions[2],
            concreteDepth,
            concreteThickness,
            blockThickness,
            '-x',
            sinBlockMat
        ),
        createWaveBlock(
            scene,
            'sinBlock_right',
            finiteBlockPositions[3],
            concreteDepth,
            concreteThickness,
            blockThickness,
            'x',
            sinBlockMat
        ),
    ];

    if (parent) {
        sinBlocks.forEach(block => block.parent = parent as BABYLON.Node);
    }

    return sinBlocks;
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

    const amp = 0.2;      // sine amplitude
    const freq = 5;        // wave frequency
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
