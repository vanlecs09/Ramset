import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode, getDimensionLabelTexture } from './ConcreteNode';
import { createPost } from './PostNode';
import { createWaveBlock } from './WaveBuilder';
import { createAxesBasic, createDimensionWithLabel, DimensionLineNode } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';
import type { RectanglePostPosition } from './RectanglePostPositionCalculator';
import { createBendingMomenNode, BendingMomentNode } from './BendingMomenNode';
import { ArcDirection, TorsionMomentNode, createTorsionMoment as createTorsionMomentNode } from './TorsionMomentNode';

export class SlabNode extends BaseStructNodeImpl {
    private concreteGroup?: ConcreteNode;
    private waveBlocks?: BABYLON.Mesh[];
    private secondaryPosts?: BABYLON.Mesh[];
    private dimensionLines?: DimensionLineNode[];
    private bendingMomentNodes?: BendingMomentNode[];
    private torsionMomentNodes?: TorsionMomentNode[];

    constructor(group: BABYLON.TransformNode) {
        super(group);
        this.waveBlocks = [];
        this.dimensionLines = [];
        this.bendingMomentNodes = [];
        this.torsionMomentNodes = [];
    }

    // Expose methods for safe access
    getConcreteGroup(): ConcreteNode | undefined {
        return this.concreteGroup;
    }

    setConcreteGroup(concreteGroup: ConcreteNode): void {
        this.concreteGroup = concreteGroup;
    }

    getWaveBlocks(): BABYLON.Mesh[] {
        return this.waveBlocks || [];
    }

    setWaveBlocks(waveBlocks: BABYLON.Mesh[]): void {
        this.waveBlocks = waveBlocks;
    }

    addWaveBlock(waveBlock: BABYLON.Mesh): void {
        if (!this.waveBlocks) {
            this.waveBlocks = [];
        }
        this.waveBlocks.push(waveBlock);
    }

    clearWaveBlocks(): void {
        if (this.waveBlocks) {
            this.waveBlocks.forEach(block => block.dispose());
            this.waveBlocks = [];
        }
    }

    getSecondaryPosts(): BABYLON.Mesh[] {
        return this.secondaryPosts || [];
    }

    addSecondaryPost(post: BABYLON.Mesh): void {
        if (!this.secondaryPosts) {
            this.secondaryPosts = [];
        }
        this.secondaryPosts.push(post);
    }

    clearSecondaryPosts(): void {
        if (this.secondaryPosts) {
            this.secondaryPosts.forEach(post => post.dispose());
            this.secondaryPosts = [];
        }
    }

    getDimensionLines(): DimensionLineNode[] {
        return this.dimensionLines || [];
    }

    addDimensionLine(line: DimensionLineNode): void {
        if (!this.dimensionLines) {
            this.dimensionLines = [];
        }
        this.dimensionLines.push(line);
    }

    clearDimensionLines(): void {
        if (this.dimensionLines) {
            this.dimensionLines.forEach(line => {
                line.dispose();
            });
            this.dimensionLines = [];
        }
    }

    addBendingMomentNode(node: BendingMomentNode): void {
        if (!this.bendingMomentNodes) {
            this.bendingMomentNodes = [];
        }
        this.bendingMomentNodes.push(node);
    }

    getBendingMomentNodes(): BendingMomentNode[] {
        return this.bendingMomentNodes || [];
    }

    clearBendingMomentNodes(): void {
        if (this.bendingMomentNodes) {
            this.bendingMomentNodes.forEach(node => {
                // Dispose meshes from bending moment node
                node.meshes.forEach(mesh => {
                    if (mesh && !mesh.isDisposed()) {
                        mesh.dispose();
                    }
                });
                // Dispose group
                if (node.group && !node.group.isDisposed()) {
                    node.group.dispose();
                }
            });
            this.bendingMomentNodes = [];
        }
    }

    addTorsionMomentNode(node: TorsionMomentNode): void {
        if (!this.torsionMomentNodes) {
            this.torsionMomentNodes = [];
        }
        this.torsionMomentNodes.push(node);
    }

