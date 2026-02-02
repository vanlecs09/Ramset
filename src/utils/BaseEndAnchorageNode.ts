import * as BABYLON from '@babylonjs/core';
import {
  createConcrete,
  ConcreteNode,
} from './ConcreteNode';
import { createPost } from './PostNode';
import { createWaveBlock } from './WaveBuilder';
import {
  createLineTwoArrow,
  createDimensionWithLabel,
  DimensionLineNode,
} from './GeometryHelper';
import { createUnitAxes } from './UnitAxisNode';
import { BaseStructNodeImpl } from './BaseNode';
import { createBendingMomenNode } from './BendingMomenNode';
import {
  ArcDirection,
  createTorsionMomentNode as createTorsionMomentNode,
} from './TorsionMomentNode';
import {
  getConcreteDimensionMaterial,
  getTorsionMaterial,
  getDimensionLabelTexture,
} from './Material';

export interface EndAnchorageParams {
  beamWidth: number;
  beamDepth: number;
  beamHeight: number;
  postCountX: number;
  postCountZ: number;
  postDiameter: number;
  postOffset: number;
  concreteOffsetXRight: number;
  concreteOffsetXLeft: number;
  concreteOffsetZBack: number;
  concreteOffsetZFront: number;
  concreteThickness: number;
  isBoundlessConcrete?: boolean;
}

export interface TopBlockParams {
  width: number;
  depth: number;
  height: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface postParams { }

export interface ConcreteParams {
  thickness: number;
  width: number;
  depth: number;
  position: BABYLON.Vector3;
  isBoundless: boolean;
}

export class BaseEndAnchorageNode extends BaseStructNodeImpl {
  private concreteNode?: ConcreteNode;

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

  dispose(): void {
    // Dispose concrete group
    if (this.concreteNode) {
      this.concreteNode.dispose();
    }
    // Call parent to dispose moment nodes, wave blocks, dimension lines, axis meshes and posts
    super.dispose();
  }
}

export const createEndAnchorage = (
  scene: BABYLON.Scene,
  postPositions: BABYLON.Vector3[],
  params: EndAnchorageParams,
  concreteParams: ConcreteParams,
  beamParams: TopBlockParams,
): BaseEndAnchorageNode => {
  const anchorageTrans = new BABYLON.TransformNode('endAnchorage', scene);
  const mainNode = new BaseEndAnchorageNode(anchorageTrans);

  // 1. Create concrete
  const concreteNode = createConcrete(
    scene,
    concreteParams,
    anchorageTrans,
    !params.isBoundlessConcrete,
    true,
  );
  mainNode.setConcreteGroup(concreteNode);

  // 2. Create wave blocks (beam) extending from concrete
  const concretePosition = concreteParams.position;
  const beamPosition = new BABYLON.Vector3(
    0,
    concretePosition.y + beamParams.height / 2 + concreteNode.getConcreteHeight() / 2,
    0,
  );
  if (params.isBoundlessConcrete == false) {
    createInnerDeimensionLine(
      concretePosition,
      beamParams,
      concreteParams,
      beamPosition,
      scene,
      mainNode,
    );
  }

  createWaveBlockTop(
    mainNode,
    beamParams.width,
    beamParams.depth,
    beamParams.height,
    beamPosition,
  );

  // Update posts
  const postHeight = 0.3;
  for (const postPosition of postPositions) {
    const postGroup = createPost(
      scene,
      postHeight,
      params.postDiameter,
      postPosition,
      new BABYLON.Vector3(0, 0, 0),
      // new BABYLON.Vector3(Math.PI / 2, 0, 0),
      mainNode.group,
      `anchoragePin_${Math.random()}`,
    );
    mainNode.addPost(postGroup.mesh!);
  }

  // Update and cache axis meshes and labels
  const axisNode = createUnitAxes(
    scene,
    mainNode.group,
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
  );
  mainNode.setUnitAxisNode(axisNode);

  createMomens(scene, concretePosition, concreteParams, mainNode);

  return mainNode;
};

/**
 * Add wave blocks (beam) extending from the concrete
 */
export const createWaveBlockTop = (
  anchorageNode: BaseStructNodeImpl,
  blockWidth: number = 0.3,
  blockDepth: number = 0.5,
  blockHeight: number = 0.4,
  beamPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
) => {
  const scene = anchorageNode.group.getScene();

  // Clear existing wave blocks
  anchorageNode.clearWaveBlocks();
  const blockPosition = beamPosition;

  // Create beam (wave block)
  const blockMesh = createWaveBlock(
    scene,
    `beamBlock_`,
    blockPosition,
    blockWidth, // Width along X-axis
    blockHeight, // Height along Y-axis
    blockDepth, // Depth along Z-axis
    'y', // Wave on Z-axis
  );

  blockMesh.receiveShadows = true;
  blockMesh.parent = anchorageNode.group;
  anchorageNode.addWaveBlock(blockMesh);

  // Add dimension lines for beam
  const advancedTexture = getDimensionLabelTexture();

  // Create a dimension line node group to hold all dimension elements
  const dimensionNodes = new BABYLON.TransformNode('beamDimensions', scene);
  dimensionNodes.parent = anchorageNode.group;

  // Dimension line for beam depth (X-axis)
  const zOffset = 0.1;
  // Create positions in local space relative to block center
  let depthArrow1Position = new BABYLON.Vector3(
    -blockWidth / 2,
    blockHeight / 2 + zOffset,
    -blockDepth / 2,
  );
  let depthArrow2Position = new BABYLON.Vector3(
    blockWidth / 2,
    blockHeight / 2 + zOffset,
    -blockDepth / 2,
  );
  let depthCorner1 = new BABYLON.Vector3(
    -blockWidth / 2,
    blockHeight / 2,
    -blockDepth / 2,
  );
  let depthCorner2 = new BABYLON.Vector3(
    blockWidth / 2,
    blockHeight / 2,
    -blockDepth / 2,
  );

  // Offset to block position in world space
  depthArrow1Position = depthArrow1Position.add(blockPosition);
  depthArrow2Position = depthArrow2Position.add(blockPosition);
  depthCorner1 = depthCorner1.add(blockPosition);
  depthCorner2 = depthCorner2.add(blockPosition);

  const depthDimLabel = createDimensionWithLabel(
    'beamDepthDim',
    scene,
    depthArrow1Position,
    depthArrow2Position,
    depthCorner1,
    depthCorner2,
    getConcreteDimensionMaterial(scene),
    blockWidth,
    dimensionNodes,
    advancedTexture,
    25,
    0,
  );

  // Create DimensionLineNode to manage depth dimension
  const depthDimensionNode = new DimensionLineNode(dimensionNodes);
  // if (depthDimLabel) {
  depthDimensionNode.addLabel(depthDimLabel!.label);
  // }
  // Add all child meshes from dimension group
  (dimensionNodes.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
    depthDimensionNode.addMesh(mesh);
  });
  anchorageNode.addDimensionLine(depthDimensionNode);

