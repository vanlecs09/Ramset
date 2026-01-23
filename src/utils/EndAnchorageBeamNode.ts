import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode, getDimensionLabelTexture } from './ConcreteNode';
import { createPost } from './PostNode';
import { createWaveBlock } from './WaveBuilder';
import { createAxesBasic, createDimensionWithLabel, DimensionLineNode } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';
import { BendingMomentNode } from './BendingMomenNode';
import { TorsionMomentNode } from './TorsionMomentNode';

export interface EndAnchorageParams {
    concreteThickness: number;
    beamWidth: number;
    beamDepth: number;
    beamHeight: number;
    beamOffsetX: number;
    pinDiameter: number;
    pinRows: number;
    pinColumns: number;
    pinSpacingX: number;
    pinSpacingY: number;
    concreteOffsetXRight: number;
    concreteOffsetXLeft: number;
    concreteOffsetZBack: number;
    concreteOffsetZFront: number;
}



export class EndAnchorageBeamNode extends BaseStructNodeImpl {
    private concreteGroup?: ConcreteNode;
    private waveBlocks?: BABYLON.Mesh[];
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
        // Call parent to dispose axis meshes and posts
        super.dispose();
    }
}

// Global materials - shared across create and update functions
let beamMaterial: BABYLON.StandardMaterial | null = null;
let waveBlockMaterial: BABYLON.StandardMaterial | null = null;
let dimensionMaterial: BABYLON.StandardMaterial | null = null;

const initializeMaterials = (scene: BABYLON.Scene) => {
    if (!beamMaterial) {
        var mat = new BABYLON.StandardMaterial('beamMaterial', scene);
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);   // medium gray
        mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        mat.alpha = 0.85;
        beamMaterial = mat;
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
        dimMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // black for visibility
        dimensionMaterial = dimMat;
    }
};

export const createEndAnchorage = (
    scene: BABYLON.Scene,
    postPositions: BABYLON.Vector3[],
    params: EndAnchorageParams,
    concreteWidth: number,
    concreteDepth: number,
    concretePosition: BABYLON.Vector3
): EndAnchorageBeamNode => {
    const anchorageGroup = new BABYLON.TransformNode('endAnchorage', scene);
    const anchorage = new EndAnchorageBeamNode(anchorageGroup);

    // Initialize materials
    initializeMaterials(scene);

    // 1. Create concrete
    const concreteGroup = createConcrete(scene,
        params.concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        anchorageGroup,
        true);
    anchorage.setConcreteGroup(concreteGroup);

    // 2. Create wave blocks (beam) extending from concrete
    const beamHeight = params.beamHeight;
    let beamPosition = new BABYLON.Vector3(
        concretePosition.x ,
        concretePosition.y + (beamHeight / 2),
        concretePosition.z,
    );
    createWaveBlockTop(
        anchorage,
        params.beamWidth,
        params.beamDepth,
        beamHeight,
        beamPosition
    );

    // 3. Create posts connecting concrete to beam
    const postHeight = 0.3;
    for (const postPosition of postPositions) {
        const postGroup = createPost(
            scene,
            postHeight,
            params.pinDiameter,
            postPosition,
            new BABYLON.Vector3(Math.PI / 2, 0, 0),
            anchorageGroup,
            `anchoragePin_${Math.random()}`
        );
        anchorage.addPost(postGroup.mesh!);
    }

    // 4. Create and cache axis meshes and labels for visualization
    const axesResult = createAxesBasic(
        scene,
        new BABYLON.Vector3(0, -0.5, concreteDepth / 2),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 0, 1)
    );
    anchorage.setAxisMeshes(axesResult.meshes);
    anchorage.setLabels(axesResult.labels);

    return anchorage;
};

export const updateEndAnchorage = (
    anchorageGroup: EndAnchorageBeamNode,
    postPositions: BABYLON.Vector3[],
    params: EndAnchorageParams,
    concreteWidth: number,
    concreteDepth: number,
    concretePosition: BABYLON.Vector3
) => {
    const scene = anchorageGroup.group.getScene();
    anchorageGroup.dispose();

    // Initialize materials
    initializeMaterials(scene);

    // Update concrete
    let concreteGroup = anchorageGroup.getConcreteGroup();
    if (!concreteGroup) {
        concreteGroup = {} as ConcreteNode;
    }
    updateConcrete(concreteGroup,
        scene,
        params.concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        anchorageGroup.group,
        true);
    anchorageGroup.setConcreteGroup(concreteGroup);

    // Update wave blocks (beam)
    const beamHeight = params.beamHeight;
    let beamPosition = new BABYLON.Vector3(
        concretePosition.x,
        concretePosition.y + (beamHeight / 2) + concreteGroup.getConcreteHeight() / 2,
        concretePosition.z,
    );
    createWaveBlockTop(
        anchorageGroup,
        params.beamWidth,
        params.beamDepth,
        params.beamHeight,
        beamPosition
    );

    // Update posts
    const postHeight = 0.3;
    for (const postPosition of postPositions) {
        const postGroup = createPost(
            scene,
            postHeight,
            params.pinDiameter,
            postPosition,
            new BABYLON.Vector3(0, 0, 0),
            // new BABYLON.Vector3(Math.PI / 2, 0, 0),
            anchorageGroup.group,
            `anchoragePin_${Math.random()}`
        );
        anchorageGroup.addPost(postGroup.mesh!);
    }

    // Update and cache axis meshes and labels
    const axesResult = createAxesBasic(
        scene,
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, 1, 0)
    );
    anchorageGroup.setAxisMeshes(axesResult.meshes);
    anchorageGroup.setLabels(axesResult.labels);
};

