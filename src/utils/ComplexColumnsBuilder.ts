import * as BABYLON from '@babylonjs/core';
import type { BaseStructureGroup } from './CircularColumnsBuilder';
import { createConcrete, updateConcrete } from './ConcreteBuilder';
import type { ConcreteGroup } from './ConcreteBuilder';
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

export interface ComplexColumnGroup extends BaseStructureGroup {
  concrete?: ConcreteGroup;
  cuboid1?: BABYLON.Mesh;
  cuboid2?: BABYLON.Mesh;
  posts?: BABYLON.Mesh[];
}

export const createComplexColumn = (
  scene: BABYLON.Scene,
  concreteThickness: number = 1,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  infiniteBlockPositions: BABYLON.Vector3[] = [],
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
): ComplexColumnGroup => {
  const columnGroup = new BABYLON.TransformNode('complexColumn', scene);
  const complexColumn: ComplexColumnGroup = {
    group: columnGroup,
    posts: [],
    dispose() {
      this.concrete?.mesh?.dispose();
      this.concrete?.material?.dispose();
      this.concrete?.infiniteBlocks?.forEach(block => block.dispose());
      this.cuboid1?.dispose();
      this.cuboid2?.dispose();
      this.posts?.forEach(post => post.dispose());
      // Don't dispose the group itself, let React/cleanup handle that
    }
  };

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
  complexColumn.concrete = concreteGroup;

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
  complexColumn.cuboid1 = cuboid1;

  // Second cuboid (along Z axis)
  const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', { width: cuboid2SizeX, height: cuboidHeight, depth: cuboid2SizeZ }, scene);
  cuboid2.position = new BABYLON.Vector3(cuboid2TranslateX, cuboidCenterY, cuboid2TranslateZ);
  cuboid2.material = cuboidMaterial;
  cuboid2.receiveShadows = true;
  cuboid2.parent = columnGroup;
  complexColumn.cuboid2 = cuboid2;

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
    complexColumn.posts!.push(postGroup.mesh!);
  });

  return complexColumn;
};

export const updateComplexColumn = (
  complexColumn: ComplexColumnGroup,
  concreteThickness: number = 1,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  infiniteBlockPositions: BABYLON.Vector3[] = [],
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
  const scene = complexColumn.group.getScene();

  // 1. Update concrete using ConcreteBuilder
  if (complexColumn.concrete) {
    updateConcrete(
      complexColumn.concrete,
      scene,
      concreteThickness,
      concreteWidth,
      concreteDepth,
      concretePosition,
      complexColumn.group,
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
  if (complexColumn.cuboid1) {
    complexColumn.cuboid1.dispose();

    const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', 
      { width: cuboid1SizeX, height: cuboidHeight, depth: cuboid1SizeZ }, scene);
    cuboid1.position = new BABYLON.Vector3(0, cuboidCenterY, 0);
    cuboid1.material = cuboidMaterial;
    cuboid1.receiveShadows = true;
    cuboid1.parent = complexColumn.group;
    complexColumn.cuboid1 = cuboid1;
  }

  // Update cuboid 2
  if (complexColumn.cuboid2) {
    complexColumn.cuboid2.dispose();

    const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', 
      { width: cuboid2SizeX, height: cuboidHeight, depth: cuboid2SizeZ }, scene);
    cuboid2.position = new BABYLON.Vector3(cuboid2TranslateX, cuboidCenterY, cuboid2TranslateZ);
    cuboid2.material = cuboidMaterial;
    cuboid2.receiveShadows = true;
    cuboid2.parent = complexColumn.group;
    complexColumn.cuboid2 = cuboid2;
  }

  // Remove and recreate posts
  if (complexColumn.posts) {
    complexColumn.posts.forEach((post) => {
      post.dispose();
    });
    complexColumn.posts = [];
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
      complexColumn.group,
      `complexColumnPost_${postPos.index}`
    );
    complexColumn.posts!.push(postGroup.mesh!);
  });
};
