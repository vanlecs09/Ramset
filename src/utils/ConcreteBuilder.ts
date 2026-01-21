import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createDimensionWithLabel, DimensionLineNode, type DimensionLabelNode } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';

export class ConcreteNode extends BaseStructNodeImpl {
    private mesh?: BABYLON.Mesh;
    private material?: BABYLON.StandardMaterial;
    private infiniteBlocks?: BABYLON.Mesh[];
    private dimensionLines?: DimensionLineNode;

    constructor(group: BABYLON.TransformNode) {
        super(group);
    }

    getMesh(): BABYLON.Mesh | undefined {
        return this.mesh;
    }

    setMesh(mesh: BABYLON.Mesh | undefined): void {
        this.mesh = mesh;
    }

    getMaterial(): BABYLON.StandardMaterial | undefined {
        return this.material;
    }

    setMaterial(material: BABYLON.StandardMaterial | undefined): void {
        this.material = material;
    }

    getInfiniteBlocks(): BABYLON.Mesh[] | undefined {
        return this.infiniteBlocks;
    }

    setInfiniteBlocks(blocks: BABYLON.Mesh[] | undefined): void {
        this.infiniteBlocks = blocks;
    }

    getDimensionLines(): DimensionLineNode | undefined {
        return this.dimensionLines;
    }

    setDimensionLines(dimensionLines: DimensionLineNode | undefined): void {
        this.dimensionLines = dimensionLines;
    }