    getTorsionMomentNodes(): TorsionMomentNode[] {
        return this.torsionMomentNodes || [];
    }

    clearTorsionMomentNodes(): void {
        if (this.torsionMomentNodes) {
            this.torsionMomentNodes.forEach(node => {
                node.dispose();
            });
            this.torsionMomentNodes = [];
        }
    }

    dispose(): void {
        // Dispose moment nodes
        this.clearBendingMomentNodes();
        this.clearTorsionMomentNodes();
        
        // Dispose concrete group and its dimension lines
        if (this.concreteGroup) {
            this.concreteGroup.dispose();
        }
        this.clearWaveBlocks();
        this.clearDimensionLines();
        this.clearSecondaryPosts();
        if (this.posts) {
            this.posts.forEach(post => post.dispose());
        }
        // Call parent to dispose axis meshes
        super.dispose();
    }
}

// Global materials - shared across create and update functions
let slabMaterial: BABYLON.StandardMaterial | null = null;
let waveBlockMaterial: BABYLON.StandardMaterial | null = null;
let dimensionMaterial: BABYLON.StandardMaterial | null = null;
let secondaryPostMaterial: BABYLON.StandardMaterial | null = null;

const initializeMaterials = (scene: BABYLON.Scene) => {
    if (!slabMaterial) {
        var mat = new BABYLON.StandardMaterial('slabMaterial', scene);
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);   // medium gray
        mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        mat.alpha = 0.85;
        slabMaterial = mat;
    }
    if (!waveBlockMaterial) {
        var waveMat = new BABYLON.StandardMaterial('waveBlockMaterial', scene);
        waveMat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255); // tan/beige
        waveMat.specularColor = new BABYLON.Color3(1, 1, 1);
        waveMat.alpha = 0.7;
        waveMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        waveBlockMaterial = waveMat;
    }
    if (!dimensionMaterial) {
        var dimMat = new BABYLON.StandardMaterial('dimensionMaterial', scene);
        dimMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // red for visibility
        dimensionMaterial = dimMat;
    }
    if (!secondaryPostMaterial) {
        var blackMat = new BABYLON.StandardMaterial('secondaryPostMaterial', scene);
        blackMat.diffuseColor = new BABYLON.Color3(0, 0, 0);   // black
        blackMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        secondaryPostMaterial = blackMat;
    }
};

export const createSlab = (
    scene: BABYLON.Scene,
    postPositions: RectanglePostPosition[],
    concreteThickness: number = 1,
    slabWidth: number = 3,
    slabDepth: number = 2,
    postDiameter: number = 0.2,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    isFiniteConcrete: boolean = true
): SlabNode => {
    const slabGroup = new BABYLON.TransformNode('slab', scene);
    const slab = new SlabNode(slabGroup);

    // Initialize materials
    initializeMaterials(scene);

    // 1. Create concrete using ConcreteBuilder
    const concreteGroup = createConcrete(scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        slabGroup,
        isFiniteConcrete);
    slab.setConcreteGroup(concreteGroup);

    // 2. Create wave blocks extending from the right face of concrete
    const slabHeigth = 0.3;
    let slabPosition = new BABYLON.Vector3(concretePosition.x, concretePosition.y, concretePosition.z + (concreteDepth / 2 + slabHeigth / 2));
    addWaveBlocksFromRightFace(slab, slabWidth, slabDepth, concreteWidth, slabPosition);

    // 3. Create posts connecting concrete to wave blocks
    const postHeight = 0.3;

    postPositions.forEach((postPos) => {
        // Position post at concrete top surface with adjusted Y
        const postPositionY = 0;
        const adjustedPostPosition = new BABYLON.Vector3(
            postPos.position.x,
            postPositionY,
            postPos.position.z
        );

        const postGroup = createPost(
            scene,
            postHeight,
            postDiameter,
            adjustedPostPosition,
            new BABYLON.Vector3(Math.PI / 2, 0, 0),
            slabGroup,
            `slabPost_${postPos.index}`
        );
        slab.addPost(postGroup.mesh!);
    });

    // 4. Create secondary posts inside concrete (black color, high density)
    addSecondaryPostsInsideConcrete(
        slab,
        concretePosition,
        concreteWidth,
        concreteDepth,
        concreteThickness,
        postDiameter * 0.7  // Slightly smaller diameter
    );

    // 5. Create and cache axis meshes and labels for visualization
    const axesResult = createAxesBasic(
        scene,
        new BABYLON.Vector3(0, -concreteThickness / 2, concreteDepth / 2),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, -1, 0),
        new BABYLON.Vector3(0, 0, 1)
    );
    slab.setAxisMeshes(axesResult.meshes);
    slab.setLabels(axesResult.labels);

    return slab;
};