  // Create positions in local space relative to block center
  let heightArrow1Position = new BABYLON.Vector3(
    blockWidth / 2 + zOffset,
    blockHeight / 2,
    -blockDepth / 2,
  );
  let heightArrow2Position = new BABYLON.Vector3(
    blockWidth / 2 + zOffset,
    blockHeight / 2,
    blockDepth / 2,
  );
  let heightCorner1 = new BABYLON.Vector3(
    blockWidth / 2,
    blockHeight / 2,
    -blockDepth / 2,
  );
  let heightCorner2 = new BABYLON.Vector3(
    blockWidth / 2,
    blockHeight / 2,
    blockDepth / 2,
  );

  // Offset to block position in world space
  heightArrow1Position = heightArrow1Position.add(blockPosition);
  heightArrow2Position = heightArrow2Position.add(blockPosition);
  heightCorner1 = heightCorner1.add(blockPosition);
  heightCorner2 = heightCorner2.add(blockPosition);

  const heightDimLabel = createDimensionWithLabel(
    'beamHeightDim',
    scene,
    heightArrow1Position,
    heightArrow2Position,
    heightCorner1,
    heightCorner2,
    getConcreteDimensionMaterial(scene),
    blockDepth,
    dimensionNodes,
    advancedTexture,
    -40,
    0,
  );

  // Add height dimension label to the node
  if (heightDimLabel) {
    depthDimensionNode.addLabel(heightDimLabel.label);
  }
};

export type EndAnchorageNode = BaseEndAnchorageNode;
export const createMomens = (
  scene: BABYLON.Scene,
  concretePosition: BABYLON.Vector3,
  concreteParams: ConcreteParams,
  mainNode: BaseStructNodeImpl) => {

  const basePosition = new BABYLON.Vector3(
    0,
    concretePosition.y + concreteParams.thickness / 2,
    0,
  );
  const bendingMoment1 = createBendingMomenNode(
    scene,
    basePosition,
    1,
    new BABYLON.Vector3(1, 0, 0),
    BABYLON.Color3.Black(),
    200,
    mainNode.group
  );
  bendingMoment1.setLineAndArrowVisible(false);
  mainNode.addBendingMomentNode(bendingMoment1);


  const bendingMoment2 = createBendingMomenNode(
    scene,
    basePosition,
    1,
    new BABYLON.Vector3(0, 0, 1),
    BABYLON.Color3.Black(),
    200,
    mainNode.group
  );
  bendingMoment2.setLineAndArrowVisible(false);
  mainNode.addBendingMomentNode(bendingMoment2);

  const bendingMoment3 = createBendingMomenNode(
    scene,
    basePosition,
    1,
    new BABYLON.Vector3(0, 1, 0),
    BABYLON.Color3.Black(),
    200,
    mainNode.group
  );
  mainNode.addBendingMomentNode(bendingMoment3);

  const torsionMat = getTorsionMaterial(scene);

  const torsion = createTorsionMomentNode(
    'torque1',
    scene,
    mainNode.group,
    basePosition.add(new BABYLON.Vector3(1, 0, 0)),
    new BABYLON.Vector3(0, -1, 0), // Direction along XF
    new BABYLON.Vector3(0, 0, 1), // Direction along X
    undefined, // arcAngle (use default)
    ArcDirection.FORWARD, // Forward pointing
    torsionMat,
    '25kg'
  );
  mainNode.addTorsionMomentNode(torsion);

  const torsion2 = createTorsionMomentNode(
    'torque1',
    scene,
    mainNode.group,
    basePosition.add(new BABYLON.Vector3(0, 0, 1)),
    new BABYLON.Vector3(1, 0, 0), // Direction along XF
    new BABYLON.Vector3(0, 1, 0), // Direction along X
    undefined, // arcAngle (use default)
    ArcDirection.FORWARD, // Forward pointing
    torsionMat,
    '25kg'
  );
  mainNode.addTorsionMomentNode(torsion2);
}

