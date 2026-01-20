import * as BABYLON from '@babylonjs/core';
import type { BaseStructureGroup } from './CircularColumnsBuilder';
import { createConcrete, updateConcrete } from './ConcreteBuilder';
import type { ConcreteNode } from './ConcreteBuilder';
import { calculateCuboidPostPositions } from './CuboidPostPositionCalculator';
import { createPost } from './PostBuilder';


export const createCross = (
  position: BABYLON.Vector3,
  scene: BABYLON.Scene,
  sizeX: number = 2,
  sizeZ: number = 2
) => {
  const crossGroup = new BABYLON.TransformNode('cross', scene);

  const crossMaterial = new BABYLON.StandardMaterial('crossMaterial', scene);
  crossMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.42); // #FFFF6B
  crossMaterial.alpha = 0.7;

  // Horizontal beam (along X axis)
  const horizontalBeam = BABYLON.MeshBuilder.CreateBox('horizontalBeam', { width: sizeX, height: 0.5, depth: 1 }, scene);
  horizontalBeam.material = crossMaterial;
  horizontalBeam.receiveShadows = true;
  horizontalBeam.parent = crossGroup;

  // Depth beam (along Z axis)
  const depthBeam = BABYLON.MeshBuilder.CreateBox('depthBeam', { width: 1, height: 0.5, depth: sizeZ }, scene);
  depthBeam.material = crossMaterial;
  depthBeam.receiveShadows = true;
  depthBeam.parent = crossGroup;

  crossGroup.position = position;
  return crossGroup;
};

export class ComplexColumnNode implements BaseStructureGroup {
  group: BABYLON.TransformNode;
  private concreteGroup?: ConcreteNode;
  private cuboid1?: BABYLON.Mesh;
  private cuboid2?: BABYLON.Mesh;
  private posts?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    this.group = group;
    this.posts = [];
  }

  getConcreteGroup(): ConcreteNode | undefined {
    return this.concreteGroup;
  }

  setConcreteGroup(concreteGroup: ConcreteNode): void {
    this.concreteGroup = concreteGroup;
  }

  getCuboid1(): BABYLON.Mesh | undefined {
    return this.cuboid1;
  }

  setCuboid1(cuboid: BABYLON.Mesh): void {
    this.cuboid1 = cuboid;
  }

  getCuboid2(): BABYLON.Mesh | undefined {
    return this.cuboid2;
  }

  setCuboid2(cuboid: BABYLON.Mesh): void {
    this.cuboid2 = cuboid;
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
    // Dispose concrete group and all its resources
    if (this.concreteGroup) {
      this.concreteGroup.dispose();
    }
    
    // Dispose cuboids
    this.cuboid1?.dispose();
    this.cuboid2?.dispose();
    
    // Dispose posts
    if (this.posts) {
      this.posts.forEach(post => post.dispose());
    }
  }
}

export const createComplexColumn = (
  scene: BABYLON.Scene,
  concreteThickness: number = 1,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  _infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  cuboid1SizeX: number = 2,
  cuboid1SizeZ: number = 2,
  cuboid1PostCountLeftEdge: number = 2,
  cuboid1PostCountTopEdge: number = 2,
  cuboid2SizeX: number = 2,
  cuboid2SizeZ: number = 2,
  cuboid2TranslateX: number = 0,
  cuboid2TranslateZ: number = 0,
  cuboid2PostCountLeftEdge: number = 2,
  cuboid2PostCountTopEdge: number = 2,
  postRadius: number = 0.05,
  postOffset: number = 0.1
): ComplexColumnNode => {
  const columnGroup = new BABYLON.TransformNode('complexColumn', scene);
  const complexColumn = new ComplexColumnNode(columnGroup);

  // 1. Create concrete base using ConcreteBuilder
  const concreteGroup = createConcrete(
    scene,
    concreteThickness,
    concreteWidth,
    concreteDepth,
    concretePosition,
    columnGroup,
    isFiniteConcrete
  );
  complexColumn.setConcreteGroup(concreteGroup);

  // 2. Create 2 cuboids that cross each other on top
  const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  cuboidMaterial.diffuseColor = new BABYLON.Color3(1, 0.42, 0.42); // #FF6B6B
  cuboidMaterial.alpha = 0.4;

  // Calculate cuboid position: concrete top (2) + gap (0.5) + height/2 (0.3) = 2.8
  const concreteTopY = 1.5;
  const cuboidGap = 0;
  const cuboidHeight = 0.6;
  const cuboidCenterY = concreteTopY + cuboidGap + cuboidHeight / 2;

  // First cuboid (along X axis)
  const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', { width: cuboid1SizeX, height: cuboidHeight, depth: cuboid1SizeZ }, scene);
  cuboid1.position = new BABYLON.Vector3(0, cuboidCenterY, 0);
  cuboid1.material = cuboidMaterial;
  cuboid1.receiveShadows = true;
  cuboid1.parent = columnGroup;
  complexColumn.setCuboid1(cuboid1);

  // Second cuboid (along Z axis)
  const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', { width: cuboid2SizeX, height: cuboidHeight, depth: cuboid2SizeZ }, scene);
  cuboid2.position = new BABYLON.Vector3(cuboid2TranslateX, cuboidCenterY, cuboid2TranslateZ);
  cuboid2.material = cuboidMaterial;
  cuboid2.receiveShadows = true;
  cuboid2.parent = columnGroup;
  complexColumn.setCuboid2(cuboid2);

  // 3. Create posts around the perimeter of cuboids
  const cuboid1Positions = calculateCuboidPostPositions(
    0, // centerX (cuboid1 is centered)
    0, // centerZ (cuboid1 is centered)
    cuboid1SizeX,
    cuboid1SizeZ,
    cuboid1PostCountLeftEdge,
    cuboid1PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2 // baseY (bottom of cuboid)
  );

  const cuboid2Positions = calculateCuboidPostPositions(
    cuboid2TranslateX,
    cuboid2TranslateZ,
    cuboid2SizeX,
    cuboid2SizeZ,
    cuboid2PostCountLeftEdge,
    cuboid2PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2 // baseY (bottom of cuboid)
  );

  const allPostPositions = [...cuboid1Positions, ...cuboid2Positions];
  const postHeight = cuboidHeight * 2;

  allPostPositions.forEach((postPos) => {
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
      postRadius * 2, // diameter
      adjustedPostPosition,
      columnGroup,
      `complexColumnPost_${postPos.index}`
    );
    complexColumn.addPost(postGroup.mesh!);
  });

  return complexColumn;
};

