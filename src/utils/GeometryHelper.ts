import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { getDimensionLabelTexture } from './ConcreteBuilder';
import { BaseNodeImpl } from './BaseNode';

// ==================== Constants ====================

/** Default values for dimension line rendering */
export const DIMENSION_LINE_CONSTANTS = {
  LINE_THICKNESS: 0.005,
  ARROW_SIZE: 0.02,
  ARROW_DIAMETER: 0.02,
  LABEL_FONT_SIZE: 20,
  LABEL_DECIMAL_PLACES: 2,
} as const;

/** Default values for axis visualization */
export const AXIS_CONSTANTS = {
  AXIS_RADIUS: 0.005,
  ARROW_SIZE: 0.03,
  LABEL_FONT_SIZE: 24,
  LABEL_OFFSET_X: 20,
  LABEL_OFFSET_Y: 0,
  DEFAULT_AXIS_LENGTH: 0.2,
} as const;


/** Standard axis colors */
export const AXIS_COLORS = {
  X: new BABYLON.Color3(1, 0, 0),   // Red
  Y: new BABYLON.Color3(0, 1, 0),   // Green
  Z: new BABYLON.Color3(0, 0, 1),   // Blue
} as const;

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

/**
 * Data structure representing an axis label in 3D space.
 * Tracks the relationship between a GUI label and its associated axis arrow mesh.
 */
export interface AxisLabelNode {
  label: GUI.TextBlock;
  arrowMesh: BABYLON.Mesh;
  axisName: string;
}

export class DimensionLineNode extends BaseNodeImpl {
  private meshes: BABYLON.Mesh[] = [];
  private labels: GUI.TextBlock[] = [];
  width: number;
  depth: number;
  height: number;

  constructor(
    group: BABYLON.TransformNode,
    width: number = 0,
    depth: number = 0,
    height: number = 0
  ) {
    super(group);
    this.width = width;
    this.depth = depth;
    this.height = height;
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
  advancedTexture?: GUI.AdvancedDynamicTexture
): { meshes: BABYLON.Mesh[]; lineMesh: BABYLON.Mesh; label?: GUI.TextBlock } => {
  const texture = advancedTexture || getDimensionLabelTexture();
  const meshes: BABYLON.Mesh[] = [];

  const line = createLine(
    beginPoint01,
    beginPoint02,
    name,
    DIMENSION_LINE_CONSTANTS.LINE_THICKNESS,
    scene,
    lineMat
  );
  meshes.push(line);
  // Create main dimension line
  const lineArrow1 = createLineArrow(beginPoint01, endPoint01, name, scene, lineMat);
  meshes.push(lineArrow1.line);
  meshes.push(lineArrow1.arrow);

  // Create connector lines from dimension line to measurement points
  const lineArrow2 = createLineArrow(beginPoint02, endPoint02, name, scene, lineMat);
  meshes.push(lineArrow2.line);
  meshes.push(lineArrow2.arrow);

  // Create optional label
  let label: GUI.TextBlock | undefined;
  if (showLabel && labelValue !== undefined) {
    label = new GUI.TextBlock();
    label.text = `${Number(labelValue).toFixed(2)}m`;
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
  parentGroup: BABYLON.TransformNode,
  advancedTexture?: GUI.AdvancedDynamicTexture,
  labelOffsetX: number = 0,
  labelOffsetY: number = 0,
  showLabel: boolean = true
): DimensionLabelNode | null => {
  const linePosition = BABYLON.Vector3.Lerp(arrow1Position, arrow2Position, 0.5);
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
    texture
  );

  // Parent all meshes to the group
  result.meshes.forEach(mesh => {
    mesh.parent = parentGroup;
  });

  // Create label data with positioning info
  if (result.label) {
    result.label.linkWithMesh(result.lineMesh);
    result.label.linkOffsetX = labelOffsetX;
    result.label.linkOffsetY = labelOffsetY;

    return {
      label: result.label,
      lineMesh: result.lineMesh,
      linePosition: linePosition.clone(),
      offsetX: labelOffsetX,
      offsetY: labelOffsetY
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
  material: BABYLON.Material
): BABYLON.Mesh => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  // const direction = position.subtract(position).normalize(); // Results in zero vector

  const quaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction,
    new BABYLON.Quaternion()
  );

  const arrow = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow1', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);

  arrow.position = position;
  arrow.rotationQuaternion = quaternion;
  arrow.material = material;

  return arrow;
};


/**
 * Creates a visual helper displaying X, Y, Z coordinate axes with arrows and labels.
 * Each axis is rendered as a colored line with an arrow head and text label.
 */
export const createAxesBasic = (
  scene: BABYLON.Scene,
  origin: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  xDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0),
  yDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0),
  zDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1),
  axisLength: number = AXIS_CONSTANTS.DEFAULT_AXIS_LENGTH,
  showLabels: boolean = true,
  advancedTexture?: GUI.AdvancedDynamicTexture
): { meshes: BABYLON.Mesh[]; labels: AxisLabelNode[] } => {
  const meshes: BABYLON.Mesh[] = [];
  const axisLabels: AxisLabelNode[] = [];
  const axisTexture = advancedTexture || getDimensionLabelTexture();

  // Normalize direction vectors
  const xDir = BABYLON.Vector3.Normalize(xDirection);
  const yDir = BABYLON.Vector3.Normalize(yDirection);
  const zDir = BABYLON.Vector3.Normalize(zDirection);

  // Create axes: X (Red), Y (Green), Z (Blue)
  const axes = [
    { direction: xDir, color: AXIS_COLORS.X, name: 'X', baseName: 'xAxis' },
    { direction: yDir, color: AXIS_COLORS.Y, name: 'Y', baseName: 'yAxis' },
    { direction: zDir, color: AXIS_COLORS.Z, name: 'Z', baseName: 'zAxis' }
  ];

  axes.forEach(axis => {
    // Create axis line
    const end = origin.add(axis.direction.scale(axisLength));
    const line = createAxisLine(
      axis.baseName,
      scene,
      origin,
      end,
      AXIS_CONSTANTS.AXIS_RADIUS,
      axis.color
    );
    meshes.push(line);

    // Create arrow at end of axis
    const arrowPos = origin.add(axis.direction.scale(axisLength + AXIS_CONSTANTS.ARROW_SIZE));
    const arrow = createAxisArrow(
      axis.baseName,
      scene,
      arrowPos,
      axis.direction,
      axis.color
    );
    meshes.push(arrow);

    // Create label
    if (showLabels) {
      const label = createAxisLabelNode(
        arrow,
        axis.name,
        axis.color,
        axisTexture
      );
      if (label) axisLabels.push(label);
    }
  });

  return { meshes, labels: axisLabels };
};