function createInnerDeimensionLine(
  concretePosition: BABYLON.Vector3,
  beamParams: TopBlockParams,
  concreteParams: ConcreteParams,
  beamPosition: BABYLON.Vector3,
  scene: BABYLON.Scene,
  anchorageNode: BaseEndAnchorageNode,
) {
  const dimensionNodes = new BABYLON.TransformNode(
    'beamDimensionsDistance',
    scene,
  );
  dimensionNodes.parent = anchorageNode.group;
  // const beamWidthMeasure = Math.abs(beamParams.beamWidth / 2);szz//s
  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x + beamParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z - beamParams.depth / 2,
    );
    const endPos = new BABYLON.Vector3(
      concretePosition.x + concreteParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z - beamParams.depth / 2,
    );
    const length = BABYLON.Vector3.Distance(beginPos, endPos);
    if (length > 0) {
      const result1 = createLineTwoArrow(
        beginPos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        getConcreteDimensionMaterial(scene),
        // beamWidthMeasure
      );

      const dimensionLineNode1 = new DimensionLineNode(anchorageNode.group);
      dimensionLineNode1.addMesh(result1.line!);
      if (result1.label) dimensionLineNode1.addLabel(result1.label);
      dimensionLineNode1.addMesh(result1.arrow[0]!);
      dimensionLineNode1.addMesh(result1.arrow[1]!);
      anchorageNode.addDimensionLine(dimensionLineNode1);
    }
  }

  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x - beamParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z - beamParams.depth / 2,
    );
    const endPos = new BABYLON.Vector3(
      concretePosition.x - concreteParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z - beamParams.depth / 2,
    );
    const length = BABYLON.Vector3.Distance(beginPos, endPos);
    if (length > 0) {
      const result2 = createLineTwoArrow(
        beginPos,
        endPos,
        'beamWidthArrow',
        scene,
        dimensionNodes,
        getConcreteDimensionMaterial(scene),
        // beamWidthMeasure
      );

      const dimensionLineNode2 = new DimensionLineNode(anchorageNode.group);
      dimensionLineNode2.addMesh(result2.line!);
      if (result2.label) dimensionLineNode2.addLabel(result2.label);
      dimensionLineNode2.addMesh(result2.arrow[0]!);
      dimensionLineNode2.addMesh(result2.arrow[1]!);
      anchorageNode.addDimensionLine(dimensionLineNode2);
    }
  }

  {
    const beginPos = new BABYLON.Vector3(
      beamPosition.x + beamParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z - beamParams.depth / 2,
    );
    const endPos = new BABYLON.Vector3(
      beamPosition.x + beamParams.width / 2,
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
        getConcreteDimensionMaterial(scene),
        // beamWidthMeasure
      );

      const dimensionLineNode3 = new DimensionLineNode(anchorageNode.group);
      dimensionLineNode3.addMesh(result3.line!);
      if (result3.label) dimensionLineNode3.addLabel(result3.label);
      dimensionLineNode3.addMesh(result3.arrow[0]!);
      dimensionLineNode3.addMesh(result3.arrow[1]!);
      anchorageNode.addDimensionLine(dimensionLineNode3);
    }
  }

  {
    const beginePos = new BABYLON.Vector3(
      beamPosition.x + beamParams.width / 2,
      concretePosition.y + concreteParams.thickness / 2,
      beamPosition.z + beamParams.depth / 2,
    );
    const endPos = new BABYLON.Vector3(
      beamPosition.x + beamParams.width / 2,
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
        getConcreteDimensionMaterial(scene),
        // beamWidthMeasure
      );
      const dimensionLineNode4 = new DimensionLineNode(anchorageNode.group);
      dimensionLineNode4.addMesh(result4.line!);
      if (result4.label) dimensionLineNode4.addLabel(result4.label);
      dimensionLineNode4.addMesh(result4.arrow[0]!);
      dimensionLineNode4.addMesh(result4.arrow[1]!);
      anchorageNode.addDimensionLine(dimensionLineNode4);
    }
  }
}