export const updateComplexColumn = (
  complexColumnGroup: ComplexColumnNode,
  concreteThickness: number = 1,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  _infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  cuboid1SizeX: number = 2,
  cuboid1SizeZ: number = 2,
  cuboid1PostCountLeftEdge: number = 2,
  cuboid1PostCountTopEdge: number = 2,
  cuboid2SizeX: number = 2,
  cuboid2SizeZ: number = 2,
  cuboid2TranslateX: number = 0,
  cuboid2TranslateZ: number = 0,
  cuboid2PostCountLeftEdge: number = 2,
  cuboid2PostCountTopEdge: number = 2,
  postRadius: number = 0.05,
  postOffset: number = 0.1
) => {
  const scene = complexColumnGroup.group.getScene();
  complexColumnGroup.dispose();
  // 1. Update concrete using ConcreteBuilder
  const concreteGroup = complexColumnGroup.getConcreteGroup();
  if (concreteGroup) {
    updateConcrete(
      concreteGroup,
      scene,
      concreteThickness,
      concreteWidth,
      concreteDepth,
      concretePosition,
      complexColumnGroup.group,
      isFiniteConcrete
    );
  }

  // 2. Create cuboid material
  const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  cuboidMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // #FF6B6B
  cuboidMaterial.alpha = 0.5;

  // Calculate cuboid position: concrete top (2) + gap (0.5) + height/2 (0.3) = 2.8
  const concreteTopY = 1.5;
  const cuboidGap = 0;
  const cuboidHeight = 0.6;
  const cuboidCenterY = concreteTopY + cuboidGap + cuboidHeight / 2;

  // Update cuboid 1
  const currentCuboid1 = complexColumnGroup.getCuboid1();
  if (currentCuboid1) {
    const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', 
      { width: cuboid1SizeX, height: cuboidHeight, depth: cuboid1SizeZ }, scene);
    cuboid1.position = new BABYLON.Vector3(0, cuboidCenterY, 0);
    cuboid1.material = cuboidMaterial;
    cuboid1.receiveShadows = true;
    cuboid1.parent = complexColumnGroup.group;
    complexColumnGroup.setCuboid1(cuboid1);
  }

  // Update cuboid 2
  const currentCuboid2 = complexColumnGroup.getCuboid2();
  if (currentCuboid2) {
    const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', 
      { width: cuboid2SizeX, height: cuboidHeight, depth: cuboid2SizeZ }, scene);
    cuboid2.position = new BABYLON.Vector3(cuboid2TranslateX, cuboidCenterY, cuboid2TranslateZ);
    cuboid2.material = cuboidMaterial;
    cuboid2.receiveShadows = true;
    cuboid2.parent = complexColumnGroup.group;
    complexColumnGroup.setCuboid2(cuboid2);
  }

  // Create new posts with updated parameters
  const cuboid1Positions = calculateCuboidPostPositions(
    0,
    0,
    cuboid1SizeX,
    cuboid1SizeZ,
    cuboid1PostCountLeftEdge,
    cuboid1PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2
  );

  const cuboid2Positions = calculateCuboidPostPositions(
    cuboid2TranslateX,
    cuboid2TranslateZ,
    cuboid2SizeX,
    cuboid2SizeZ,
    cuboid2PostCountLeftEdge,
    cuboid2PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2
  );

  const allPostPositions = [...cuboid1Positions, ...cuboid2Positions];
  const postHeight = cuboidHeight * 2;

  allPostPositions.forEach((postPos) => {
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
      postRadius * 2, // diameter
      adjustedPostPosition,
      complexColumnGroup.group,
      `complexColumnPost_${postPos.index}`
    );
    complexColumnGroup.addPost(postGroup.mesh!);
  });
};
