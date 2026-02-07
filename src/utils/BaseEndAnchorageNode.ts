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
import { createSplitRectangle } from './SplitRectangleNode';
import type { ConcreteParams, EndAnchorageParams, PostParam, TopBlockParams } from './EndAnchorageParams';
import { createInnerDeimensionLine } from './EndAnchorageCircularColumnsNode';

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
  concreteParams: ConcreteParams,
  topBlock: TopBlockParams,
  postParam: PostParam,
): BaseEndAnchorageNode => {
  const anchorageTrans = new BABYLON.TransformNode('endAnchorage', scene);
  const mainNode = new BaseEndAnchorageNode(anchorageTrans);

  // 1. Create concrete
  const concreteNode = createConcrete(
    scene,
    concreteParams,
    anchorageTrans,
    concreteParams.isBounded,
    true,
  );
  mainNode.setConcreteGroup(concreteNode);

  // 2. Create wave blocks (beam) extending from concrete
  const concretePosition = concreteParams.position;
  const beamPosition = new BABYLON.Vector3(
    0,
    concretePosition.y +
      topBlock.height / 2 +
      concreteNode.getConcreteHeight() / 2,
    0,
  );
  if (concreteParams.isBounded == true) {
    createInnerDeimensionLine(
      concretePosition,
      concreteParams,
      beamPosition,
      scene,
      mainNode,
    );
  }

  createWaveBlockTop(
    mainNode,
    topBlock.width,
    topBlock.depth,
    topBlock.height,
    beamPosition,
  );

  const splitPosition = new BABYLON.Vector3(
    beamPosition.x,
    beamPosition.y - topBlock.height / 2 + 0.001,
    beamPosition.z,
  );
  const halfWidth = topBlock.width / 2;
  const halfDepth = topBlock.depth / 2;
  const splitPoint1 = new BABYLON.Vector2(
    -halfWidth + halfWidth * 2,
    -halfDepth,
  );
  const splitPoint2 = new BABYLON.Vector2(-halfWidth + halfWidth, halfDepth);
  // Create diagonal split using the specified points
  const splitRect = createSplitRectangle(
    scene,
    topBlock.width,
    topBlock.depth,
    splitPosition,
    splitPoint1,
    splitPoint2,
    new BABYLON.Color3(0.5, 0.5, 0.5), // Gray
    new BABYLON.Color3(1, 0.5, 0), // Orange
  );
  splitRect.parent = mainNode.group;
  mainNode.addWaveBlock(splitRect);

  // Update posts
  // const postHeight = 0.3;
  for (const postPosition of postParam.postPositions) {
    const postGroup = createPost(
      scene,
      postParam.postHeight,
      postParam.postRadius * 2, // diameter
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
  mainNode: BaseStructNodeImpl,
) => {
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
    mainNode.group,
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
    mainNode.group,
  );
  bendingMoment2.setLineAndArrowVisible(false);
  mainNode.addBendingMomentNode(bendingMoment2);

  const bendingMoment3 = createBendingMomenNode(
    scene,
    basePosition,
    0.75,
    new BABYLON.Vector3(0, 1, 0),
    BABYLON.Color3.Black(),
    200,
    mainNode.group,
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
    '25kNm',
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
    '25kNm',
  );
  mainNode.addTorsionMomentNode(torsion2);
};