export const updateSlab = (
    slabGroup: SlabNode,
    postPositions: RectanglePostPosition[],
    concreteThickness: number = 0.5,
    slabWidth: number = 3,
    slabDepth: number = 2,
    postDiameter: number = 0.2,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    isFiniteConcrete: boolean = true
) => {
    const scene = slabGroup.group.getScene();

    // Initialize materials
    initializeMaterials(scene);
    slabGroup.dispose();

    // Update concrete using ConcreteBuilder
    let concreteGroup = slabGroup.getConcreteGroup();
    if (!concreteGroup) {
        concreteGroup = {} as ConcreteNode;
    }
    updateConcrete(concreteGroup,
        scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        slabGroup.group,
        isFiniteConcrete);
    slabGroup.setConcreteGroup(concreteGroup);

    // Update wave blocks
    let slabPosition = new BABYLON.Vector3(concretePosition.x, concretePosition.y, concretePosition.z + (concreteDepth / 2 + slabDepth / 2));
    addWaveBlocksFromRightFace(slabGroup, slabWidth, slabDepth, concreteThickness, slabPosition);

    // Update posts with pre-calculated positions
    const postHeight = 0.3;

    postPositions.forEach((postPos) => {
        // Position post at concrete top surface with adjusted Y
        const postPositionY = 0;
        const adjustedPostPosition = new BABYLON.Vector3(
            postPos.position.x,
            postPos.position.y + postPositionY - slabDepth / 2,
            postPos.position.z
        );

        const postGroup = createPost(
            scene,
            postHeight,
            postDiameter,
            adjustedPostPosition,
            // new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(Math.PI / 2, 0, 0), // local rotation
            slabGroup.group,
            `slabPost_${postPos.index}`
        );
        slabGroup.addPost(postGroup.mesh!);
    });

    // Update secondary posts inside concrete
    addSecondaryPostsInsideConcrete(
        slabGroup,
        concretePosition,
        concreteWidth,
        concreteDepth,
        concreteThickness,
        postDiameter * 0.7  // Slightly smaller diameter
    );

    // Update and cache axis meshes and labels
    const axesResult = createAxesBasic(
        scene,
        new BABYLON.Vector3(0, -concreteThickness / 2, concreteDepth / 2),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, -1, 0),
        new BABYLON.Vector3(0, 0, 1)
    );
    slabGroup.setAxisMeshes(axesResult.meshes);
    slabGroup.setLabels(axesResult.labels);

    const bendingMoment1 = createBendingMomenNode(
        scene,
        new BABYLON.Vector3(0, - concreteThickness / 2, concreteDepth / 2),
        1,
        new BABYLON.Vector3(1, 0, 0),
        BABYLON.Color3.Black(),
        '25kg'
    );
    slabGroup.addBendingMomentNode(bendingMoment1);

    const bendingMoment2 = createBendingMomenNode(
        scene,
        new BABYLON.Vector3(0, - concreteThickness / 2, concreteDepth / 2),
        1,
        new BABYLON.Vector3(0, 0, 1),
        BABYLON.Color3.Black(),
        '25kg'
    );
    slabGroup.addBendingMomentNode(bendingMoment2);

    const torsionMat = new BABYLON.StandardMaterial('torsionMat', scene);
    torsionMat.diffuseColor = BABYLON.Color3.Black();

    const torsion = createTorsionMomentNode(
        'torque1',
        scene,
        new BABYLON.Vector3(1, - concreteThickness / 2, concreteDepth / 2),
        new BABYLON.Vector3(1, 0, 0),    // Right vector
        new BABYLON.Vector3(0, 1, 0),    // Up vector
        undefined,                        // arcAngle (use default)
        ArcDirection.FORWARD,             // Forward pointing
        torsionMat,
        '200'                               // Label text
    );
    slabGroup.addTorsionMomentNode(torsion);
};

