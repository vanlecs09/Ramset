import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { initializeDimensionLabelTexture } from './ConcreteBuilder';
import type { BaseStructureGroup } from './CircularColumnsBuilder';

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

export interface DimensionLabelNode {
  label: GUI.TextBlock;
  lineMesh: BABYLON.Mesh;
  linePosition: BABYLON.Vector3;
  offsetX: number;
  offsetY: number;
}

export class DimensionLineNode implements BaseStructureGroup {
  group: BABYLON.TransformNode;
  private meshes: BABYLON.Mesh[] = [];
  private labels: DimensionLabelNode[] = [];
  width: number;
  depth: number;
  height: number;

  constructor(
    group: BABYLON.TransformNode,
    width: number = 0,
    depth: number = 0,
    height: number = 0
  ) {
    this.group = group;
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

  getLabels(): DimensionLabelNode[] {
    return this.labels;
  }

  setLabels(labels: DimensionLabelNode[]): void {
    this.labels = labels;
  }

  addLabel(label: DimensionLabelNode): void {
    this.labels.push(label);
  }

  dispose(): void {
    // Dispose all meshes
    this.meshes.forEach(mesh => {
      mesh.dispose();
    });

    // Dispose all labels
    this.labels.forEach(labelData => {
      labelData.label.dispose();
    });

    // Dispose the transform node
    this.group.dispose();
  }
}


export const createDimensionLine = (
  name: string,
  scene: BABYLON.Scene,
  length: number,
  linePosition: BABYLON.Vector3,
  lineRotation: BABYLON.Vector3,
  arrow1Position: BABYLON.Vector3,
  arrow2Position: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  lineMat: BABYLON.Material,
  showLabel: boolean = true,
  labelValue?: number
): { meshes: BABYLON.Mesh[]; lineMesh: BABYLON.Mesh; label?: GUI.TextBlock } => {
  const lineThickness = 0.005;
  const arrowSize = 0.05;
  const arrowDiameter = 0.03;
  const connectorThickness = 0.01;
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  const meshes: BABYLON.Mesh[] = [];

  // Create dimension line
  const line = BABYLON.MeshBuilder.CreateCylinder(name + 'Line', {
    diameter: lineThickness,
    height: length,
  }, scene);
  line.position = linePosition;
  line.rotation = lineRotation;
  line.material = lineMat;
  meshes.push(line);

  // Calculate arrow rotations based on direction from arrow position to corner
  const direction1 = corner1Position.subtract(arrow1Position).normalize();
  const direction2 = corner2Position.subtract(arrow2Position).normalize();

  const arrow1RotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction1, // Reverse direction for arrow 1 pointing inward
    new BABYLON.Quaternion()
  );

  const arrow2RotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction2, // Arrow 2 pointing outward
    new BABYLON.Quaternion()
  );

  // Create arrow 1
  const arrow1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow1', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);
  arrow1.position = corner1Position;
  arrow1.rotationQuaternion = arrow1RotationQuaternion;
  arrow1.material = lineMat;
  meshes.push(arrow1);

  // Create arrow 2
  const arrow2 = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow2', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);
  arrow2.position = corner2Position;
  arrow2.rotationQuaternion = arrow2RotationQuaternion;
  arrow2.material = lineMat;
  meshes.push(arrow2);

  // Create connector 1
  const distance1 = BABYLON.Vector3.Distance(arrow1Position, corner1Position);
  const connector1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Connector1', {
    diameter: connectorThickness,
    height: distance1,
  }, scene);
  connector1.position = BABYLON.Vector3.Lerp(arrow1Position, corner1Position, 0.5);
  connector1.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction1,
    new BABYLON.Quaternion()
  );
  connector1.material = lineMat;
  meshes.push(connector1);

  // Create connector 2
  const distance2 = BABYLON.Vector3.Distance(arrow2Position, corner2Position);
  const connector2 = BABYLON.MeshBuilder.CreateCylinder(name + 'Connector2', {
    diameter: connectorThickness,
    height: distance2,
  }, scene);
  connector2.position = BABYLON.Vector3.Lerp(arrow2Position, corner2Position, 0.5);
  connector2.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    direction2,
    new BABYLON.Quaternion()
  );
  connector2.material = lineMat;
  meshes.push(connector2);

  // Create label if enabled
  let label: GUI.TextBlock | undefined;
  if (showLabel && labelValue !== undefined) {
    label = new GUI.TextBlock();
    label.text = `${labelValue.toFixed(2)}m`;
    label.color = 'black';
    label.fontSize = 20;
    label.fontWeight = 'bold';
  }

  return { meshes, lineMesh: line, label };
};

