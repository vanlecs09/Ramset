import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
import type { PostPosition } from './CircularPostPositionCalculator';

export interface BaseStructureGroup {
  group: BABYLON.TransformNode;
  dispose(): void;
}

export interface CircularColumnsGroup extends BaseStructureGroup {
  concrete?: BABYLON.Mesh;
  infiniteBlocks?: BABYLON.Mesh[];
  circularColumn?: BABYLON.Mesh;
  posts?: BABYLON.Mesh[];
  dispose(): void;
}

export const createCircularColumns = (
  scene: BABYLON.Scene,
  concreteThickness: number = 1.5,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  columnHeight: number = 1,
  columnRadius: number = 1.5,
  postRadius: number = 0.05,
  postPositions: PostPosition[],
): CircularColumnsGroup => {
  const towerGroup = new BABYLON.TransformNode('CircularColumns', scene);
  const circularColumns: CircularColumnsGroup = {
    group: towerGroup,
    posts: [],
    infiniteBlocks: [],
    dispose() {
      this.concrete?.dispose();
      this.infiniteBlocks?.forEach(block => block.dispose());
      this.circularColumn?.dispose();
      this.posts?.forEach(post => post.dispose());
      // Don't dispose the group itself, let React/cleanup handle that
    }
  };

  // Create bottom concrete using ConcreteBuilder with offset parameters
  const concreteGroup = createConcrete(
    scene,
    concreteThickness,
    concreteWidth,
    concreteDepth,
    concretePosition,
    infiniteBlockPositions,
    towerGroup,
    isFiniteConcrete);

  circularColumns.concrete = concreteGroup.mesh;
  circularColumns.infiniteBlocks = concreteGroup.infiniteBlocks || [];

  // Calculate concrete top position
  const concreteTopY = 1.5;

  // Create top cylinder on top of concrete
  const gapDistance = 0;
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    'towerCylinder',
    { height: columnHeight, diameter: columnRadius * 2 },
    scene
  );
  cylinder.position.y = concreteTopY + gapDistance + columnHeight / 2;

  const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
  cylinderMaterial.diffuseColor = new BABYLON.Color3(0.91, 0.30, 0.24); // #E74C3C
  cylinderMaterial.alpha = 0.1;
  cylinder.material = cylinderMaterial;

  cylinder.receiveShadows = true;
  cylinder.parent = towerGroup;
  circularColumns.circularColumn = cylinder;

  // // Create connecting posts using pre-calculated positions
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
      postRadius * 2,
      adjustedPostPosition,
      towerGroup,
      `towerPost_${postPos.index}`
    );
    circularColumns.posts!.push(postGroup.mesh!);
  });

  return circularColumns;
};

export const updateCircularColumns = (
  circularColumns: CircularColumnsGroup,
  concreteThickness: number = 1.5,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  columnHeight: number = 1,
  columnRadius: number = 1.5,
  postRadius: number = 0.05,
  postPositions: PostPosition[],
) => {
  // const gapDistance = 0.0;
  const scene = circularColumns.group.getScene();

  // Update concrete using ConcreteBuilder with offset parameters
  const concreteGroup = { mesh: circularColumns.concrete, infiniteBlocks: circularColumns.infiniteBlocks || [] };
  updateConcrete(concreteGroup,
    scene,
    concreteThickness,
    concreteWidth,
    concreteDepth,
    concretePosition,
    infiniteBlockPositions,
    circularColumns.group,
    isFiniteConcrete);
  circularColumns.concrete = concreteGroup.mesh;
  circularColumns.infiniteBlocks = concreteGroup.infiniteBlocks;

  // Calculate concrete top position
  const concreteTopY = 1.5;

  if (circularColumns.circularColumn) {
    circularColumns.circularColumn.dispose();

    const gapDistance = 0;
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      'towerCylinder',
      { height: columnHeight, diameter: columnRadius * 2 },
      scene
    );
    cylinder.position.y = concreteTopY + gapDistance + columnHeight / 2;

    const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
    cylinderMaterial.diffuseColor = new BABYLON.Color3(0.91, 0.30, 0.24); // #E74C3C
    cylinderMaterial.alpha = 0.4;
    cylinder.material = cylinderMaterial;

    // cylinder.receiveShadows = true;
    cylinder.parent = circularColumns.group;
    circularColumns.circularColumn = cylinder;
  }

  // Remove and recreate posts
  if (circularColumns.posts) {
    circularColumns.posts.forEach((post) => {
      post.dispose();
    });
    circularColumns.posts = [];
  }

  // Create new posts with pre-calculated positions
  // const concreteTopY = 1.5;
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
      postRadius * 2,
      adjustedPostPosition,
      circularColumns.group,
      `towerPost_${postPos.index}`
    );
    circularColumns.posts!.push(postGroup.mesh!);
  });
};
