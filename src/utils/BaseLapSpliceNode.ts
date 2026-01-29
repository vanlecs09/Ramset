import * as BABYLON from '@babylonjs/core';
import { createConcrete, ConcreteNode, type ConcreteParams } from './ConcreteNode';
import { createPost } from './PostNode';
import { createUnitAxes } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';
import type { RectanglePostPosition } from './RectanglePostPositionCalculator';
import { createMomens, createWaveBlockTop } from './BaseEndAnchorageNode';

export class BaseLapSpliceNode extends BaseStructNodeImpl {
  private concreteNode?: ConcreteNode;
  private secondaryPosts?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    super(group);
  }

  // Expose methods for safe access
  getConcreteGroup(): ConcreteNode | undefined {
    return this.concreteNode;
  }

  setConcreteGroup(concreteGroup: ConcreteNode): void {
    this.concreteNode = concreteGroup;
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

  dispose(): void {
    // Dispose concrete group
    if (this.concreteNode) {
      this.concreteNode.dispose();
    }
    // Dispose secondary posts
    this.clearSecondaryPosts();
    // Call parent to dispose moment nodes, wave blocks, dimension lines, posts, and axis meshes
    super.dispose();
  }
}

// Global materials - shared across create and update functions
let slabMaterial: BABYLON.StandardMaterial | null = null;
let waveBlockMaterial: BABYLON.StandardMaterial | null = null;
let dimensionMaterial: BABYLON.StandardMaterial | null = null;
let secondaryPostMaterial: BABYLON.StandardMaterial | null = null;

const initializeMaterials = (scene: BABYLON.Scene) => {
  // Check if existing materials belong to a different/disposed scene
  if (slabMaterial && slabMaterial.getScene() !== scene) {
    slabMaterial = null;
  }
  if (waveBlockMaterial && waveBlockMaterial.getScene() !== scene) {
    waveBlockMaterial = null;
  }
  if (dimensionMaterial && dimensionMaterial.getScene() !== scene) {
    dimensionMaterial = null;
  }
  if (secondaryPostMaterial && secondaryPostMaterial.getScene() !== scene) {
    secondaryPostMaterial = null;
  }

  if (!slabMaterial) {
    const mat = new BABYLON.StandardMaterial('slabMaterial', scene);
    mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7); // medium gray
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    mat.alpha = 0.85;
    slabMaterial = mat;
  }
  if (!waveBlockMaterial) {
    const waveMat = new BABYLON.StandardMaterial('waveBlockMaterial', scene);
    waveMat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255); // tan/beige
    waveMat.specularColor = new BABYLON.Color3(1, 1, 1);
    waveMat.alpha = 0.7;
    waveMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    waveBlockMaterial = waveMat;
  }
  if (!dimensionMaterial) {
    const dimMat = new BABYLON.StandardMaterial('dimensionMaterial', scene);
    dimMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // red for visibility
    dimensionMaterial = dimMat;
  }
  if (!secondaryPostMaterial) {
    const blackMat = new BABYLON.StandardMaterial(
      'secondaryPostMaterial',
      scene,
    );
    blackMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // black
    blackMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    secondaryPostMaterial = blackMat;
  }
};