/**
 * Helper function to create a complete dimension line system with labels
 * Reduces code duplication when creating multiple dimension lines
 * Returns label data for tracking and alignment
 */
export const createDimensionWithLabel = (
  dimensionName: string,
  scene: BABYLON.Scene,
  length: number,
  linePosition: BABYLON.Vector3,
  lineRotation: BABYLON.Vector3,
  arrow1Position: BABYLON.Vector3,
  arrow2Position: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  material: BABYLON.Material,
  dimensionValue: number,
  parentGroup: BABYLON.TransformNode,
  advancedTexture: GUI.AdvancedDynamicTexture,
  labelOffsetX: number = 0,
  labelOffsetY: number = 0
): DimensionLabelNode | null => {
  const result = createDimensionLine(
    dimensionName,
    scene,
    length,
    linePosition,
    lineRotation,
    arrow1Position,
    arrow2Position,
    corner1Position,
    corner2Position,
    material,
    true,
    dimensionValue
  );

  // Parent all meshes to the group
  result.meshes.forEach(mesh => {
    mesh.parent = parentGroup;
  });

  // Add label if created and link it to the dimension line mesh using AdvancedDynamicTexture
  if (result.label) {
    advancedTexture.addControl(result.label);
    result.label.linkWithMesh(result.lineMesh);

    // Apply offsets
    result.label.linkOffsetX = labelOffsetX;
    result.label.linkOffsetY = labelOffsetY;

    // Return label data with position and offset information
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
 * Creates a torque visualization with incomplete torus and directional line arrow
 * @param name - Name for the torque visualization
 * @param scene - The Babylon scene
 * @param centerPosition - Center position where the incomplete torus is built
 * @param arrowDirection - Direction vector for the line arrow (will be normalized)
 * @param torusRadius - Radius of the incomplete torus (default: 0.06)
 * @param tubeRadius - Thickness of the torus tube (default: 0.003)
 * @param arcAngle - Arc angle in degrees (default: 270)
 * @param lineOffset - Distance of the line arrow from torus center (default: 0.1)
 * @param torusMaterial - Material for the torus and arrow
 * @returns Object containing all torque visualization meshes
 */
export const createTorqueVisualization = (
  name: string,
  scene: BABYLON.Scene,
  centerPosition: BABYLON.Vector3,
  arrowDirection: BABYLON.Vector3,
  torusRadius: number = 0.06,
  tubeRadius: number = 0.003,
  arcAngle: number = 270,
  lineOffset: number = 0.1,
  lineLegnth: number = 0.2,
  torusMaterial: BABYLON.Material
) => {
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  const meshes: BABYLON.Mesh[] = [];

  // Normalize arrow direction
  const normalizedDirection = arrowDirection.normalize();

  // Create perpendicular vectors to form the plane perpendicular to arrow direction
  // For a direction vector, we need two perpendicular vectors in the plane perpendicular to it
  let perpendicular1: BABYLON.Vector3;
  let perpendicular2: BABYLON.Vector3;

  // Find two perpendicular vectors to the direction
  if (Math.abs(normalizedDirection.x) < 0.9) {
    perpendicular1 = BABYLON.Vector3.Cross(normalizedDirection, new BABYLON.Vector3(1, 0, 0)).normalize();
  } else {
    perpendicular1 = BABYLON.Vector3.Cross(normalizedDirection, new BABYLON.Vector3(0, 1, 0)).normalize();
  }
  perpendicular2 = BABYLON.Vector3.Cross(normalizedDirection, perpendicular1).normalize();

  // Convert arc angle from degrees to radians
  const arcRadians = (arcAngle / 180) * Math.PI;
  const segments = 60;

  // Create the arc path in the plane perpendicular to arrow direction
  const path: BABYLON.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * arcRadians;
    const y = torusRadius * Math.cos(angle);
    const z = torusRadius * Math.sin(angle);

    // Build point in the perpendicular plane
    const point = centerPosition
      .add(perpendicular1.scale(y))
      .add(perpendicular2.scale(z));

    path.push(point);
  }

  // Create incomplete torus as a tube along the path
  const torus = BABYLON.MeshBuilder.CreateTube(name + 'IncompleteTorus', {
    path: path,
    radius: tubeRadius,
    tessellation: 16,
    cap: BABYLON.Mesh.CAP_ALL
  }, scene);
  torus.material = torusMaterial;
  meshes.push(torus);

  // Add arrow at the end of the incomplete torus
  const endAngle = arcRadians;
  const endY = torusRadius * Math.cos(endAngle);
  const endZ = torusRadius * Math.sin(endAngle);

  // Calculate tangent direction for arrow orientation (perpendicular to radius in the plane)
  const tangentAngle = endAngle + Math.PI / 2;
  const tangentDirection = perpendicular1
    .scale(Math.cos(tangentAngle))
    .add(perpendicular2.scale(Math.sin(tangentAngle)));

  const arrowSize = 0.15;
  const arrowDiameter = 0.15;

  const torusArrow = BABYLON.MeshBuilder.CreateCylinder(name + 'TorusArrow', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize
  }, scene);

  const torusArrowPosition = centerPosition
    .add(perpendicular1.scale(endY))
    .add(perpendicular2.scale(endZ));

  torusArrow.position = torusArrowPosition;

  // Align arrow with tangent direction using quaternion
  const torusArrowRotation = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    tangentDirection,
    new BABYLON.Quaternion()
  );
  torusArrow.rotationQuaternion = torusArrowRotation;
  torusArrow.material = torusMaterial;
  meshes.push(torusArrow);

  // Create line arrow extending perpendicular to the torus (along arrow direction)
  const lineArrowStart = centerPosition.add(normalizedDirection.scale(lineOffset));
  const lineArrowEnd = lineArrowStart.add(normalizedDirection.scale(lineLegnth));

  const lineLength = BABYLON.Vector3.Distance(lineArrowStart, lineArrowEnd);
  const lineArrow = BABYLON.MeshBuilder.CreateCylinder(name + 'LineArrow', {
    diameter: 0.03,
    height: lineLength
  }, scene);

  lineArrow.position = BABYLON.Vector3.Lerp(lineArrowStart, lineArrowEnd, 0.5);

  // Align line with direction using quaternion
  const lineRotation = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    normalizedDirection,
    new BABYLON.Quaternion()
  );
  lineArrow.rotationQuaternion = lineRotation;
  lineArrow.material = torusMaterial;
  meshes.push(lineArrow);

  // Add arrow head at the end of line arrow
  const arrowHeadSize = 0.15;
  const arrowHeadDiameter = 0.08;

  const lineArrowHead = BABYLON.MeshBuilder.CreateCylinder(name + 'LineArrowHead', {
    diameterTop: 0,
    diameterBottom: arrowHeadDiameter,
    height: arrowHeadSize
  }, scene);

  lineArrowHead.position = lineArrowEnd;
  const arrowHeadRotation = BABYLON.Quaternion.FromUnitVectorsToRef(
    yAxis,
    normalizedDirection,
    new BABYLON.Quaternion()
  );
  lineArrowHead.rotationQuaternion = arrowHeadRotation;
  lineArrowHead.material = torusMaterial;
  meshes.push(lineArrowHead);

  // Add label to the torus using singleton texture
  const advancedTexture = initializeDimensionLabelTexture();

  const torqueLabel = new GUI.TextBlock();
  torqueLabel.text = '100';
  torqueLabel.color = 'black';
  torqueLabel.fontSize = 20;
  torqueLabel.fontWeight = 'bold';
  // torqueLabel.textWrapping = true;
  advancedTexture.addControl(torqueLabel);
  torqueLabel.linkWithMesh(lineArrowHead);
  torqueLabel.linkOffsetY = -10;
  torqueLabel.linkOffsetX = 0;

  return {
    group: new BABYLON.TransformNode(name + 'Group', scene),
    meshes: meshes,
    incompleteTorus: torus,
    torusArrow: torusArrow,
    lineArrow: lineArrow,
    lineArrowHead: lineArrowHead,
    label: torqueLabel
  };
};
