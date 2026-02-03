import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { getDimensionLabelTexture } from './Material';
import { BaseNodeImpl } from './BaseNode';

/**
 * Default values for axis visualization
 */
export const AXIS_CONSTANTS = {
  AXIS_RADIUS: 0.002,
  ARROW_SIZE: 0.02,
  LABEL_FONT_SIZE: 24,
  LABEL_OFFSET_X: 20,
  LABEL_OFFSET_Y: 0,
  DEFAULT_AXIS_LENGTH: 0.2,
} as const;

/**
 * Standard axis colors
 */
export const AXIS_COLORS = {
  X: new BABYLON.Color3(1, 0, 0), // Red
  Y: new BABYLON.Color3(0, 1, 0), // Green
  Z: new BABYLON.Color3(0, 0, 1), // Blue
} as const;

/**
 * Data structure representing an axis label in 3D space.
 * Tracks the relationship between a GUI label and its associated axis arrow mesh.
 */
export interface AxisLabelNode {
  label: GUI.TextBlock;
  arrowMesh: BABYLON.Mesh;
  axisName: string;
}

/**
 * Manages unit axis visualization with X, Y, Z arrows and optional labels.
 */
export class UnitAxisNode extends BaseNodeImpl {
  private meshes: BABYLON.Mesh[] = [];
  private labels: AxisLabelNode[] = [];

  constructor(group: BABYLON.TransformNode) {
    super(group);
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

  getLabels(): AxisLabelNode[] {
    return this.labels;
  }

  setLabels(labels: AxisLabelNode[]): void {
    this.labels = labels;
  }

  addLabel(label: AxisLabelNode): void {
    this.labels.push(label);
  }

  dispose(): void {
    this.meshes.forEach(mesh => mesh.dispose());
    this.labels.forEach(labelNode => labelNode.label.dispose());
    super.dispose();
    this.group.dispose();
  }
}

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
  color: BABYLON.Color3,
): BABYLON.Mesh => {
  const line = BABYLON.MeshBuilder.CreateTube(
    name,
    {
      path: [start, end],
      radius: radius,
    },
    scene,
  );

  const material = new BABYLON.StandardMaterial(name + 'Material', scene);
  material.diffuseColor = color;
  line.material = material;

  return line;
};

/**
 * Helper function to create a single arrow head cone.
 * Used by createUnitAxes to place arrows at axis ends.
 */
const createArrow = (
  name: string,
  arrowDiameter: number,
  arrowSize: number,
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  direction: BABYLON.Vector3,
  material: BABYLON.Material,
): BABYLON.Mesh => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);

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
 * Creates an arrow head for an axis.
 * @private
 */
const createAxisArrow = (
  name: string,
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  direction: BABYLON.Vector3,
  color: BABYLON.Color3,
): BABYLON.Mesh => {
  const arrowMaterial = new BABYLON.StandardMaterial(
    name + 'ArrowMaterial',
    scene,
  );
  arrowMaterial.diffuseColor = color;

  return createArrow(
    name,
    AXIS_CONSTANTS.ARROW_SIZE,
    AXIS_CONSTANTS.ARROW_SIZE * 1.5,
    scene,
    position,
    direction,
    arrowMaterial,
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
  texture: GUI.AdvancedDynamicTexture,
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
    axisName: labelText,
  };
};

/**
 * Creates a visual helper displaying X, Y, Z coordinate axes with arrows and optional labels.
 * Each axis is rendered as a colored line with an arrow head and text label.
 * Returns a UnitAxisNode managing all axis meshes and labels.
 */
export const createUnitAxes = (
  scene: BABYLON.Scene,
  parent: BABYLON.TransformNode,
  origin: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  xDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0),
  yDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0),
  zDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1),
  axisLength: number = AXIS_CONSTANTS.DEFAULT_AXIS_LENGTH,
  showLabels: boolean = false,
  advancedTexture?: GUI.AdvancedDynamicTexture,
): UnitAxisNode => {
  const axisGroup = new BABYLON.TransformNode('unitAxes', scene);
  axisGroup.parent = parent;
  const axisNode = new UnitAxisNode(axisGroup);

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
    { direction: zDir, color: AXIS_COLORS.Z, name: 'Z', baseName: 'zAxis' },
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
      axis.color,
    );
    meshes.push(line);

    // Create arrow at end of axis
    const arrowPos = origin.add(
      axis.direction.scale(axisLength + AXIS_CONSTANTS.ARROW_SIZE),
    );
    const arrow = createAxisArrow(
      axis.baseName,
      scene,
      arrowPos,
      axis.direction,
      axis.color,
    );
    meshes.push(arrow);
    arrow.parent = axisGroup;
    line.parent = axisGroup;

    // Create label
    if (showLabels) {
      const label = createAxisLabelNode(
        arrow,
        axis.name,
        axis.color,
        axisTexture,
      );
      if (label) axisLabels.push(label);
    }
  });

  axisNode.setMeshes(meshes);
  axisNode.setLabels(axisLabels);

  return axisNode;
};
