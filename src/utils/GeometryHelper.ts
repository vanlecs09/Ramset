import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { getDimensionLabelTexture } from './Material';
import { BaseNodeImpl } from './BaseNode';
import { createLineArrowNode } from './LineArrowNode';

// ==================== Constants ====================

/** Default values for dimension line rendering */
export const DIMENSION_LINE_CONSTANTS = {
  LINE_THICKNESS: 0.005,
  ARROW_SIZE: 0.015,
  ARROW_DIAMETER: 0.02,
  LABEL_FONT_SIZE: 20,
  LABEL_DECIMAL_PLACES: 2,
} as const;

export const SCREEN_TO_WORLD_UNIT = 1000;

/**
 * Configuration options for creating dimension lines with various styling and layout options.
 * @interface DimensionLineOptions
 * @property {('width' | 'depth' | 'height')[]} [dimensions] - Which dimensions to display
 * @property {number} [offset] - Offset distance from the measured object
 * @property {BABYLON.Color3} [color] - Color of the dimension lines and arrows
 * @property {number} [scale] - Scale factor for dimension visualization
 * @property {number} [arrowSize] - Size of arrow heads at dimension endpoints
 * @property {boolean} [showLabel] - Whether to display dimension text labels
 * @property {Object} [bounds] - Bounding box of the measured object
 * @property {number} bounds.minX - Minimum X coordinate
 * @property {number} bounds.maxX - Maximum X coordinate
 * @property {number} bounds.minY - Minimum Y coordinate
 * @property {number} bounds.maxY - Maximum Y coordinate
 * @property {number} bounds.minZ - Minimum Z coordinate
 * @property {number} bounds.maxZ - Maximum Z coordinate
 */
export interface DimensionLineOptions {
  dimensions?: ('width' | 'depth' | 'height')[];
  offset?: number;
  color?: BABYLON.Color3;
  scale?: number;
  arrowSize?: number;
  showLabel?: boolean;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

/**
 * Data structure representing a dimension label in 3D space.
 * Tracks the relationship between a GUI label and its associated dimension line mesh.
 */
export interface DimensionLabelNode {
  label: GUI.TextBlock;
  lineMesh: BABYLON.Mesh;
  linePosition: BABYLON.Vector3;
  offsetX: number;
  offsetY: number;
}

export class DimensionLineNode extends BaseNodeImpl {
  private meshes: BABYLON.Mesh[] = [];
  private labels: GUI.TextBlock[] = [];
  // width: number;
  // depth: number;
  // height: number;

  constructor(
    group: BABYLON.TransformNode,
    // width: number = 0,
    // depth: number = 0,
    // height: number = 0
  ) {
    super(group);
    // this.width = width;
    // this.depth = depth;
    // this.height = height;
  }

  getMeshes(): BABYLON.Mesh[] {
    return this.meshes;
  }

  setMeshes(meshes: BABYLON.Mesh[]): void {
    this.meshes = meshes;
  }

  addMesh(mesh: BABYLON.Mesh): void {
    this.meshes.push(mesh);
  }

  getLabels(): GUI.TextBlock[] {
    return this.labels;
  }

  setLabels(labels: GUI.TextBlock[]): void {
    this.labels = labels;
  }

  addLabel(label: GUI.TextBlock): void {
    this.labels.push(label);
  }

  dispose(): void {
    this.meshes.forEach(mesh => mesh.dispose());
    this.labels.forEach(label => label.dispose());
    super.dispose();
    this.group.dispose();
  }
}

export class AxisLineNode extends BaseNodeImpl {
  constructor(group: BABYLON.TransformNode) {
    super(group);
  }

