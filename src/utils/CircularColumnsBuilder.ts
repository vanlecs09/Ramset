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
  postPositions: PostPosition[],
  concreteThickness: number = 1.5,
  columnHeight: number = 1,
  columnRadius: number = 1.5,
  postRadius: number = 0.05,
  offsetXPos: number = 1.5,
  offsetXNeg: number = 1.5,
  offsetZPos: number = 1.5,
  offsetZNeg: number = 1.5,
  isFiniteConcrete: boolean = true
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
  const concreteGroup = createConcrete(scene, concreteThickness, offsetXPos, offsetXNeg, offsetZPos, offsetZNeg, towerGroup, isFiniteConcrete);
  circularColumns.concrete = concreteGroup.mesh;
  circularColumns.infiniteBlocks = concreteGroup.infiniteBlocks || [];

  // Create top cylinder
  const gapDistance = 0.5;
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    'towerCylinder',
    { height: columnHeight, diameter: columnRadius * 2 },
    scene
  );
  cylinder.position.y = concreteThickness + gapDistance + columnHeight / 2;

  const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
  cylinderMaterial.diffuseColor = new BABYLON.Color3(0.91, 0.30, 0.24); // #E74C3C
  cylinderMaterial.alpha = 0.6;
  cylinder.material = cylinderMaterial;

  cylinder.receiveShadows = true;
  cylinder.parent = towerGroup;
  circularColumns.circularColumn = cylinder;

  // Create connecting posts using pre-calculated positions
  const connectingPostHeight = concreteThickness + gapDistance + 1.5;

  postPositions.forEach((postPos) => {
    const postGroup = createPost(
      scene,
      connectingPostHeight,
      postRadius * 2,
      postPos.position,
      towerGroup,
      `towerPost_${postPos.index}`
    );
    circularColumns.posts!.push(postGroup.mesh!);
  });

  return circularColumns;
};

export const updateCircularColumns = (
  circularColumns: CircularColumnsGroup,
  postPositions: PostPosition[],
  concreteThickness: number = 1.5,
  columnHeight: number = 1,
  columnRadius: number = 1.5,
  postRadius: number = 0.05,
  offsetXPos: number = 1.5,
  offsetXNeg: number = 1.5,
  offsetZPos: number = 1.5,
  offsetZNeg: number = 1.5,
  isFiniteConcrete: boolean = true
) => {
  const gapDistance = 0.5;
  const scene = circularColumns.group.getScene();

  // Update concrete using ConcreteBuilder with offset parameters
  const concreteGroup = { mesh: circularColumns.concrete, infiniteBlocks: circularColumns.infiniteBlocks || [] };
  updateConcrete(concreteGroup, scene, concreteThickness, offsetXPos, offsetXNeg, offsetZPos, offsetZNeg, circularColumns.group, isFiniteConcrete);
  circularColumns.concrete = concreteGroup.mesh;
  circularColumns.infiniteBlocks = concreteGroup.infiniteBlocks;
  if (circularColumns.circularColumn) {
    circularColumns.circularColumn.dispose();

    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      'towerCylinder',
      { height: columnHeight, diameter: columnRadius * 2 },
      scene
    );
    cylinder.position.y = concreteThickness + gapDistance + columnHeight / 2;

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
  const connectingPostHeight = concreteThickness + gapDistance + 1.5;

  postPositions.forEach((postPos) => {
    const postGroup = createPost(
      scene,
      connectingPostHeight,
      postRadius * 2,
      postPos.position,
      circularColumns.group,
      `towerPost_${postPos.index}`
    );
    circularColumns.posts!.push(postGroup.mesh!);
  });;
};