/**
 * Add wave blocks extending from the right face of concrete
 * @param slabGroup - The slab group to add blocks to
 * @param slabWidth - Width of the slab extending from right face
 * @param slabDepth - Depth of the slab (along Z-axis)
 * @param slabPosition - position of the slab
 * */
export const addWaveBlocksFromRightFace = (
    slabGroup: SlabNode,
    blockWidth: number = 3,
    blockDepth: number = 2,
    blockHeight: number = 0.5,
    slabPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0)
) => {
    const scene = slabGroup.group.getScene();

    // Initialize materials
    initializeMaterials(scene);

    // Clear existing wave blocks
    slabGroup.clearWaveBlocks();
    const blockPosition = slabPosition;

    // Create wave block extending from right face (wave on Z-axis, extending along X)
    const blockMesh = createWaveBlock(
        scene,
        `waveBlockRightFace_`,
        blockPosition,
        blockWidth,      // Width along X-axis (extending from right)
        blockHeight,    // Height along Y-axis
        blockDepth,      // Depth along Z-axis
        'z',            // Wave on Z-axis
        waveBlockMaterial!
    );

    blockMesh.receiveShadows = true;
    blockMesh.parent = slabGroup.group;

    slabGroup.addWaveBlock(blockMesh);

    // Clear existing dimension lines
    slabGroup.clearDimensionLines();

    // Add dimension lines for wave block
    const advancedTexture = getDimensionLabelTexture();

    // Create a dimension line node group to hold all dimension elements
    const dimensionGroup = new BABYLON.TransformNode('waveBlockDimensions', scene);
    dimensionGroup.parent = slabGroup.group;

    // Dimension line for block depth (X-axis)
    const depthLinePosition = new BABYLON.Vector3(
        blockPosition.x,
        blockPosition.y,
        blockPosition.z + blockDepth
    );
    const zOffset = 0.1;
    const depthArrow1Position = new BABYLON.Vector3(blockPosition.x - blockWidth / 2, depthLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2 + zOffset);
    const depthArrow2Position = new BABYLON.Vector3(blockPosition.x + blockWidth / 2, depthLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2 + zOffset);
    const depthCorner1 = new BABYLON.Vector3(blockPosition.x - blockWidth / 2, depthLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2);
    const depthCorner2 = new BABYLON.Vector3(blockPosition.x + blockWidth / 2, depthLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2);

    const depthDimLabel = createDimensionWithLabel(
        'waveBlockDepthDim',
        scene,
        depthArrow1Position,
        depthArrow2Position,
        depthCorner1,
        depthCorner2,
        dimensionMaterial!,
        blockWidth,
        dimensionGroup,
        advancedTexture,
        25,
        0
    );

    // Create DimensionLineNode to manage depth dimension
    const depthDimensionNode = new DimensionLineNode(dimensionGroup, blockWidth, blockDepth, blockHeight);
    if (depthDimLabel) {
        depthDimensionNode.addLabel(depthDimLabel.label);
    }
    // Add all child meshes from dimension group
    (dimensionGroup.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
        depthDimensionNode.addMesh(mesh);
    });
    slabGroup.addDimensionLine(depthDimensionNode);

    // Dimension line for block height (Y-axis)
    const heightLinePosition = new BABYLON.Vector3(
        blockPosition.x,
        blockPosition.y,
        blockPosition.z + blockDepth
    );
    const heightArrow1Position = new BABYLON.Vector3(heightLinePosition.x + blockWidth / 2 + 0.1, heightLinePosition.y - blockHeight / 2, blockPosition.z + blockDepth / 2 + zOffset);
    const heightArrow2Position = new BABYLON.Vector3(heightLinePosition.x + blockWidth / 2 + 0.1, heightLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2 + zOffset);
    const heightCorner1 = new BABYLON.Vector3(heightLinePosition.x + blockWidth / 2, heightLinePosition.y - blockHeight / 2, blockPosition.z + blockDepth / 2);
    const heightCorner2 = new BABYLON.Vector3(heightLinePosition.x + blockWidth / 2, heightLinePosition.y + blockHeight / 2, blockPosition.z + blockDepth / 2);

    const heightDimLabel = createDimensionWithLabel(
        'waveBlockHeightDim',
        scene,
        heightArrow1Position,
        heightArrow2Position,
        heightCorner1,
        heightCorner2,
        dimensionMaterial!,
        blockHeight,
        dimensionGroup,
        advancedTexture,
        -40,
        0
    );

    // Add height dimension label to the node
    if (heightDimLabel) {
        depthDimensionNode.addLabel(heightDimLabel.label);
    }

};

