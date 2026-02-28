import * as BABYLON from '@babylonjs/core';
import {
  createConcrete,
  ConcreteNode,
} from './ConcreteNode';
import { createPost } from './PostNode';
import { createCircularStandingWave } from './WaveBuilder';

import { createLineTwoArrow, DimensionLineNode } from './GeometryHelper';
import { createUnitAxes } from './UnitAxisNode';
import { BaseEndAnchorageNode, createMomens } from './BaseEndAnchorageNode';
import {
  getConcreteMaterial,
  getConcreteDimensionMaterial,
  getCircularStandingWaveMaterial,
} from './Material';
import type { ConcreteParams, PostParam } from './EndAnchorageParams';

export interface BaseStructureGroup {
  group: BABYLON.TransformNode;
  getAxisMeshes(): BABYLON.Mesh[];
  setAxisMeshes(meshes: BABYLON.Mesh[]): void;
  clearAxisMeshes(): void;
  dispose(): void;
}

export class EndAnchorageCircularColumnsNode extends BaseEndAnchorageNode {
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

export interface CircleColumnsParam {
  columnHeight: number;
  columnRadius: number;
}

export interface CircularColumnParams {
  concreteParam: ConcreteParams;
  circleColumnsParam: CircleColumnsParam;
  postParam: PostParam;
  infiniteBlockPositions?: BABYLON.Vector3[];
}

export const createCircularColumns = (
  scene: BABYLON.Scene,
  params: CircularColumnParams,
): EndAnchorageCircularColumnsNode => {
  const towerGroup = new BABYLON.TransformNode(
    'EndAnchorageCircularColumns',
    scene,
  );
  const mainNode = new EndAnchorageCircularColumnsNode(towerGroup);

  // Create bottom concrete
  const concreteNode = createConcrete(
    scene,
    {
      thickness: params.concreteParam.thickness,
      width: params.concreteParam.width,
      depth: params.concreteParam.depth,
      position: params.concreteParam.position,
      isBounded: params.concreteParam.isBounded,
    },
    towerGroup,
    params.concreteParam.isBounded,
  );

  mainNode.setConcreteGroup(concreteNode);

  // Calculate concrete top position
  const concreteTopY = 0;
  const gapDistance = 0;

  // Create standing wave on top of cylinder
  const wavePosition = new BABYLON.Vector3(
    0,
    concreteTopY + gapDistance + params.circleColumnsParam.columnHeight / 2,
    0,
  );

  const material = getCircularStandingWaveMaterial(scene);
  // circularStandingWaveMaterial.disableLighting = true;
  material.backFaceCulling = false;
  material.cullBackFaces = false;

  const circlularColumn = createCircularStandingWave(
    scene,
    wavePosition,
    params.circleColumnsParam.columnRadius,
    params.circleColumnsParam.columnHeight,
    material,
    0.025,
    20,
  );
  circlularColumn.parent = towerGroup;
  mainNode.setStandingWaveMesh(circlularColumn);

  // const debugPoints = debugMeshVertices(standingWave, scene, 0.005, new BABYLON.Color3(1, 0, 0));

  // Create posts
  params.postParam.postPositions.forEach((postPos: any, index: number) => {
    // Handle both PostPosition and Vector3 types
    const position =
      postPos.position instanceof BABYLON.Vector3 ? postPos.position : postPos;
    const posIndex = postPos.index !== undefined ? postPos.index : index;

    const adjustedPostPosition = new BABYLON.Vector3(
      position.x,
      concreteTopY,
      position.z,
    );

    const postGroup = createPost(
      scene,
      params.postParam.postHeight,
      params.postParam.postRadius * 2,
      adjustedPostPosition,
      undefined,
      towerGroup,
      `towerPost_${posIndex}`,
    );
    mainNode.addPost(postGroup.mesh!);
  });

  const axisNode = createUnitAxes(
    scene,
    mainNode.group,
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
  );
  mainNode.setUnitAxisNode(axisNode);

  createMomens(
    scene,
    params.concreteParam.position,
    params.concreteParam,
    mainNode,
  );
  if (params.concreteParam.isBounded) {
    createInnerDeimensionLine(
      params.concreteParam.position,
      params.concreteParam,
      new BABYLON.Vector3(0, 0, 0),
      scene,
      mainNode,
    );
  }

  return mainNode;
};

export const  createInnerDeimensionLine =(
  concretePosition: BABYLON.Vector3,
  concreteParams: ConcreteParams,
  beamPosition: BABYLON.Vector3,
  scene: BABYLON.Scene,
  mainnode: BaseEndAnchorageNode,
) => {
  const dimensionMaterial = getConcreteDimensionMaterial(scene);

  const dimensionNodes = new BABYLON.TransformNode(
    'beamDimensionsDistance',
    scene,
  );
  dimensionNodes.parent = mainnode.group;
  // const beamWidthMeasure = Math.abs(beamParams.beamWidth / 2);szz//s
  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const endPos = new BABYLON.Vector3(
      concretePosition.x + concreteParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const length = BABYLON.Vector3.Distance(beginPos, endPos);
    if (length > 0) {
      const result1 = createLineTwoArrow(
        beginPos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        dimensionMaterial!,
        // beamWidthMeasure
      );

      const dimensionLineNode1 = new DimensionLineNode(mainnode.group);
      dimensionLineNode1.addMesh(result1.line!);
      if (result1.label) dimensionLineNode1.addLabel(result1.label);
      dimensionLineNode1.addMesh(result1.arrow[0]!);
      dimensionLineNode1.addMesh(result1.arrow[1]!);
      mainnode.addDimensionLine(dimensionLineNode1);
    }
  }

  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const endPos = new BABYLON.Vector3(
      concretePosition.x - concreteParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const length = BABYLON.Vector3.Distance(beginPos, endPos);
    if (length > 0) {
      const result2 = createLineTwoArrow(
        beginPos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        dimensionMaterial!,
        // beamWidthMeasure
      );

      const dimensionLineNode2 = new DimensionLineNode(mainnode.group);
      dimensionLineNode2.addMesh(result2.line!);
      if (result2.label) dimensionLineNode2.addLabel(result2.label);
      dimensionLineNode2.addMesh(result2.arrow[0]!);
      dimensionLineNode2.addMesh(result2.arrow[1]!);
      mainnode.addDimensionLine(dimensionLineNode2);
    }
  }

  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const endPos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      concretePosition.z - concreteParams.depth / 2,
    );
    const length = BABYLON.Vector3.Distance(beginPos, endPos);
    if (length > 0) {
      const result3 = createLineTwoArrow(
        beginPos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        dimensionMaterial!,
        // beamWidthMeasure
      );

      const dimensionLineNode3 = new DimensionLineNode(mainnode.group);
      dimensionLineNode3.addMesh(result3.line!);
      if (result3.label) dimensionLineNode3.addLabel(result3.label);
      dimensionLineNode3.addMesh(result3.arrow[0]!);
      dimensionLineNode3.addMesh(result3.arrow[1]!);
      mainnode.addDimensionLine(dimensionLineNode3);
    }
  }

  {
    const beginePos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z,
    );
    const endPos = new BABYLON.Vector3(
      beamPosition.x,
      concretePosition.y + concreteParams.thickness / 2,
      concretePosition.z + concreteParams.depth / 2,
    );
    const length = BABYLON.Vector3.Distance(beginePos, endPos);
    if (length > 0) {
      const result4 = createLineTwoArrow(
        beginePos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        dimensionMaterial!,
        // beamWidthMeasure
      );
      const dimensionLineNode4 = new DimensionLineNode(mainnode.group);
      dimensionLineNode4.addMesh(result4.line!);
      if (result4.label) dimensionLineNode4.addLabel(result4.label);
      dimensionLineNode4.addMesh(result4.arrow[0]!);
      dimensionLineNode4.addMesh(result4.arrow[1]!);
      mainnode.addDimensionLine(dimensionLineNode4);
    }
  }
}