  dispose(): void {
    super.dispose();
    this.group.dispose();
  }
}

/**
 * Creates a dimension line with arrows, connectors, and optional label.
 * Constructs a complete dimension visualization showing distance between two points.
 */
export const createDimensionLine = (
  name: string,
  scene: BABYLON.Scene,
  beginPoint01: BABYLON.Vector3,
  beginPoint02: BABYLON.Vector3,
  endPoint01: BABYLON.Vector3,
  endPoint02: BABYLON.Vector3,
  lineMat: BABYLON.Material,
  showLabel: boolean = true,
  labelValue?: number,
  advancedTexture?: GUI.AdvancedDynamicTexture,
): {
  meshes: BABYLON.Mesh[];
  lineMesh: BABYLON.Mesh;
  label?: GUI.TextBlock;
} => {
  const texture = advancedTexture || getDimensionLabelTexture();
  const meshes: BABYLON.Mesh[] = [];

  const line = createLine(
    beginPoint01,
    beginPoint02,
    name,
    DIMENSION_LINE_CONSTANTS.LINE_THICKNESS,
    scene,
    lineMat,
  );
  meshes.push(line);
  // Create main dimension line
  const lineArrow1 = createLineArrowNode(
    beginPoint01,
    endPoint01,
    name,
    scene,
    lineMat,
  );
  meshes.push(lineArrow1.line);
  meshes.push(lineArrow1.arrow);

  // Create connector lines from dimension line to measurement points
  const lineArrow2 = createLineArrowNode(
    beginPoint02,
    endPoint02,
    name,
    scene,
    lineMat,
  );
  meshes.push(lineArrow2.line);
  meshes.push(lineArrow2.arrow);

  // Create optional label
  let label: GUI.TextBlock | undefined;
  if (showLabel && labelValue !== undefined) {
    label = new GUI.TextBlock();
    label.text = `${Number(labelValue * SCREEN_TO_WORLD_UNIT).toFixed(0)}mm`;
    label.color = 'black';
    label.fontSize = DIMENSION_LINE_CONSTANTS.LABEL_FONT_SIZE;
    texture.addControl(label);
  }

  return { meshes, lineMesh: line, label };
};

/**
 * Creates a complete dimension line system with integrated GUI labels.
 * Combines dimension line creation with label management and mesh parenting.
 */
export const createDimensionWithLabel = (
  dimensionName: string,
  scene: BABYLON.Scene,
  arrow1Position: BABYLON.Vector3,
  arrow2Position: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  material: BABYLON.Material,
  dimensionValue: number,
  parentTransNode: BABYLON.TransformNode,
  advancedTexture?: GUI.AdvancedDynamicTexture,
  labelOffsetX: number = 0,
  labelOffsetY: number = 0,
  showLabel: boolean = true,
): DimensionLabelNode | null => {
  const linePosition = BABYLON.Vector3.Lerp(
    arrow1Position,
    arrow2Position,
    0.5,
  );
  const texture = advancedTexture || getDimensionLabelTexture();

  const result = createDimensionLine(
    dimensionName,
    scene,
    arrow1Position,
    arrow2Position,
    corner1Position,
    corner2Position,
    material,
    showLabel,
    dimensionValue,
    texture,
  );

  // Parent all meshes to the group
  result.meshes.forEach(mesh => {
    mesh.parent = parentTransNode;
  });

  // Create label data with positioning info
  if (result.label) {
    result.label.linkWithMesh(result.lineMesh);
    result.label.linkOffsetX = labelOffsetX;
    result.label.linkOffsetY = labelOffsetY;

    // Calculate rotation angle to align label with line direction
    const lineDirection = arrow2Position.subtract(arrow1Position);
    const angle = Math.atan2(lineDirection.y, lineDirection.x);
    result.label.rotation = angle;

    return {
      label: result.label,
      lineMesh: result.lineMesh,
      linePosition: linePosition.clone(),
      offsetX: labelOffsetX,
      offsetY: labelOffsetY,
    };
  }

  return null;
};

/**
 * Helper function to create a single arrow head cone.
 * Used by createDimensionLine to place arrows at dimension endpoints.
 */
export const createArrow = (
  name: string,
  arrowDiameter: number,
  arrowSize: number,
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  direction: BABYLON.Vector3,
  material: BABYLON.Material,
): BABYLON.Mesh => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  // const direction = position.subtract(position).normalize(); // Results in zero vector

  const quaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction,
    new BABYLON.Quaternion(),
  );

  const arrow = BABYLON.MeshBuilder.CreateCylinder(
    name + 'Arrow1',
    {
      diameterTop: 0,
      diameterBottom: arrowDiameter,
      height: arrowSize,
    },
    scene,
  );

  arrow.position = position;
  arrow.rotationQuaternion = quaternion;
  arrow.material = material;

  return arrow;
};

/**
 * Creates a line between two points with specified thickness.
 */
export const createLine = (
  beginPoint: BABYLON.Vector3,
  endPoint: BABYLON.Vector3,
  name: string,
  lineThickness: number,
  scene: BABYLON.Scene,
  lineMat: BABYLON.Material,
): BABYLON.Mesh => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  const distance = BABYLON.Vector3.Distance(beginPoint, endPoint);
  const direction = endPoint.subtract(beginPoint).normalize();

  const line = BABYLON.MeshBuilder.CreateCylinder(
    name + '_line',
    {
      diameter: lineThickness,
      height: distance,
    },
    scene,
  );

  line.position = BABYLON.Vector3.Lerp(beginPoint, endPoint, 0.5);
  line.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction,
    new BABYLON.Quaternion(),
  );
  line.material = lineMat;

  return line;
};

export const createLineTwoArrow = (
  beginPoint01: BABYLON.Vector3,
  endPoint01: BABYLON.Vector3,
  name: string,
  scene: BABYLON.Scene,
  parent: BABYLON.TransformNode,
  lineMat: BABYLON.Material,
  // length: number
) => {
  const length = BABYLON.Vector3.Distance(beginPoint01, endPoint01);
  const line = createLine(
    beginPoint01,
    endPoint01,
    name,
    DIMENSION_LINE_CONSTANTS.LINE_THICKNESS,
    scene,
    lineMat,
  );
  line.parent = parent;

  const texture = getDimensionLabelTexture();
  line.parent = parent;
  const label = new GUI.TextBlock();
  label.text = `${length * SCREEN_TO_WORLD_UNIT}mm`;
  label.fontSize = 20;
  label.color = BABYLON.Color3.Black().toHexString();

  texture.addControl(label);
  label.linkWithMesh(line);

  // Calculate rotation angle to align label with line direction
  const lineDirection = endPoint01.subtract(beginPoint01);
  const angle = Math.atan2(lineDirection.y, lineDirection.x);
  label.rotation = angle;

  const direction = endPoint01.subtract(beginPoint01).normalize();
  // Create arrows at measurement points
  const arrow = createArrow(
    name,
    DIMENSION_LINE_CONSTANTS.ARROW_DIAMETER,
    DIMENSION_LINE_CONSTANTS.ARROW_SIZE,
    scene,
    endPoint01,
    direction,
    lineMat,
  );
  arrow.parent = parent;

  const arrow2 = createArrow(
    name,
    DIMENSION_LINE_CONSTANTS.ARROW_DIAMETER,
    DIMENSION_LINE_CONSTANTS.ARROW_SIZE,
    scene,
    beginPoint01,
    direction.scale(-1),
    lineMat,
  );
  arrow2.parent = parent;

  return {
    line: line,
    arrow: [arrow, arrow2],
    label: label,
  };
};
