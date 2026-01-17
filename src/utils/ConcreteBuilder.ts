import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createDimensionWithLabel, type DimensionLineResult, type DimensionLabel } from './GeometryHelper';

export interface ConcreteGroup {
    mesh?: BABYLON.Mesh;
    material?: BABYLON.StandardMaterial;
    infiniteBlocks?: BABYLON.Mesh[];
    dimensionLines?: DimensionLineResult;
}

// Global concrete material - shared across all concrete instances
let concreteMaterial: BABYLON.StandardMaterial | null = null;
let sinBlockMaterial: BABYLON.StandardMaterial | null = null;
let dimensionLabelTexture: GUI.AdvancedDynamicTexture | null = null;

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

export const initializeDimensionLabelTexture = () => {
    if (!dimensionLabelTexture) {
        dimensionLabelTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('DimensionLabelUI');
    }
    return dimensionLabelTexture;
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
    parent?: BABYLON.TransformNode,
    isFiniteConcrete: boolean = true,
    showDimensions: boolean = true
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
            concreteWidth,
            concreteDepth,
            concreteThickness,
            concretePosition,
            parent
        )
        : [];

    // Create dimension lines if requested
    let dimensionLines: DimensionLineResult | undefined;
    if (showDimensions) {
        const dimensionMat = new BABYLON.StandardMaterial('dimensionMat_concrete', scene);
        dimensionMat.emissiveColor = new BABYLON.Color3(0, 0, 0); // black
        dimensionMat.disableLighting = true;

        const boundingInfo = concrete.getBoundingInfo();
        const min = boundingInfo.minimum;
        const max = boundingInfo.maximum;

        // Apply concrete position to transform bounding box from local to world space
        const minX = min.x + concretePosition.x;
        const maxX = max.x + concretePosition.x;
        const minY = min.y + concretePosition.y;
        const maxY = max.y + concretePosition.y;
        const minZ = min.z + concretePosition.z;
        const maxZ = max.z + concretePosition.z;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        const offset = 0.4;
        const dimensionGroup = new BABYLON.TransformNode('dimensionGroup_concrete', scene);
        const labels: DimensionLabel[] = [];
        
        // Use global AdvancedDynamicTexture for dimension labels
        const advancedTexture = initializeDimensionLabelTexture();

        // Width dimension (X axis) - offset from Z min edge
        const widthLabel = createDimensionWithLabel(
            'width',
            scene,
            concreteWidth,
            new BABYLON.Vector3(centerX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(0, 0, Math.PI / 2),
            new BABYLON.Vector3(minX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(maxX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(minX, maxY, minZ),
            new BABYLON.Vector3(maxX, maxY, minZ),
            dimensionMat,
            concreteWidth,
            dimensionGroup,
            advancedTexture,
            0,
            30
        );
        if (widthLabel) labels.push(widthLabel);

        // Depth dimension (Z axis) - offset from X max edge
        const depthLabel = createDimensionWithLabel(
            'depth',
            scene,
            concreteDepth,
            new BABYLON.Vector3(minX - offset, maxY + offset, centerZ),
            new BABYLON.Vector3(Math.PI / 2, 0, 0),
            new BABYLON.Vector3(minX - offset, maxY + offset, minZ),
            new BABYLON.Vector3(minX - offset, maxY + offset, maxZ),
            new BABYLON.Vector3(minX, maxY, minZ),
            new BABYLON.Vector3(minX, maxY, maxZ),
            dimensionMat,
            concreteDepth,
            dimensionGroup,
            advancedTexture,
            -30,
            0
        );
        if (depthLabel) labels.push(depthLabel);

        // Height dimension (Y axis) - offset from X min, Z min corner
        const heightLabel = createDimensionWithLabel(
            'height',
            scene,
            concreteThickness,
            new BABYLON.Vector3(minX - offset, centerY, minZ - offset),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(minX - offset, minY, minZ - offset),
            new BABYLON.Vector3(minX - offset, maxY, minZ - offset),
            new BABYLON.Vector3(minX, minY, minZ),
            new BABYLON.Vector3(minX, maxY, minZ),
            dimensionMat,
            concreteThickness,
            dimensionGroup,
            advancedTexture,
            -30,
            0
        );
        if (heightLabel) labels.push(heightLabel);

        dimensionLines = {
            group: dimensionGroup,
            meshes: dimensionGroup.getChildren() as BABYLON.Mesh[],
            labels: labels,
            width: concreteWidth,
            depth: concreteDepth,
            height: concreteThickness
        };

        if (parent) {
            dimensionGroup.parent = parent as BABYLON.Node;
        }
    }


    return {
        mesh: concrete,
        material: material,
        infiniteBlocks: sinBlocks,
        dimensionLines: dimensionLines
    };
};

export const updateConcrete = (
    concreteGroup: ConcreteGroup,
    scene: BABYLON.Scene,
    concreteThickness: number = 1,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    parent?: BABYLON.TransformNode,
    isFiniteConcrete: boolean = true,
    showDimensions: boolean = true
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

    // Dispose old dimension lines
    if (concreteGroup.dimensionLines) {
        concreteGroup.dimensionLines.meshes.forEach(mesh => mesh.dispose());
        // Dispose old labels from AdvancedDynamicTexture
        const advancedTexture = initializeDimensionLabelTexture();
        concreteGroup.dimensionLines.labels.forEach(labelData => {
            advancedTexture.removeControl(labelData.label);
            labelData.label.dispose();
        });
        concreteGroup.dimensionLines.group.dispose();
        concreteGroup.dimensionLines = undefined;
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
            concreteWidth,
            concreteDepth,
            concreteThickness,
            concretePosition,
            parent
        )
        : [];

    // Create dimension lines if requested
    let dimensionLines: DimensionLineResult | undefined;
    if (showDimensions) {
        const dimensionMat = new BABYLON.StandardMaterial('dimensionMat_concrete', scene);
        dimensionMat.emissiveColor = new BABYLON.Color3(0, 0, 0); // black
        dimensionMat.disableLighting = true;

        const boundingInfo = concrete.getBoundingInfo();
        const min = boundingInfo.minimum;
        const max = boundingInfo.maximum;

        // Apply concrete position to transform bounding box from local to world space
        const minX = min.x + concretePosition.x;
        const maxX = max.x + concretePosition.x;
        const minY = min.y + concretePosition.y;
        const maxY = max.y + concretePosition.y;
        const minZ = min.z + concretePosition.z;
        const maxZ = max.z + concretePosition.z;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        const offset = 0.4;
        const dimensionGroup = new BABYLON.TransformNode('dimensionGroup_concrete', scene);
        const labels: DimensionLabel[] = [];
        
        // Use global AdvancedDynamicTexture for dimension labels
        const advancedTexture = initializeDimensionLabelTexture();

        // Width dimension (X axis) - offset from Z min edge
        const widthLabel = createDimensionWithLabel(
            'width',
            scene,
            concreteWidth,
            new BABYLON.Vector3(centerX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(0, 0, Math.PI / 2),
            new BABYLON.Vector3(minX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(maxX, maxY + offset, minZ - offset),
            new BABYLON.Vector3(minX, maxY, minZ),
            new BABYLON.Vector3(maxX, maxY, minZ),
            dimensionMat,
            concreteWidth,
            dimensionGroup,
            advancedTexture,
            0,
            30
        );
        if (widthLabel) labels.push(widthLabel);

        // Depth dimension (Z axis) - offset from X max edge
        const depthLabel = createDimensionWithLabel(
            'depth',
            scene,
            concreteDepth,
            new BABYLON.Vector3(minX - offset, maxY + offset, centerZ),
            new BABYLON.Vector3(Math.PI / 2, 0, 0),
            new BABYLON.Vector3(minX - offset, maxY + offset, minZ),
            new BABYLON.Vector3(minX - offset, maxY + offset, maxZ),
            new BABYLON.Vector3(minX, maxY, minZ),
            new BABYLON.Vector3(minX, maxY, maxZ),
            dimensionMat,
            concreteDepth,
            dimensionGroup,
            advancedTexture,
            -30,
            0
        );
        if (depthLabel) labels.push(depthLabel);

        // Height dimension (Y axis) - offset from X min, Z min corner
        const heightLabel = createDimensionWithLabel(
            'height',
            scene,
            concreteThickness,
            new BABYLON.Vector3(minX - offset, centerY, minZ - offset),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(minX - offset, minY, minZ - offset),
            new BABYLON.Vector3(minX - offset, maxY, minZ - offset),
            new BABYLON.Vector3(minX, minY, minZ),
            new BABYLON.Vector3(minX, maxY, minZ),
            dimensionMat,
            concreteThickness,
            dimensionGroup,
            advancedTexture,
            -30,
            0
        );
        if (heightLabel) labels.push(heightLabel);

        dimensionLines = {
            group: dimensionGroup,
            meshes: dimensionGroup.getChildren() as BABYLON.Mesh[],
            labels: labels,
            width: concreteWidth,
            depth: concreteDepth,
            height: concreteThickness
        };

        if (parent) {
            dimensionGroup.parent = parent as BABYLON.Node;
        }
    }

    concreteGroup.mesh = concrete;
    concreteGroup.material = material;
    concreteGroup.infiniteBlocks = sinBlocks;
    concreteGroup.dimensionLines = dimensionLines;
};

const createInfiniteBlocks = (
    scene: BABYLON.Scene,
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
