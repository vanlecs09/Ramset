import * as BABYLON from '@babylonjs/core';
import { createConcrete, updateConcrete, ConcreteNode } from './ConcreteBuilder';
import { createPost } from './PostBuilder';
import { createTorqueVisualization } from './GeometryHelper';
import type { PostPosition } from './CircularPostPositionCalculator';

export interface BaseStructureGroup {
  group: BABYLON.TransformNode;
  dispose(): void;
}

export class CircularColumnsNode implements BaseStructureGroup {
  group: BABYLON.TransformNode;
  private concreteGroup?: ConcreteNode;
  private circularColumn?: BABYLON.Mesh;
  private posts?: BABYLON.Mesh[];
  private torqueMeshes?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    this.group = group;
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
  }
}

export const createCircularColumns = (
  scene: BABYLON.Scene,
  concreteThickness: number = 1.5,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  _infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  columnHeight: number = 1,
  columnRadius: number = 1.5,
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

/**
 * Add torque visualization on the right face of concrete
 * @param circularColumns - The circular columns group to add torque to
 * @param concreteWidth - Width of the concrete (for positioning)
 * @param concretePosition - Position of the concrete
 * @param torqueDirection - Direction of the torque (perpendicular to torus plane)
 */
export const addTorqueVisualizationToRightFace = (
  circularColumns: CircularColumnsNode,
  concreteWidth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  torqueDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0)
) => {
  const scene = circularColumns.group.getScene();

  // Torque material (distinctive color)
  const torqueMaterial = new BABYLON.StandardMaterial('torqueMaterial', scene);
  torqueMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0); // Orange-red
  torqueMaterial.disableLighting = true;

  // Position torque on the right face (max X) of the concrete
  // Right face center: at max X, middle Y, middle Z
  const torqueX = concretePosition.x + concreteWidth / 2 + 0.2;
  const torqueY = concretePosition.y + 0.75; // Middle of concrete height
  const torqueZ = concretePosition.z; // Center depth

  const torusPosition = new BABYLON.Vector3(torqueX, torqueY, torqueZ);

  // Create torque visualization
  const torque = createTorqueVisualization(
    'concreteTorque',
    scene,
    torusPosition,
    torqueDirection,
    0.3,           // torusRadius
    0.015,          // tubeRadius
    270,            // arcAngle in degrees
    0.2,            // lineOffset
    0.5,
    torqueMaterial
  );

  // Add meshes to the group
  torque.meshes.forEach(mesh => {
    mesh.parent = circularColumns.group;
    circularColumns.addTorqueMesh(mesh);
  });

  return torque;
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

  addTorqueVisualizationToRightFace(
    circularColumnsGroup,
    concreteWidth,
    concretePosition,
    new BABYLON.Vector3(1, 0, 0) // X-axis torque direction
  );

  // Calculate concrete top position
  const concreteTopY = 1.5;

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