    dispose(): void {
        this.dimensionLines?.dispose?.();
        this.mesh?.dispose();
        this.infiniteBlocks?.forEach(block => block.dispose());
        // Call parent to dispose axis meshes
        super.dispose();
    }
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

export const getDimensionLabelTexture = () => {
    return initializeDimensionLabelTexture();
};

export const disposeDimensionLabelTexture = () => {
    if (dimensionLabelTexture) {
        dimensionLabelTexture.dispose();
        dimensionLabelTexture = null;
    }
};

const initializeSinBlockMaterial = (scene: BABYLON.Scene) => {
    if (!sinBlockMaterial) {
        sinBlockMaterial = new BABYLON.StandardMaterial('sinBlockMaterial', scene);
        sinBlockMaterial.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);   // tan/beige color
        sinBlockMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        sinBlockMaterial.alpha = 0.2;  // semi-transparent
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
): ConcreteNode => {
    // Create a transform node to group concrete elements
    const concreteTransformNode = new BABYLON.TransformNode('concreteGroup', scene);
    if (parent) {
        concreteTransformNode.parent = parent as BABYLON.Node;
    }

    const concreteGroup = new ConcreteNode(concreteTransformNode);
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
    let dimensionLines: DimensionLineNode | undefined;
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

        const offset = 0.4;
        const dimensionGroup = new BABYLON.TransformNode('dimensionGroup_concrete', scene);
        const labels: GUI.TextBlock[] = [];
        
        // Use global AdvancedDynamicTexture for dimension labels
        const advancedTexture = initializeDimensionLabelTexture();

        // Width dimension (X axis) - offset from Z min edge
        const widthLabel = createDimensionWithLabel(
            'width',
            scene,
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
        if (widthLabel) labels.push(widthLabel.label);

        // Depth dimension (Z axis) - offset from X max edge
        const depthLabel = createDimensionWithLabel(
            'depth',
            scene,
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
        if (depthLabel) labels.push(depthLabel.label);

        // Height dimension (Y axis) - offset from X min, Z min corner
        const heightLabel = createDimensionWithLabel(
            'height',
            scene,
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
        if (heightLabel) labels.push(heightLabel.label);

        const dimensionLineNode = new DimensionLineNode(
            dimensionGroup,
            concreteWidth,
            concreteDepth,
            concreteThickness
        );
        dimensionLineNode.setLabels(labels);
        // Add meshes from dimension group
        (dimensionGroup.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
            dimensionLineNode.addMesh(mesh);
        });
        dimensionLines = dimensionLineNode;

        if (parent) {
            dimensionGroup.parent = parent as BABYLON.Node;
        }
    }

    concreteGroup.setMesh(concrete);
    concreteGroup.setMaterial(material);
    concreteGroup.setInfiniteBlocks(sinBlocks);
    concreteGroup.setDimensionLines(dimensionLines);

    return concreteGroup;
};

export const updateConcrete = (
    concreteGroup: ConcreteNode,
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
    concreteGroup.dispose();

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
    let dimensionLines: DimensionLineNode | undefined;
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

        const offset = 0.1;
        const dimensionGroup = new BABYLON.TransformNode('dimensionGroup_concrete', scene);
        const labels: GUI.TextBlock[] = [];
        
        // Use global AdvancedDynamicTexture for dimension labels
        const advancedTexture = initializeDimensionLabelTexture();

        // Width dimension (X axis) - offset from Z min edge
        const widthLabel = createDimensionWithLabel(
            'width',
            scene,
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
        if (widthLabel) labels.push(widthLabel.label);

        // Depth dimension (Z axis) - offset from X max edge
        const depthLabel = createDimensionWithLabel(
            'depth',
            scene,
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
        if (depthLabel) labels.push(depthLabel.label);

        // Height dimension (Y axis) - offset from X min, Z min corner
        const heightLabel = createDimensionWithLabel(
            'height',
            scene,
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
        if (heightLabel) labels.push(heightLabel.label);

        const dimensionLineResult2 = new DimensionLineNode(
            dimensionGroup,
            concreteWidth,
            concreteDepth,
            concreteThickness
        );
        dimensionLineResult2.setLabels(labels);
        // Add meshes from dimension group
        (dimensionGroup.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
            dimensionLineResult2.addMesh(mesh);
        });
        dimensionLines = dimensionLineResult2;

        if (parent) {
            dimensionGroup.parent = parent as BABYLON.Node;
        }
    }

    concreteGroup.setMesh(concrete);
    concreteGroup.setMaterial(material);
    concreteGroup.setInfiniteBlocks(sinBlocks);
    concreteGroup.setDimensionLines(dimensionLines);
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
    const blockThickness = 0.2;
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
        // we need to add extra width to account for the depth on both sides
        const outerWidth = blockWidth + blockDepth * 2;
        for (let iv = 0; iv <= divV; iv++) {
            const v = (iv / divV) * blockHeight + (concretePosition.y - blockHeight / 2);
            for (let iu = 0; iu <= divU; iu++) {
                const u = (iu / divU - 0.5) * outerWidth;
                const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

                if (direction === 'z') {
                    // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
                    positions.push(u + concretePosition.x, v, blockDepth + waveDisplacement + (concretePosition.z + concreteDepth / 2));
                } else if (direction === '-z') {
                    // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
                    positions.push(u + concretePosition.x, v, -blockDepth - waveDisplacement + (concretePosition.z - concreteDepth / 2));
                } else if (direction === 'x') {
                    // interate y from 0 to blockheight, interate u from -width/2 to width/2
                    positions.push(blockDepth + waveDisplacement + (concretePosition.x + concreteWidth / 2), v, u + concretePosition.z);
                } else if (direction === '-x') {
                    // interate y from 0 to blockheight, interate u from -width/2 to width/2
                    positions.push(-blockDepth - waveDisplacement + (concretePosition.x - concreteWidth / 2), v, u + concretePosition.z);
                }
                uvs.push(iu / divU, iv / divV);
            }
        }

        // Inner face vertices (flat surface)
        const offset = divV + 1;
        for (let iv = 0; iv <= divV; iv++) {
            const v = (concretePosition.y - blockHeight * 0.5) + (iv / divV) * blockHeight;
            for (let iu = 0; iu <= divU; iu++) {
                const u = (iu / divU - 0.5)* blockWidth;

                if (direction === 'z') {
                     // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
                    positions.push(u + concretePosition.x, v, concreteDepth / 2 + concretePosition.z);
                } else if (direction === '-z') {
                     // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
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



export const getConcreteMaterial = (): BABYLON.StandardMaterial | null => {
    return concreteMaterial;
};
