import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
import { createWaveBlock } from './WaveBuilder';
import type { BaseStructureGroup } from './CircularColumnsBuilder';
import type { RectanglePostPosition } from './RectanglePostPositionCalculator';

export interface RectangleColumnGroup extends BaseStructureGroup {
    group: BABYLON.TransformNode;
    concrete?: BABYLON.Mesh;
    infiniteBlocks?: BABYLON.Mesh[];
    column?: BABYLON.Mesh;
    posts?: BABYLON.Mesh[];
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
): RectangleColumnGroup => {
    const columnGroup = new BABYLON.TransformNode('rectangleColumn', scene);
    const rectangleColumn: RectangleColumnGroup = {
        group: columnGroup,
        posts: [],
        dispose: function (): void {
            // columnGroup.dispose();
            this.concrete?.dispose();
            this.infiniteBlocks?.forEach(block => block.dispose());
            this.column?.dispose();
            this.posts?.forEach(post => post.dispose());
            // throw new Error('Function not implemented.');
        }
    };

    // Initialize materials
    initializeMaterials(scene);

    // 1. Create concrete using ConcreteBuilder
    // Pass calculated dimensions to concrete builder
    const concreteGroup = createConcrete(scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        columnGroup,
        isFiniteConcrete);
    rectangleColumn.concrete = concreteGroup.mesh;
    rectangleColumn.infiniteBlocks = concreteGroup.infiniteBlocks || [];

    // 2. Create rectangle column (box on top)
    const concreteTopY = 1.5;
    let columnHeight = 1;
    const column = BABYLON.MeshBuilder.CreateBox(
        'rectangleColumn',
        { width: columnWidth, height: columnHeight, depth: columnDepth },
        scene
    );
    column.position.y = concreteTopY + columnHeight / 2; // Sit on top of concrete
    column.material = columnMaterial;

    // column.receiveShadows = true;
    column.parent = columnGroup;
    rectangleColumn.column = column;

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
            columnGroup,
            `rectangleColumnPost_${postPos.index}`
        );
        rectangleColumn.posts!.push(postGroup.mesh!);
    });

    return rectangleColumn;
};

export const updateRectangleColumn = (
    rectangleColumn: RectangleColumnGroup,
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

    // Update concrete using ConcreteBuilder
    // Pass calculated dimensions to concrete builder
    const concreteGroup = { mesh: rectangleColumn.concrete, infiniteBlocks: rectangleColumn.infiniteBlocks || [] };
    updateConcrete(concreteGroup,
        scene,
        concreteThickness,
        concreteWidth,
        concreteDepth,
        concretePosition,
        rectangleColumn.group,
        isFiniteConcrete);
    rectangleColumn.concrete = concreteGroup.mesh;
    rectangleColumn.infiniteBlocks = concreteGroup.infiniteBlocks;


    const concreteTopY = 1.5;
    let columnHeight = 1;
    if (rectangleColumn.column) {
        rectangleColumn.column.dispose();

        const column = BABYLON.MeshBuilder.CreateBox(
            'rectangleColumn',
            { width: columnWidth, height: columnHeight, depth: columnDepth },
            scene
        );
        column.position.y = concreteTopY + columnHeight / 2; // Sit on top of concrete
        column.material = columnMaterial;

        // column.receiveShadows = true;
        column.parent = rectangleColumn.group;
        rectangleColumn.column = column;
    }

    // Update column
    addWaveBlocksOnTop(rectangleColumn, columnWidth, columnDepth, 0.5, 1); // Assuming columnHeight = 1

    // Remove and recreate posts
    if (rectangleColumn.posts) {
        rectangleColumn.posts.forEach((post) => {
            post.dispose();
        });
        rectangleColumn.posts = [];
    }

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
            rectangleColumn.group,
            `rectangleColumnPost_${postPos.index}`
        );
        rectangleColumn.posts!.push(postGroup.mesh!);
    });
};

/**
 * Add wave blocks on top of the rectangle column extending upward along Y-axis
 * @param rectangleColumn - The rectangle column group to add blocks to
 * @param blockWidth - Width of the rectangle column
 * @param blockDepth - Depth of the rectangle column
 * @param columnHeight - Height of the rectangle column
 * @param blockHeight - Height of each wave block (default: 0.5)
 * @param blockCount - Number of blocks to create stacked upward (default: 3)
 */
export const addWaveBlocksOnTop = (
    rectangleColumn: RectangleColumnGroup,
    blockWidth: number = 3,
    blockDepth: number = 2,
    blockHeight: number = 0.5,
    columnHeight: number = 1,
) => {
    if (!rectangleColumn.column) {
        console.warn('Rectangle column not found, cannot add wave blocks');
        return;
    }

    const scene = rectangleColumn.group.getScene();
    const columnTopY = rectangleColumn.column.position.y + columnHeight / 2;

    // Initialize materials
    initializeMaterials(scene);

    // Create stacked wave blocks on top of the column with wave on Y-axis
    const waveBlocks: BABYLON.Mesh[] = [];

    // Position each block above the column
    const blockPosition = new BABYLON.Vector3(
        0,
        columnTopY + blockHeight / 2,
        0
    );

    // Create wave block with wave on Y-axis (wave goes up and down along width)
    const blockMesh = createWaveBlock(
        scene,
        `waveBlockTop_`,
        blockPosition,
        blockWidth,
        blockHeight,
        blockDepth,
        'y',  // Wave on Y-axis
        waveBlockMaterial!
    );

    blockMesh.receiveShadows = true;
    blockMesh.parent = rectangleColumn.group;

    waveBlocks.push(blockMesh);

    // Add to infinite blocks array if it doesn't exist
    if (!rectangleColumn.infiniteBlocks) {
        rectangleColumn.infiniteBlocks = [];
    }

    rectangleColumn.infiniteBlocks.push(...waveBlocks);
};
