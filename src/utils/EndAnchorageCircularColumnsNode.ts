import * as BABYLON from '@babylonjs/core';
import { createConcrete, ConcreteNode } from './ConcreteNode';
import { createPost } from './PostNode';
import { createCircularStandingWave } from './WaveBuilder';
import { BaseStructNodeImpl } from './BaseNode';
import type { PostPosition } from './CircularPostPositionCalculator';
import { createUnitAxes } from './GeometryHelper';
import { createBendingMomenNode } from './BendingMomenNode';
import { createTorsionMomentNode, ArcDirection } from './TorsionMomentNode';

export interface BaseStructureGroup {
  group: BABYLON.TransformNode;
  getAxisMeshes(): BABYLON.Mesh[];
  setAxisMeshes(meshes: BABYLON.Mesh[]): void;
  clearAxisMeshes(): void;
  dispose(): void;
}

export class EndAnchorageCircularColumnsNode extends BaseStructNodeImpl {
  private concreteGroup?: ConcreteNode;
  private circularColumn?: BABYLON.Mesh;
  private standingWaveMesh?: BABYLON.Mesh;
  private torqueMeshes?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    super(group);
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

  getStandingWaveMesh(): BABYLON.Mesh | undefined {
    return this.standingWaveMesh;
  }

  setStandingWaveMesh(mesh: BABYLON.Mesh): void {
    this.standingWaveMesh = mesh;
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

    // Dispose standing wave mesh
    this.standingWaveMesh?.dispose();

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

export interface ConcreteParam {
  thickness: number;
  width: number;
  depth: number;
  position: BABYLON.Vector3;
  isBoundless: boolean;
}

export interface CircleColumnsParam {
  columnHeight: number;
  columnRadius: number;
}

export interface PostParam {
  postRadius: number;
  postPositions: PostPosition[];
}

export interface CircularColumnParams {
  concreteParam: ConcreteParam;
  circleColumnsParam: CircleColumnsParam;
  postParam: PostParam;
  infiniteBlockPositions?: BABYLON.Vector3[];
}

export const createCircularColumns = (
  scene: BABYLON.Scene,
  params: CircularColumnParams
): EndAnchorageCircularColumnsNode => {
  const towerGroup = new BABYLON.TransformNode('EndAnchorageCircularColumns', scene);
  const mainNode = new EndAnchorageCircularColumnsNode(towerGroup);

  // Create bottom concrete
  const concreteGroup = createConcrete(
    scene,
    {
      thickness: params.concreteParam.thickness,
      width: params.concreteParam.width,
      depth: params.concreteParam.depth,
      position: params.concreteParam.position
    },
    towerGroup,
    params.concreteParam.isBoundless
  );

  mainNode.setConcreteGroup(concreteGroup);

  // Calculate concrete top position
  const concreteTopY = 0;
  const gapDistance = 0;

  // Create cylinder
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    'towerCylinder',
    { height: params.circleColumnsParam.columnHeight, diameter: params.circleColumnsParam.columnRadius * 2 },
    scene
  );
  cylinder.position.y = concreteTopY + gapDistance + params.circleColumnsParam.columnHeight / 2;

  const cylinderMaterial = new BABYLON.StandardMaterial('cylinderMaterial', scene);
  cylinderMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  cylinderMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  cylinderMaterial.alpha = 0.4;
  cylinder.material = cylinderMaterial;
  cylinder.receiveShadows = true;
  cylinder.parent = towerGroup;
  mainNode.setCircularColumn(cylinder);

  // Create standing wave on top of cylinder
  const wavePosition = new BABYLON.Vector3(
    params.concreteParam.position.x,
    concreteTopY + gapDistance + params.circleColumnsParam.columnHeight + 0.05,
    params.concreteParam.position.z
  );

  const waveWaveMaterial = new BABYLON.StandardMaterial('waveWaveMaterial', scene);
  waveWaveMaterial.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);   // tan/beige color
  waveWaveMaterial.specularColor = new BABYLON.Color3(1, 1, 1);// semi-transparent
  waveWaveMaterial.alpha = 0.4;
  waveWaveMaterial.backFaceCulling = false;

  const standingWave = createCircularStandingWave(
    scene,
    wavePosition,
    params.circleColumnsParam.columnRadius,
    0.1,
    waveWaveMaterial,
    0.02,
    4
  );
  standingWave.parent = towerGroup;
  mainNode.setStandingWaveMesh(standingWave);

  // Create posts
  const postHeight = params.circleColumnsParam.columnHeight * 2;

  params.postParam.postPositions.forEach((postPos) => {
    const adjustedPostPosition = new BABYLON.Vector3(
      postPos.position.x,
      concreteTopY,
      postPos.position.z
    );

    const postGroup = createPost(
      scene,
      postHeight,
      params.postParam.postRadius * 2,
      adjustedPostPosition,
      undefined,
      towerGroup,
      `towerPost_${postPos.index}`
    );
    mainNode.addPost(postGroup.mesh!);
  });

  const axisNode = createUnitAxes(
    scene,
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0)
  );
  mainNode.setAxisMeshes(axisNode.meshes);
  mainNode.setLabels(axisNode.labels);

  const bendingMoment1 = createBendingMomenNode(
    scene,
    new BABYLON.Vector3(
      params.concreteParam.position.x,
      params.concreteParam.position.y + params.concreteParam.thickness / 2,
      params.concreteParam.position.z
    ),
    1,
    new BABYLON.Vector3(1, 0, 0),
    BABYLON.Color3.Black(),
    '200'
  );
  mainNode.addBendingMomentNode(bendingMoment1);

  let basePosition = new BABYLON.Vector3(
    params.concreteParam.position.x,
    params.concreteParam.position.y + params.concreteParam.thickness / 2,
    params.concreteParam.position.z
  );
  const bendingMoment2 = createBendingMomenNode(
    scene,
    basePosition,
    1,
    new BABYLON.Vector3(0, 0, 1),
    BABYLON.Color3.Black(),
    '200'
  );
  mainNode.addBendingMomentNode(bendingMoment2);

  const bendingMoment3 = createBendingMomenNode(
    scene,
    basePosition,
    1,
    new BABYLON.Vector3(0, 1, 0),
    BABYLON.Color3.Black(),
    '200'
  );
  mainNode.addBendingMomentNode(bendingMoment3);

   const torsionMat = new BABYLON.StandardMaterial('torsionMat', scene);
      torsionMat.diffuseColor = BABYLON.Color3.Black();
  
      const torsion = createTorsionMomentNode(
          'torque1',
          scene,
          basePosition.add(new BABYLON.Vector3(1, 0, 0)),
  
          new BABYLON.Vector3(0, -1, 0),    // Direction along XF
          new BABYLON.Vector3(0, 0, 1),    // Direction along X
          undefined,                        // arcAngle (use default)
          ArcDirection.FORWARD,             // Forward pointing
          torsionMat,
          '25kg'                               // Label text
      );
      mainNode.addTorsionMomentNode(torsion);
  
  
      const torsion2 = createTorsionMomentNode(
          'torque1',
          scene,
          basePosition.add(new BABYLON.Vector3(0, 0, 1)),
  
          new BABYLON.Vector3(1, 0, 0),    // Direction along XF
          new BABYLON.Vector3(0, 1, 0),    // Direction along X
          undefined,                        // arcAngle (use default)
          ArcDirection.FORWARD,             // Forward pointing
          torsionMat,
          '25kg'                               // Label text
      );
      mainNode.addTorsionMomentNode(torsion2);


  return mainNode;
};

