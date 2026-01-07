import * as BABYLON from '@babylonjs/core';
import type { BaseStructureGroup } from './CircularColumnsBuilder';

export const createPost = (position: BABYLON.Vector3, scene: BABYLON.Scene, radius: number = 0.05) => {
  const post = BABYLON.MeshBuilder.CreateCylinder(
    'post',
    { height: 2, diameter: radius * 2 },
    scene
  );
  post.position = position;

  const postMaterial = new BABYLON.StandardMaterial('postMaterial', scene);
  postMaterial.emissiveColor = new BABYLON.Color3(0.627, 0.322, 0.176); // #A0522D
  post.material = postMaterial;

  post.receiveShadows = true;
  return post;
};

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
  box?: BABYLON.Mesh;
  cuboid1?: BABYLON.Mesh;
  cuboid2?: BABYLON.Mesh;
  posts?: BABYLON.Mesh[];
}

export const createComplexColumn = (
  scene: BABYLON.Scene,
  boxSize: number = 3,
  cuboid1SizeX: number = 2,
  cuboid1SizeZ: number = 2,
  cuboid2SizeX: number = 2,
  cuboid2SizeZ: number = 2,
  postRadius: number = 0.05,
  postOffset: number = 0.1
): ComplexColumnGroup => {
  const columnGroup = new BABYLON.TransformNode('complexColumn', scene);
  const complexColumn: ComplexColumnGroup = {
    group: columnGroup,
    posts: [],
    dispose() {
      this.box?.dispose();
      this.cuboid1?.dispose();
      this.cuboid2?.dispose();
      this.posts?.forEach(post => post.dispose());
      // Don't dispose the group itself, let React/cleanup handle that
    }
  };

  // 1. Create bottom box (basic floor)
  const box = BABYLON.MeshBuilder.CreateBox('complexColumnBox', { size: boxSize }, scene);
  box.position.y = 1.5;

  const boxMaterial = new BABYLON.StandardMaterial('complexBoxMaterial', scene);
  boxMaterial.emissiveColor = new BABYLON.Color3(0.42, 1, 0.42); // #6BFF6B
  boxMaterial.alpha = 0.3;
  box.material = boxMaterial;

  box.receiveShadows = true;
  box.parent = columnGroup;
  complexColumn.box = box;

  // 2. Create 2 cuboids that cross each other on top
  const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  cuboidMaterial.emissiveColor = new BABYLON.Color3(1, 0.42, 0.42); // #FF6B6B
  cuboidMaterial.alpha = 0.4;

  // First cuboid (along X axis)
  const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', { width: cuboid1SizeX, height: 0.6, depth: cuboid1SizeZ }, scene);
  cuboid1.position = new BABYLON.Vector3(0, 3.5, 0);
  cuboid1.material = cuboidMaterial;
  cuboid1.receiveShadows = true;
  cuboid1.parent = columnGroup;
  complexColumn.cuboid1 = cuboid1;

  // Second cuboid (along Z axis)
  const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', { width: cuboid2SizeX, height: 0.6, depth: cuboid2SizeZ }, scene);
  cuboid2.position = new BABYLON.Vector3(0, 3.5, 0);
  cuboid2.material = cuboidMaterial;
  cuboid2.receiveShadows = true;
  cuboid2.parent = columnGroup;
  complexColumn.cuboid2 = cuboid2;

  // 3. Create posts around the perimeter of cuboids
  const cuboid1Posts = [
    new BABYLON.Vector3(-cuboid1SizeX / 2 + postOffset, 2.5, -cuboid1SizeZ / 2 + postOffset),
    new BABYLON.Vector3(-cuboid1SizeX / 2 + postOffset, 2.5, cuboid1SizeZ / 2 - postOffset),
    new BABYLON.Vector3(cuboid1SizeX / 2 - postOffset, 2.5, -cuboid1SizeZ / 2 + postOffset),
    new BABYLON.Vector3(cuboid1SizeX / 2 - postOffset, 2.5, cuboid1SizeZ / 2 - postOffset),
  ];

  const cuboid2Posts = [
    new BABYLON.Vector3(-cuboid2SizeX / 2 + postOffset, 2.5, -cuboid2SizeZ / 2 + postOffset),
    new BABYLON.Vector3(-cuboid2SizeX / 2 + postOffset, 2.5, cuboid2SizeZ / 2 - postOffset),
    new BABYLON.Vector3(cuboid2SizeX / 2 - postOffset, 2.5, -cuboid2SizeZ / 2 + postOffset),
    new BABYLON.Vector3(cuboid2SizeX / 2 - postOffset, 2.5, cuboid2SizeZ / 2 - postOffset),
  ];

  const allPostPositions = [...cuboid1Posts, ...cuboid2Posts];

  allPostPositions.forEach((pos, index) => {
    const post = BABYLON.MeshBuilder.CreateCylinder(
      `complexColumnPost_${index}`,
      { height: 2, diameter: postRadius * 2 },
      scene
    );
    post.position = pos;

    const postMaterial = new BABYLON.StandardMaterial(`complexPostMaterial_${index}`, scene);
    postMaterial.emissiveColor = new BABYLON.Color3(0.627, 0.322, 0.176); // #A0522D
    post.material = postMaterial;

    post.receiveShadows = true;
    post.parent = columnGroup;
    complexColumn.posts!.push(post);
  });

  return complexColumn;
};