/**
 * Creates secondary posts inside concrete with black color and high density.
 * X density: 5 posts per 1 unit
 * Y density: 2 posts per 0.2 unit (= 10 posts per 1 unit)
 * Posts run along the Z-axis (depth direction)
 * 
 * @param slabGroup - The slab group to add posts to
 * @param concretePosition - Position of concrete base
 * @param concreteWidth - Width of concrete (X-axis)
 * @param concreteDepth - Depth of concrete (Z-axis)
 * @param concreteThickness - Height/thickness of concrete (Y-axis)
 * @param postDiameter - Diameter of secondary posts
 */
export const addSecondaryPostsInsideConcrete = (
    slabGroup: SlabNode,
    concretePosition: BABYLON.Vector3,
    concreteWidth: number,
    concreteDepth: number,
    concreteThickness: number,
    postDiameter: number = 0.14
) => {
    const scene = slabGroup.group.getScene();

    // Initialize materials
    initializeMaterials(scene);

    // Clear existing secondary posts
    slabGroup.clearSecondaryPosts();

    // Calculate spacing
    const xSpacing = 1 / 7;           // 5 posts per 1 unit = 0.2 unit spacing
    const ySpacing = 0.2 / 2;         // 2 posts per 0.2 unit = 0.1 unit spacing

    // Calculate start positions to center the posts within the concrete
    const concreteMinX = concretePosition.x - concreteWidth / 2;
    const concreteMaxX = concretePosition.x + concreteWidth / 2;
    const concreteMinY = concretePosition.y - concreteThickness / 2;
    const concreteMaxY = concretePosition.y + concreteThickness / 2;

    // Post depth extends through concrete (along Z-axis)
    const postDepth = concreteDepth;
    const postCenterZ = concretePosition.z;

    // Generate grid of secondary posts (X-Y grid, extending along Z)
    for (let x = concreteMinX + xSpacing / 2; x < concreteMaxX; x += xSpacing) {
        for (let y = concreteMinY + ySpacing / 2; y < concreteMaxY; y += ySpacing) {
            const postPosition = new BABYLON.Vector3(x, y, postCenterZ);

            // Create secondary post using createPost with rotation for Z-axis alignment
            const postGroup = createPost(
                scene,
                postDepth,
                postDiameter,
                postPosition,
                new BABYLON.Vector3(Math.PI / 2, 0, 0),  // Same direction as main posts
                slabGroup.group,
                `secondaryPost_${Math.floor((x - concreteMinX) / xSpacing)}_${Math.floor((y - concreteMinY) / ySpacing)}`
            );

            // Apply black material
            if (postGroup.mesh) {
                postGroup.mesh.material = secondaryPostMaterial!;
                slabGroup.addSecondaryPost(postGroup.mesh);
            }
        }
    }
};