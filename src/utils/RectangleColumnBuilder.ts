import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
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

const initializeMaterials = (scene: BABYLON.Scene) => {
    if (!columnMaterial) {
        var mat = new BABYLON.StandardMaterial('columnMaterial', scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
        mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        mat.alpha = 0.4;                                    // transparency (0 = invisible, 1 = opaque)
        mat.backFaceCulling = false;
        mat.alpha = 0.85;
        columnMaterial = mat;
    }
};

export const createRectangleColumn = (
    scene: BABYLON.Scene,
    postPositions: RectanglePostPosition[],
    concreteThickness: number = 1,
    columnWidth: number = 3,
    columnDepth: number = 2,
    postDiameter: number = 0.2,
    offsetXPos: number = 1.5,
    offsetXNeg: number = 1.5,
    offsetZPos: number = 1.5,
    offsetZNeg: number = 1.5,
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
    // Pass offset parameters directly to concrete builder
    const concreteGroup = createConcrete(scene, concreteThickness, offsetXPos, offsetXNeg, offsetZPos, offsetZNeg, columnGroup, isFiniteConcrete);
    rectangleColumn.concrete = concreteGroup.mesh;
    rectangleColumn.infiniteBlocks = concreteGroup.infiniteBlocks || [];

    // 2. Create rectangle column (box on top)
    let columnHeight = 1;
    const column = BABYLON.MeshBuilder.CreateBox(
        'rectangleColumn',
        { width: columnWidth, height: columnHeight, depth: columnDepth },
        scene
    );
    column.position.y = concreteThickness + columnHeight / 2; // Sit on top of concrete
    column.material = columnMaterial;

    column.receiveShadows = true;
    column.parent = columnGroup;
    rectangleColumn.column = column;

    // 3. Create posts connecting concrete to column
    postPositions.forEach((postPos) => {
        const postGroup = createPost(
            scene,
            concreteThickness + columnHeight / 2,
            postDiameter,
            postPos.position,
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
    offsetXPos: number = 1.5,
    offsetXNeg: number = 1.5,
    offsetZPos: number = 1.5,
    offsetZNeg: number = 1.5,
    isFiniteConcrete: boolean = true
) => {
    const scene = rectangleColumn.group.getScene();

    // Initialize materials
    initializeMaterials(scene);

    // Update concrete using ConcreteBuilder
    // Pass offset parameters directly to concrete builder
    const concreteGroup = { mesh: rectangleColumn.concrete, infiniteBlocks: rectangleColumn.infiniteBlocks || [] };
    updateConcrete(concreteGroup, scene, concreteThickness, offsetXPos, offsetXNeg, offsetZPos, offsetZNeg, rectangleColumn.group, isFiniteConcrete);
    rectangleColumn.concrete = concreteGroup.mesh;
    rectangleColumn.infiniteBlocks = concreteGroup.infiniteBlocks;

    // Update column
     let columnHeight = 1;
    if (rectangleColumn.column) {
        rectangleColumn.column.dispose();

        const column = BABYLON.MeshBuilder.CreateBox(
            'rectangleColumn',
            { width: columnWidth, height: columnHeight, depth: columnDepth },
            scene
        );
        column.position.y = concreteThickness + columnHeight / 2; // Sit on top of concrete
        column.material = columnMaterial;

        column.receiveShadows = true;
        column.parent = rectangleColumn.group;
        rectangleColumn.column = column;
    }

    // Remove and recreate posts
    if (rectangleColumn.posts) {
        rectangleColumn.posts.forEach((post) => {
            post.dispose();
        });
        rectangleColumn.posts = [];
    }

    // Recreate posts with pre-calculated positions
    postPositions.forEach((postPos) => {
        postPos.position.y = concreteThickness + 0.1; // columnHeight;
        const postGroup = createPost(
            scene,
            // concreteThickness + columnHeight / 2,
            columnHeight * 2,
            postDiameter,
            postPos.position,
            rectangleColumn.group,
            `rectangleColumnPost_${postPos.index}`
        );
        rectangleColumn.posts!.push(postGroup.mesh!);
    });
};