export const updateComplexColumn = (
  complexColumn: ComplexColumnGroup,
  cuboid1SizeX: number = 2,
  cuboid1SizeZ: number = 2,
  cuboid2SizeX: number = 2,
  cuboid2SizeZ: number = 2,
  postRadius: number = 0.05,
  postOffset: number = 0.1
) => {
  const scene = complexColumn.group.getScene();
  const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  cuboidMaterial.emissiveColor = new BABYLON.Color3(1, 0.42, 0.42); // #FF6B6B
  cuboidMaterial.alpha = 0.4;

  // Update cuboid 1
  if (complexColumn.cuboid1) {
    complexColumn.cuboid1.dispose();

    const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', { width: cuboid1SizeX, height: 0.6, depth: cuboid1SizeZ }, scene);
    cuboid1.position = new BABYLON.Vector3(0, 3.5, 0);
    cuboid1.material = cuboidMaterial;
    cuboid1.receiveShadows = true;
    cuboid1.parent = complexColumn.group;
    complexColumn.cuboid1 = cuboid1;
  }

  // Update cuboid 2
  if (complexColumn.cuboid2) {
    complexColumn.cuboid2.dispose();

    const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', { width: cuboid2SizeX, height: 0.6, depth: cuboid2SizeZ }, scene);
    cuboid2.position = new BABYLON.Vector3(0, 3.5, 0);
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
  const cuboid1Posts = [
    new BABYLON.Vector3(-cuboid1SizeX / 2 + postOffset, 2.5, -cuboid1SizeZ / 2 + postOffset),
    new BABYLON.Vector3(-cuboid1SizeX / 2 + postOffset, 2.5, cuboid1SizeZ / 2 - postOffset),
    new BABYLON.Vector3(cuboid1SizeX / 2 - postOffset, 2.5, -cuboid1SizeZ / 2 + postOffset),
    new BABYLON.Vector3(cuboid1SizeX / 2 - postOffset, 2.5, cuboid1SizeZ / 2 - postOffset),
  ];

  const cuboid2Posts = [
    new BABYLON.Vector3(-cuboid2SizeX / 2 + postOffset, 2.5, -cuboid2SizeZ / 2 + postOffset),
    new BABYLON.Vector3(-cuboid2SizeX / 2 + postOffset, 2.5, cuboid2SizeZ / 2 - postOffset),
    new BABYLON.Vector3(cuboid2SizeX / 2 - postOffset, 2.5, -cuboid2SizeZ / 2 + postOffset),
    new BABYLON.Vector3(cuboid2SizeX / 2 - postOffset, 2.5, cuboid2SizeZ / 2 - postOffset),
  ];

  const allPostPositions = [...cuboid1Posts, ...cuboid2Posts];

  allPostPositions.forEach((pos, index) => {
    const post = BABYLON.MeshBuilder.CreateCylinder(
      `complexColumnPost_${index}`,
      { height: 2, diameter: postRadius * 2 },
      scene
    );
    post.position = pos;

    const postMaterial = new BABYLON.StandardMaterial(`complexPostMaterial_${index}`, scene);
    postMaterial.emissiveColor = new BABYLON.Color3(0.627, 0.322, 0.176); // #A0522D
    post.material = postMaterial;

    post.receiveShadows = true;
    post.parent = complexColumn.group;
    complexColumn.posts!.push(post);
  });
};
