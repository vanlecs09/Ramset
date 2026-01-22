import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode } from './ConcreteBuilder';
import { createPost } from './PostNode';
import { createWaveBlock } from './WaveBuilder';
import { BaseStructNodeImpl } from './BaseNode';
import type { RectanglePostPosition } from './RectanglePostPositionCalculator';

export class RectangleColumnNode extends BaseStructNodeImpl {
    private concreteGroup?: ConcreteNode;
    private column?: BABYLON.Mesh;
    private posts?: BABYLON.Mesh[];

    constructor(group: BABYLON.TransformNode) {
        super(group);
        this.posts = [];
    }

    // Expose methods for safe access
    getConcreteGroup(): ConcreteNode | undefined {
        return this.concreteGroup;
    }

    setConcreteGroup(concreteGroup: ConcreteNode): void {
        this.concreteGroup = concreteGroup;
    }

    getColumn(): BABYLON.Mesh | undefined {
        return this.column;
    }

    setColumn(column: BABYLON.Mesh): void {
        this.column = column;
    }

    getPosts(): BABYLON.Mesh[] {
        return this.posts || [];
    }

    addPost(post: BABYLON.Mesh): void {
        if (!this.posts) {
            this.posts = [];
        }
        this.posts.push(post);
    }

    clearPosts(): void {
        if (this.posts) {
            this.posts.forEach(post => post.dispose());
            this.posts = [];
        }
    }

    dispose(): void {
        // Dispose concrete group and its dimension lines
        if (this.concreteGroup) {
            this.concreteGroup.dispose();
        }
        this.column?.dispose();
        if (this.posts) {
            this.posts.forEach(post => post.dispose());
        }
        // Call parent to dispose axis meshes
        super.dispose();
    }
}

// Global materials - shared across create and update functions
let columnMaterial: BABYLON.StandardMaterial | null = null;
let waveBlockMaterial: BABYLON.StandardMaterial | null = null;

const initializeMaterials = (scene: BABYLON.Scene) => {
    if (!columnMaterial) {
        var mat = new BABYLON.StandardMaterial('columnMaterial', scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
        mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        // mat.alpha = 0.4;                                    // transparency (0 = invisible, 1 = opaque)
        // mat.backFaceCulling = false;
        mat.alpha = 0.85;
        columnMaterial = mat;
    }
    if (!waveBlockMaterial) {
        var waveMat = new BABYLON.StandardMaterial('waveBlockMaterial', scene);
        waveMat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255); // tan/beige
        waveMat.specularColor = new BABYLON.Color3(1, 1, 1);
        waveMat.alpha = 0.7;
        waveMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        waveBlockMaterial = waveMat;
    }
};

export const createRectangleColumn = (
    scene: BABYLON.Scene,
    postPositions: RectanglePostPosition[],
    concreteThickness: number = 1,
    columnWidth: number = 3,
    columnDepth: number = 2,
    postDiameter: number = 0.2,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    isFiniteConcrete: boolean = true
): RectangleColumnNode => {
    const columnGroup = new BABYLON.TransformNode('rectangleColumn', scene);
    const rectangleColumn = new RectangleColumnNode(columnGroup);

    // Initialize materials
    initializeMaterials(scene);

    // 1. Create concrete using ConcreteBuilder
    const concreteGroup = createConcrete(scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        columnGroup,
        isFiniteConcrete);
    rectangleColumn.setConcreteGroup(concreteGroup);

    // 2. Create rectangle column (box on top)
    const concreteTopY = 0;
    let columnHeight = 0.3;
    addWaveBlocksOnTop(rectangleColumn, columnWidth, columnDepth, columnHeight + 0.2,
        new BABYLON.Vector3(0, concreteTopY + columnHeight / 2, 0)
    );

    // 3. Create posts connecting concrete to column
    const postHeight = columnHeight * 2;

    postPositions.forEach((postPos) => {
        // Position post at concrete top surface with adjusted Y
        const postPositionY = concreteTopY;
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
            undefined,
            columnGroup,
            `rectangleColumnPost_${postPos.index}`
        );
        rectangleColumn.addPost(postGroup.mesh!);
    });

    return rectangleColumn;
};

export const updateRectangleColumn = (
    rectangleColumn: RectangleColumnNode,
    postPositions: RectanglePostPosition[],
    concreteThickness: number = 0.5,
    columnWidth: number = 3,
    columnDepth: number = 2,
    postDiameter: number = 0.2,
    concreteWidth: number = 3,
    concreteDepth: number = 3,
    concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
    isFiniteConcrete: boolean = true
) => {
    const scene = rectangleColumn.group.getScene();

    // Initialize materials
    initializeMaterials(scene);
    rectangleColumn.dispose();
    // Update concrete using ConcreteBuilder
    let concreteGroup = rectangleColumn.getConcreteGroup();
    if (!concreteGroup) {
        concreteGroup = {} as ConcreteNode;
    }
    updateConcrete(concreteGroup,
        scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        rectangleColumn.group,
        isFiniteConcrete);
    rectangleColumn.setConcreteGroup(concreteGroup);

    const concreteTopY = 0;
    let columnHeight = 0.3;

    // Update column
    addWaveBlocksOnTop(rectangleColumn, columnWidth, columnDepth, columnHeight + 0.2,
        new BABYLON.Vector3(0, concreteTopY + columnHeight / 2, 0)); // Assuming columnHeight = 1

    // Recreate posts with pre-calculated positions
    const postHeight = columnHeight * 2;

    postPositions.forEach((postPos) => {
        // Position post at concrete top surface with adjusted Y
        const postPositionY = concreteTopY;
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
            undefined,
            rectangleColumn.group,
            `rectangleColumnPost_${postPos.index}`
        );
        rectangleColumn.addPost(postGroup.mesh!);
    });
};

/**
 * Add wave blocks on top of the rectangle column extending upward along Y-axis
 * @param rectangleColumn - The rectangle column group to add blocks to
 * @param blockWidth - Width of the rectangle column
 * @param blockDepth - Depth of the rectangle column
 * @param columnHeight - Height of the rectangle column
 * @param blockHeight - Height of each wave block (default: 0.5)
 */
export const addWaveBlocksOnTop = (
    rectangleColumn: RectangleColumnNode,
    blockWidth: number = 3,
    blockDepth: number = 2,
    blockHeight: number = 0.5,
    columnPostition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0 )
) => {

    const scene = rectangleColumn.group.getScene();

    // Initialize materials
    initializeMaterials(scene);

    // Create stacked wave blocks on top of the column with wave on Y-axis
    const waveBlocks: BABYLON.Mesh[] = [];

    // Create wave block with wave on Y-axis (wave goes up and down along width)
    const blockMesh = createWaveBlock(
        scene,
        `waveBlockTop_`,
        columnPostition,
        blockWidth,
        blockHeight,
        blockDepth,
        'y',  // Wave on Y-axis
        waveBlockMaterial!
    );

    blockMesh.receiveShadows = true;
    blockMesh.parent = rectangleColumn.group;

    waveBlocks.push(blockMesh);

    // Add to concrete group's infinite blocks array if it doesn't exist
    let concreteGroup = rectangleColumn.getConcreteGroup();
    if (!concreteGroup) {
        concreteGroup = new ConcreteNode(rectangleColumn.group);
        rectangleColumn.setConcreteGroup(concreteGroup);
    }
    const infiniteBlocks = concreteGroup.getInfiniteBlocks();
    if (!infiniteBlocks || infiniteBlocks.length === 0) {
        concreteGroup.setInfiniteBlocks([]);
    }

    concreteGroup.getInfiniteBlocks()?.push(...waveBlocks);
};