export const createLapsplice = (
  scene: BABYLON.Scene,
  postPositions: RectanglePostPosition[],
  concreteParam: ConcreteParams,
  slabParam: {
    slabWidth: number;
    slabDepth: number;
    postDiameter: number;
    isFiniteConcrete: boolean;
  },
): BaseLapSpliceNode => {
  const slabGroup = new BABYLON.TransformNode('slab', scene);
  const mainNode = new BaseLapSpliceNode(slabGroup);

  // Initialize materials
  initializeMaterials(scene);

  // 1. Create concrete using ConcreteBuilder
  const concreteNode = createConcrete(
    scene,
    concreteParam,
    slabGroup,
    slabParam.isFiniteConcrete,
  );
  mainNode.setConcreteGroup(concreteNode);

  // 2. Create wave blocks extending from the right face of concrete
  const slabHeigth = 0.3;
  const slabPosition = new BABYLON.Vector3(
    concreteParam.position.x,
    concreteParam.position.y +
    slabHeigth / 2 +
    concreteNode.getConcreteHeight() / 2,
    concreteParam.position.z,
  );


  createWaveBlockTop(
    mainNode as unknown as BaseStructNodeImpl,
    slabParam.slabWidth,
    slabParam.slabDepth,
    slabHeigth,
    slabPosition,
  );
  // 3. Create posts connecting concrete to wave blocks
  const postHeight = 0.3;

  postPositions.forEach(postPos => {
    // Position post at concrete top surface with adjusted Y
    const postPositionY = 0;
    const adjustedPostPosition = new BABYLON.Vector3(
      postPos.position.x,
      postPositionY,
      postPos.position.z,
    );

    const postGroup = createPost(
      scene,
      postHeight,
      slabParam.postDiameter,
      adjustedPostPosition,
      new BABYLON.Vector3(0, 0, 0),
      slabGroup,
      `slabPost_${postPos.index}`,
    );
    mainNode.addPost(postGroup.mesh!);
  });
  const concretePosition = concreteParam.position;
  // 5. Create and cache axis meshes and labels for visualization
  const axesResult = createUnitAxes(
    scene,
    mainNode.group,
    new BABYLON.Vector3(concretePosition.x, 0, concretePosition.z),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
  );
  mainNode.setAxisMeshes(axesResult.meshes);
  mainNode.setLabels(axesResult.labels);

  createMomens(scene, concreteParam.position, concreteParam, mainNode);

  // 4. Create secondary posts inside concrete (black color, high density)
  addSecondaryPostsInsideConcrete(
    mainNode,
    concreteParam.position,
    concreteParam.width,
    concreteParam.depth,
    concreteParam.thickness,
    slabParam.postDiameter * 0.7, // Slightly smaller diameter
  );

  return mainNode;
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
  slabGroup: BaseLapSpliceNode,
  concretePosition: BABYLON.Vector3,
  concreteWidth: number,
  concreteDepth: number,
  concreteThickness: number,
  postDiameter: number = 0.14,
) => {
  const scene = slabGroup.group.getScene();

  // Initialize materials
  initializeMaterials(scene);

  // Clear existing secondary posts
  slabGroup.clearSecondaryPosts();

  // Calculate spacing
  const xSpacing = 1 / 7; // 5 posts per 1 unit = 0.2 unit spacing
  const ySpacing = 0.2 / 2; // 2 posts per 0.2 unit = 0.1 unit spacing

  // Calculate start positions to center the posts within the concrete
  const concreteMinX = concretePosition.x - concreteWidth / 2;
  const concreteMaxX = concretePosition.x + concreteWidth / 2;
  const concreteMinZ = concretePosition.z - concreteDepth / 2;
  const concreteMaxZ = concretePosition.z + concreteDepth / 2;

  // Post depth extends through concrete (along Z-axis)
  const postDepth = concreteThickness - 0.2;
  const postCentery = concretePosition.y;

  // Generate grid of secondary posts (X-Y grid, extending along Z)
  for (let x = concreteMinX + xSpacing / 2; x < concreteMaxX; x += xSpacing) {
    for (let z = concreteMinZ + ySpacing / 2; z < concreteMaxZ; z += ySpacing) {
      const postPosition = new BABYLON.Vector3(x, postCentery, z);

      // Create secondary post using createPost with rotation for Z-axis alignment
      const postGroup = createPost(
        scene,
        postDepth,
        postDiameter,
        postPosition,
        new BABYLON.Vector3(0, 0, 0), // Same direction as main posts
        slabGroup.group,
        `secondaryPost_${Math.floor((x - concreteMinX) / xSpacing)}_${Math.floor((z - concreteMinZ) / ySpacing)}`,
      );

      // Apply black material
      if (postGroup.mesh) {
        postGroup.mesh.material = secondaryPostMaterial!;
        slabGroup.addSecondaryPost(postGroup.mesh);
      }
    }
  }
};