/**
 * Add wave blocks (beam) extending from the concrete
 */
export const createWaveBlockTop = (
    anchorageGroup: EndAnchorageBeamNode,
    blockWidth: number = 0.3,
    blockDepth: number = 0.5,
    blockHeight: number = 0.4,
    beamPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0)
) => {
    const scene = anchorageGroup.group.getScene();

    // Initialize materials
    initializeMaterials(scene);

    // Clear existing wave blocks
    anchorageGroup.clearWaveBlocks();
    const blockPosition = beamPosition;

    // Create beam (wave block)
    const blockMesh = createWaveBlock(
        scene,
        `beamBlock_`,
        blockPosition,
        blockWidth,      // Width along X-axis
        blockHeight,     // Height along Y-axis
        blockDepth,      // Depth along Z-axis
        'y',             // Wave on Z-axis
        waveBlockMaterial!
    );

    blockMesh.receiveShadows = true;
    blockMesh.parent = anchorageGroup.group;
    anchorageGroup.addWaveBlock(blockMesh);

    // Add dimension lines for beam
    const advancedTexture = getDimensionLabelTexture();

    // Create a dimension line node group to hold all dimension elements
    const dimensionGroup = new BABYLON.TransformNode('beamDimensions', scene);
    dimensionGroup.parent = anchorageGroup.group;

    // Dimension line for beam depth (X-axis)
    const zOffset = 0.1;
    // Create positions in local space relative to block center
    let depthArrow1Position = new BABYLON.Vector3(-blockWidth / 2, blockHeight / 2 + zOffset, -blockDepth / 2);
    let depthArrow2Position = new BABYLON.Vector3(blockWidth / 2, blockHeight / 2 + zOffset, -blockDepth / 2);
    let depthCorner1 = new BABYLON.Vector3(-blockWidth / 2, blockHeight / 2, -blockDepth / 2);
    let depthCorner2 = new BABYLON.Vector3(blockWidth / 2, blockHeight / 2, -blockDepth / 2);

    // Offset to block position in world space
    depthArrow1Position = depthArrow1Position.add(blockPosition);
    depthArrow2Position = depthArrow2Position.add(blockPosition);
    depthCorner1 = depthCorner1.add(blockPosition);
    depthCorner2 = depthCorner2.add(blockPosition);


    const depthDimLabel = createDimensionWithLabel(
        'beamDepthDim',
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
    // if (depthDimLabel) {
    depthDimensionNode.addLabel(depthDimLabel!.label);
    // }
    // Add all child meshes from dimension group
    (dimensionGroup.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
        depthDimensionNode.addMesh(mesh);
    });
    anchorageGroup.addDimensionLine(depthDimensionNode);

    // Create positions in local space relative to block center
    let heightArrow1Position = new BABYLON.Vector3(blockWidth / 2 + zOffset, blockHeight / 2, -blockDepth / 2);
    let heightArrow2Position = new BABYLON.Vector3(blockWidth / 2 + zOffset, blockHeight / 2, blockDepth / 2);
    let heightCorner1 = new BABYLON.Vector3(blockWidth / 2, blockHeight / 2, -blockDepth / 2);
    let heightCorner2 = new BABYLON.Vector3(blockWidth / 2, blockHeight / 2, blockDepth / 2);

    // Offset to block position in world space
    heightArrow1Position = heightArrow1Position.add(blockPosition);
    heightArrow2Position = heightArrow2Position.add(blockPosition);
    heightCorner1 = heightCorner1.add(blockPosition);
    heightCorner2 = heightCorner2.add(blockPosition);

    const heightDimLabel = createDimensionWithLabel(
        'beamHeightDim',
        scene,
        heightArrow1Position,
        heightArrow2Position,
        heightCorner1,
        heightCorner2,
        dimensionMaterial!,
        blockDepth,
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

export type EndAnchorageNode = EndAnchorageBeamNode;
