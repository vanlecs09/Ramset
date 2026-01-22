import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
import { BaseStructNodeImpl } from './BaseNode';
import type { PostPosition } from './CircularPostPositionCalculator';

export interface BaseStructureGroup {
  group: BABYLON.TransformNode;
  getAxisMeshes(): BABYLON.Mesh[];
  setAxisMeshes(meshes: BABYLON.Mesh[]): void;
  clearAxisMeshes(): void;
  dispose(): void;
}

export class CircularColumnsNode extends BaseStructNodeImpl {
  private concreteGroup?: ConcreteNode;
  private circularColumn?: BABYLON.Mesh;
  private posts?: BABYLON.Mesh[];
  private torqueMeshes?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    super(group);
    this.posts = [];
    this.torqueMeshes = [];
  }

  getConcreteGroup(): ConcreteNode | undefined {
    return this.concreteGroup;
  }

  setConcreteGroup(concreteGroup: ConcreteNode): void {
    this.concreteGroup = concreteGroup;
  }

  getCircularColumn(): BABYLON.Mesh | undefined {
    return this.circularColumn;
  }

  setCircularColumn(column: BABYLON.Mesh): void {
    this.circularColumn = column;
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

  getTorqueMeshes(): BABYLON.Mesh[] {
    return this.torqueMeshes || [];
  }

  addTorqueMesh(mesh: BABYLON.Mesh): void {
    if (!this.torqueMeshes) {
      this.torqueMeshes = [];
    }
    this.torqueMeshes.push(mesh);
  }

  dispose(): void {
    // Dispose concrete group and all its resources
    if (this.concreteGroup) {
      this.concreteGroup.dispose();
    }
    
    // Dispose circular column
    this.circularColumn?.dispose();
    
    // Dispose posts
    if (this.posts) {
      this.posts.forEach(post => post.dispose());
    }
    
    // Dispose torque meshes
    if (this.torqueMeshes) {
      this.torqueMeshes.forEach(mesh => mesh.dispose());
    }
    
    // Call parent to dispose axis meshes
    super.dispose();
  }
}

export const createCircularColumns = (
  scene: BABYLON.Scene,
  concreteThickness: number = 0,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  _infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  columnHeight: number = 1,
  columnRadius: number = 0,
  postRadius: number = 0.05,
  postPositions: PostPosition[],
): CircularColumnsNode => {
  const towerGroup = new BABYLON.TransformNode('CircularColumns', scene);
  const circularColumns = new CircularColumnsNode(towerGroup);

  // Create bottom concrete using ConcreteBuilder with offset parameters
  const concreteGroup = createConcrete(
    scene,
    concreteThickness,
    concreteWidth,
    concreteDepth,
    concretePosition,
    towerGroup,
    isFiniteConcrete);

  circularColumns.setConcreteGroup(concreteGroup);

  // Calculate concrete top position
  const concreteTopY = 0;

  // Create top cylinder on top of concrete
  const gapDistance = 0;
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    'towerCylinder',
    { height: columnHeight, diameter: columnRadius * 2 },
    scene
  );
  cylinder.position.y = concreteTopY + gapDistance + columnHeight / 2;

  const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
  cylinderMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
  cylinderMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  cylinderMaterial.alpha = 0.4;
  cylinder.material = cylinderMaterial;

  cylinder.receiveShadows = true;
  cylinder.parent = towerGroup;
  circularColumns.setCircularColumn(cylinder);

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
      undefined,
      towerGroup,
      `towerPost_${postPos.index}`
    );
    circularColumns.addPost(postGroup.mesh!);
  });

  return circularColumns;
};

export const updateCircularColumns = (
  circularColumnsGroup: CircularColumnsNode,
  concreteThickness: number = 1.5,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  isFiniteConcrete: boolean = true,
  columnHeight: number = 1,
  columnRadius: number = 1.5, 
  postRadius: number = 0.05,
  postPositions: PostPosition[],
) => {
  // const gapDistance = 0.0;
  const scene = circularColumnsGroup.group.getScene();
  circularColumnsGroup.dispose();

  // Update concrete using ConcreteBuilder with offset parameters
  const concreteGroup = circularColumnsGroup.getConcreteGroup();
  if (concreteGroup) {
    updateConcrete(
      concreteGroup,
      scene,
      concreteThickness,
      concreteWidth,
      concreteDepth,
      concretePosition,
      circularColumnsGroup.group,
      isFiniteConcrete);
  }

  // Calculate concrete top position
  const concreteTopY = 0;

  const currentColumn = circularColumnsGroup.getCircularColumn();
  if (currentColumn) {
    const gapDistance = 0;
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      'towerCylinder',
      { height: columnHeight, diameter: columnRadius * 2 },
      scene
    );
    cylinder.position.y = concreteTopY + gapDistance + columnHeight / 2;

    const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
    cylinderMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
    cylinderMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    cylinderMaterial.alpha = 0.6;
    // cylinderMaterial.backFaceCulling = true;
    cylinder.material = cylinderMaterial;

    // cylinder.receiveShadows = true;
    cylinder.parent = circularColumnsGroup.group;
    circularColumnsGroup.setCircularColumn(cylinder);
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
      undefined,
      circularColumnsGroup.group,
      `towerPost_${postPos.index}`
    );
    circularColumnsGroup.addPost(postGroup.mesh!);
  });
};