/**
 * Creates a colored line for an axis.
 * @private
 */
const createAxisLine = (
  name: string,
  scene: BABYLON.Scene,
  start: BABYLON.Vector3,
  end: BABYLON.Vector3,
  radius: number,
  color: BABYLON.Color3
): BABYLON.Mesh => {
  const line = BABYLON.MeshBuilder.CreateTube(name, {
    path: [start, end],
    radius: radius,
  }, scene);

  const material = new BABYLON.StandardMaterial(name + 'Material', scene);
  material.emissiveColor = color;
  line.material = material;

  return line;
};

/**
 * Creates an arrow head for an axis.
 * @private
 */
const createAxisArrow = (
  name: string,
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  direction: BABYLON.Vector3,
  color: BABYLON.Color3
): BABYLON.Mesh => {
  const arrowMaterial = new BABYLON.StandardMaterial(name + 'ArrowMaterial', scene);
  arrowMaterial.emissiveColor = color;

  return createArrow(
    name,
    AXIS_CONSTANTS.ARROW_SIZE,
    AXIS_CONSTANTS.ARROW_SIZE * 1.5,
    scene,
    position,
    direction,
    arrowMaterial
  );
};

/**
 * Creates a GUI label for an axis.
 * @private
 */
const createAxisLabelNode = (
  arrowMesh: BABYLON.Mesh,
  labelText: string,
  color: BABYLON.Color3,
  texture: GUI.AdvancedDynamicTexture
): AxisLabelNode | null => {
  const label = new GUI.TextBlock();
  label.text = labelText;
  label.fontSize = AXIS_CONSTANTS.LABEL_FONT_SIZE;
  label.color = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;

  texture.addControl(label);
  label.linkWithMesh(arrowMesh);
  label.linkOffsetX = AXIS_CONSTANTS.LABEL_OFFSET_X;
  label.linkOffsetY = AXIS_CONSTANTS.LABEL_OFFSET_Y;

  return {
    label: label,
    arrowMesh: arrowMesh,
    axisName: labelText
  };
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
  lineMat: BABYLON.Material
): BABYLON.Mesh => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  const distance = BABYLON.Vector3.Distance(beginPoint, endPoint);
  const direction = endPoint.subtract(beginPoint).normalize();

  const line = BABYLON.MeshBuilder.CreateCylinder(name + '_line', {
    diameter: lineThickness,
    height: distance,
  }, scene);

  line.position = BABYLON.Vector3.Lerp(beginPoint, endPoint, 0.5);
  line.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction,
    new BABYLON.Quaternion()
  );
  line.material = lineMat;

  return line;
};


export const createLineArrow = (beginPoint01: BABYLON.Vector3,
  endPoint01: BABYLON.Vector3,
  name: string, scene: BABYLON.Scene,
  lineMat: BABYLON.Material,
) => {
  const line = createLine(
    beginPoint01,
    endPoint01,
    name,
    DIMENSION_LINE_CONSTANTS.LINE_THICKNESS,
    scene,
    lineMat
  );
  const direction = endPoint01.subtract(beginPoint01).normalize();
  // Create arrows at measurement points
  const arrow = createArrow(
    name,
    DIMENSION_LINE_CONSTANTS.ARROW_DIAMETER,
    DIMENSION_LINE_CONSTANTS.ARROW_SIZE,
    scene,
    endPoint01,
    direction,
    lineMat
  );

  return {
    line: line,
    arrow: arrow
  };
}

