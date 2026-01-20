import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
import { createWaveBlock } from './WaveBuilder';
import type { BaseStructureGroup } from './CircularColumnsBuilder';
import type { RectanglePostPosition } from './RectanglePostPositionCalculator';

export class SlabNode implements BaseStructureGroup {
    group: BABYLON.TransformNode;
    private concreteGroup?: ConcreteNode;
    private waveBlocks?: BABYLON.Mesh[];
    private posts?: BABYLON.Mesh[];

    constructor(group: BABYLON.TransformNode) {
        this.group = group;
        this.posts = [];
        this.waveBlocks = [];
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
        this.clearWaveBlocks();
        if (this.posts) {
            this.posts.forEach(post => post.dispose());
        }
    }
}

// Global materials - shared across create and update functions
let slabMaterial: BABYLON.StandardMaterial | null = null;
let waveBlockMaterial: BABYLON.StandardMaterial | null = null;

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
        const postPositionY = 1.5;
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
    const slabHeigth = 0.3;
    let slabPosition = new BABYLON.Vector3(concretePosition.x, concretePosition.y, concretePosition.z + (concreteDepth / 2 + slabHeigth / 2));
    addWaveBlocksFromRightFace(slabGroup, slabDepth, slabWidth, slabHeigth, slabPosition);

    // Recreate posts with pre-calculated positions
    const postHeight = 0.3;

    postPositions.forEach((postPos) => {
        // Position post at concrete top surface with adjusted Y
        const postPositionY = 1.5;
        const adjustedPostPosition = new BABYLON.Vector3(
            postPos.position.x,
            postPos.position.y + postPositionY - slabWidth / 2,
            postPos.position.z
        );

        const postGroup = createPost(
            scene,
            postHeight,
            postDiameter,
            adjustedPostPosition,
            // new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(Math.PI / 2,0, 0), // local rotation
            slabGroup.group,
            `slabPost_${postPos.index}`
        );
        slabGroup.addPost(postGroup.mesh!);
    });
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

    // Add to concrete group's infinite blocks array if it doesn't exist
    // let concreteGroup = slabGroup.getConcreteGroup();
    // if (!concreteGroup) {
    //     concreteGroup = new ConcreteGroup(slabGroup.group);
    //     slabGroup.setConcreteGroup(concreteGroup);
    // }
    // const infiniteBlocks = concreteGroup.getInfiniteBlocks();
    // if (!infiniteBlocks || infiniteBlocks.length === 0) {
    //     concreteGroup.setInfiniteBlocks([]);
    // }

    // concreteGroup.getInfiniteBlocks()?.push(blockMesh);
};
