import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { getDimensionLabelTexture } from './ConcreteBuilder';
import { BaseNodeImpl, BaseStructNodeImpl } from './BaseNode';

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
 * @interface DimensionLabelNode
 * @property {GUI.TextBlock} label - The GUI text block displaying the dimension value
 * @property {BABYLON.Mesh} lineMesh - The 3D line mesh the label is annotating
 * @property {BABYLON.Vector3} linePosition - The position of the dimension line in world space
 * @property {number} offsetX - Horizontal offset for label positioning (in pixels)
 * @property {number} offsetY - Vertical offset for label positioning (in pixels)
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
 * @interface AxisLabelNode
 * @property {GUI.TextBlock} label - The GUI text block displaying the axis name (X, Y, or Z)
 * @property {BABYLON.Mesh} arrowMesh - The 3D arrow mesh the label is associated with
 * @property {string} axisName - The axis identifier ('X', 'Y', or 'Z')
 */
export interface AxisLabelNode {
  label: GUI.TextBlock;
  arrowMesh: BABYLON.Mesh;
  axisName: string;
}

/**
 * Container class for managing all dimension visualization elements.
 * Implements BaseStructureGroup to integrate with the structure hierarchy system.
 * Manages dimension lines, arrows, connectors, and associated GUI labels.
 * Provides unified disposal of all related meshes and UI elements.
 * 
 * @class DimensionLineNode
 * @implements {BaseStructureGroup}
 * @property {BABYLON.TransformNode} group - The parent transform node containing all dimension meshes
 * @property {number} width - Width dimension value in scene units
 * @property {number} depth - Depth dimension value in scene units
 * @property {number} height - Height dimension value in scene units
 * 
 * @example
 * // Create a dimension line node for a 5x3x2 unit object
 * const dimensionNode = new DimensionLineNode(transformGroup, 5, 3, 2);
 * dimensionNode.addMesh(arrowMesh);
 * dimensionNode.addLabel(labelData);
 * 
 * // Later, dispose all resources
 * dimensionNode.dispose();
 */
export class DimensionLineNode extends BaseNodeImpl {
  private meshes: BABYLON.Mesh[] = [];
  private labels: GUI.TextBlock[] = [];
  width: number;
  depth: number;
  height: number;

  /**
   * Creates a new DimensionLineNode.
   * @param {BABYLON.TransformNode} group - Parent transform node for all dimension meshes
   * @param {number} [width=0] - Width dimension in scene units
   * @param {number} [depth=0] - Depth dimension in scene units
   * @param {number} [height=0] - Height dimension in scene units
   */
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

  /**
   * Returns all mesh elements in this dimension line.
   * @returns {BABYLON.Mesh[]} Array of dimension meshes (lines, arrows, connectors)
   */
  getMeshes(): BABYLON.Mesh[] {
    return this.meshes;
  }

  /**
   * Sets all meshes for this dimension line, replacing any existing meshes.
   * @param {BABYLON.Mesh[]} meshes - Array of meshes to manage
   */
  setMeshes(meshes: BABYLON.Mesh[]): void {
    this.meshes = meshes;
  }

  /**
   * Adds a single mesh to this dimension line's mesh collection.
   * @param {BABYLON.Mesh} mesh - Mesh to add
   */
  addMesh(mesh: BABYLON.Mesh): void {
    this.meshes.push(mesh);
  }

  /**
 * Returns all dimension labels in this dimension line.
 * @returns {GUI.TextBlock[]} Array of label nodes
 */
  getLabels(): GUI.TextBlock[] {
    return this.labels;
  }

  /**
   * Sets all labels for this dimension line, replacing any existing labels.
   * @param {GUI.TextBlock[]} labels - Array of label nodes to manage
   */
  setLabels(labels: GUI.TextBlock[]): void {
    this.labels = labels;
  }

  /**
   * Adds a single label to this dimension line's label collection.
   * Convenience method that wraps setLabels for adding individual labels.
   * @param {GUI.TextBlock} label - Label node to add
   */
  addLabel(label: GUI.TextBlock): void {
    // const currentLabels = this.getLabels();
    this.labels.push(label);
    // this.setLabels(currentLabels);
  }

  /**
   * Disposes all resources managed by this dimension line node.
   * Cleans up all meshes (lines, arrows, connectors) and GUI labels.
   * Also disposes the parent transform node.
   * Should be called when the dimension is no longer needed to free GPU memory.
   */
  dispose(): void {
    // Dispose all meshes
    this.meshes.forEach(mesh => {
      mesh.dispose();
    });

    this.labels.forEach(labelData => {
      labelData.dispose();
    });

    // Call parent to dispose axis meshes and labels
    super.dispose();
    this.group.dispose();
  }
}

/**
 * Container class for managing axis visualization elements.
 * Manages X, Y, Z axis lines, arrows, and associated GUI labels.
 * Extends BaseNodeImpl to integrate with the structure hierarchy system.
 * Provides unified caching and disposal of all axis resources.
 * 
 * @class AxisLineNode
 * @extends {BaseStructNodeImpl}
 * @property {BABYLON.TransformNode} group - The parent transform node containing all axis meshes
 * 
 * @example
 * // Create an axis line node
 * const axisNode = new AxisLineNode(transformGroup);
 * axisNode.setAxisMeshes(axisMeshes);
 * axisNode.setLabels(axisLabels);
 * 
 * // Later, dispose all resources
 * axisNode.dispose();
 */
export class AxisLineNode extends BaseNodeImpl {
  /**
   * Creates a new AxisLineNode.
   * @param {BABYLON.TransformNode} group - Parent transform node for all axis meshes
   */
  constructor(group: BABYLON.TransformNode) {
    super(group);
  }

  /**
   * Disposes all resources managed by this axis line node.
   * Cleans up all axis meshes, arrows, and GUI labels.
   * Also disposes the parent transform node.
   * Should be called when the axes are no longer needed to free GPU memory.
   */
  dispose(): void {
    // Call parent to dispose axis meshes and labels
    super.dispose();
    this.group.dispose();
  }
}


/**
 * Creates a dimension line with arrows, connectors, and optional label.
 * Constructs a complete dimension visualization showing distance between two points,
 * with arrow heads pointing to the measured corners and connector lines between them.
 * 
 * @function createDimensionLine
 * @param {string} name - Base name for generated meshes (appended with suffixes)
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {BABYLON.Vector3} lineRotation - Rotation vector for the main dimension line
 * @param {BABYLON.Vector3} arrow1Position - Position of first arrow head
 * @param {BABYLON.Vector3} arrow2Position - Position of second arrow head
 * @param {BABYLON.Vector3} corner1Position - Position of first measured point
 * @param {BABYLON.Vector3} corner2Position - Position of second measured point
 * @param {BABYLON.Material} lineMat - Material for dimension line and arrows
 * @param {boolean} [showLabel=true] - Whether to show dimension label text
 * @param {number} [labelValue] - Numerical value to display in label
 * @param {GUI.AdvancedDynamicTexture} [advancedTexture] - Optional shared GUI texture for labels. If not provided, uses shared global texture
 * 
 * @returns {Object} Object containing generated meshes and label
 * @returns {BABYLON.Mesh[]} .meshes - Array of all created meshes (line, arrows, connectors)
 * @returns {BABYLON.Mesh} .lineMesh - The main dimension line cylinder
 * @returns {GUI.TextBlock} [.label] - Optional GUI label if showLabel is true
 * 
 * @example
 * const material = new BABYLON.StandardMaterial('dimMat', scene);
 * material.emissiveColor = BABYLON.Color3.White();
 * const result = createDimensionLine(
 *   'width',
 *   scene,
 *   new BABYLON.Vector3(0, 0, 0),
 *   new BABYLON.Vector3(-5, 1, 0),
 *   new BABYLON.Vector3(5, 1, 0),
 *   new BABYLON.Vector3(-5, 0, 0),
 *   new BABYLON.Vector3(5, 0, 0),
 *   material,
 *   true,
 *   10.5
 * );
 * console.log(`Created dimension with ${result.meshes.length} meshes`);
 */
export const createDimensionLine = (
  name: string,
  scene: BABYLON.Scene,
  lineRotation: BABYLON.Vector3,
  arrow1Position: BABYLON.Vector3,
  arrow2Position: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  lineMat: BABYLON.Material,
  showLabel: boolean = true,
  labelValue?: number,
  advancedTexture?: GUI.AdvancedDynamicTexture
): { meshes: BABYLON.Mesh[]; lineMesh: BABYLON.Mesh; label?: GUI.TextBlock } => {
  // Use provided texture or get shared texture
  const texture = advancedTexture || getDimensionLabelTexture();
  const lineThickness = 0.005;
  const arrowSize = 0.02;
  const arrowDiameter = 0.02;
  // const connectorThickness = 0.005;
  const yAxis = new BABYLON.Vector3(0, 1, 0);
  const meshes: BABYLON.Mesh[] = [];

  const lineLength = BABYLON.Vector3.Distance(arrow1Position, arrow2Position);
  const linePositiont = BABYLON.Vector3.Lerp(arrow1Position, arrow2Position, 0.5);
  // Create dimension line
  const line = BABYLON.MeshBuilder.CreateCylinder(name + 'Line', {
    height: lineLength,
    diameter: lineThickness,
  }, scene);
  line.position = linePositiont;
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
  const arrow1 = createArrow(name, arrowDiameter, arrowSize, scene, corner1Position, arrow1RotationQuaternion, lineMat);
  meshes.push(arrow1);

  // Create arrow 2
  const arrow2 = createArrow(name, arrowDiameter, arrowSize, scene, corner2Position, arrow2RotationQuaternion, lineMat);
  meshes.push(arrow2);

  // Create connector 1
  const distance1 = BABYLON.Vector3.Distance(arrow1Position, corner1Position);
  const connector1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Connector1', {
    diameter: lineThickness,
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
    diameter: lineThickness,
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
    // label.fontWeight = 'bold';
    texture.addControl(label);
  }

  return { meshes, lineMesh: line, label };
};

/**
 * Creates a complete dimension line system with integrated GUI labels.
 * Combines dimension line creation with label management and mesh parenting.
 * Reduces code duplication when creating multiple dimension lines with labels.
 * 
 * @function createDimensionWithLabel
 * @param {string} dimensionName - Name identifier for the dimension (e.g., 'width', 'depth')
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {BABYLON.Vector3} lineRotation - Rotation vector for the dimension line
 * @param {BABYLON.Vector3} arrow1Position - Position of first arrow head
 * @param {BABYLON.Vector3} arrow2Position - Position of second arrow head
 * @param {BABYLON.Vector3} corner1Position - Position of first measured point
 * @param {BABYLON.Vector3} corner2Position - Position of second measured point
 * @param {BABYLON.Material} material - Material for dimension line and arrows
 * @param {number} dimensionValue - Numerical value to display in label
 * @param {BABYLON.TransformNode} parentGroup - Transform node to parent all dimension meshes to
 * @param {GUI.AdvancedDynamicTexture} [advancedTexture] - Optional shared GUI texture for label rendering. If not provided, uses shared global texture
 * @param {number} [labelOffsetX=0] - Horizontal offset for label positioning (pixels)
 * @param {number} [labelOffsetY=0] - Vertical offset for label positioning (pixels)
 * @param {boolean} [showLabel=true] - Whether to show the dimension label
 * 
 * @returns {DimensionLabelNode|null} Complete dimension label data with positioning info, or null if label creation fails
 * @returns {GUI.TextBlock} .label - The GUI text block displaying dimension value
 * @returns {BABYLON.Mesh} .lineMesh - The main dimension line mesh
 * @returns {BABYLON.Vector3} .linePosition - Position of dimension line in world space
 * @returns {number} .offsetX - Horizontal label offset in pixels
 * @returns {number} .offsetY - Vertical label offset in pixels
 * 
 * @example
 * const labelData = createDimensionWithLabel(
 *   'width',
 *   scene,
 *   new BABYLON.Vector3(0, 0, 0),
 *   new BABYLON.Vector3(-5, 1, 0),
 *   new BABYLON.Vector3(5, 1, 0),
 *   new BABYLON.Vector3(-5, 0, 0),
 *   new BABYLON.Vector3(5, 0, 0),
 *   dimensionMaterial,
 *   10.5,
 *   dimensionGroup,
 *   undefined,  // uses shared texture
 *   0,
 *   30,
 *   true        // show label
 * );
 * if (labelData) {
 *   dimensions.push(labelData);
 * }
 */
export const createDimensionWithLabel = (
  dimensionName: string,
  scene: BABYLON.Scene,
  lineRotation: BABYLON.Vector3,
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
  let linePosition = BABYLON.Vector3.Lerp(arrow1Position, arrow2Position, 0.5);
  const texture = advancedTexture || getDimensionLabelTexture();
  const result = createDimensionLine(
    dimensionName,
    scene,
    lineRotation,
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

  // Add label if created and link it to the dimension line mesh using AdvancedDynamicTexture
  if (result.label) {
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
 * Creates a torque visualization consisting of an incomplete torus arc and directional arrow.
 * The incomplete torus lies in a plane perpendicular to the arrow direction vector,
 * creating a visual representation of rotational force/torque around the arrow axis.
 * 
 * @function createTorqueVisualization
 * @param {string} name - Base name for generated meshes
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {BABYLON.Vector3} centerPosition - Center position where the torus is created
 * @param {BABYLON.Vector3} arrowDirection - Direction vector for torque axis (will be normalized)
 * @param {number} [torusRadius=0.06] - Radius of the incomplete torus in scene units
 * @param {number} [tubeRadius=0.003] - Thickness of the torus tube in scene units
 * @param {number} [arcAngle=270] - Arc angle in degrees (e.g., 270 for 3/4 circle, 180 for half circle)
 * @param {number} [lineOffset=0.1] - Distance of the directional arrow from torus center in scene units
 * @param {number} [lineLegnth=0.2] - Length of the directional line in scene units
 * @param {BABYLON.Material} torusMaterial - Material for torus and arrow (typically white/bright)
 * 
 * @returns {Object} Torque visualization meshes
 * @returns {BABYLON.Mesh[]} .meshes - All created meshes (torus line, arrow head, directional line)
 * @returns {BABYLON.Mesh} .torusLineMesh - The incomplete torus line mesh
 * @returns {BABYLON.Mesh} .arrowMesh - The arrow head at the end of directional line
 * 
 * @example
 * const torqueMaterial = new BABYLON.StandardMaterial('torqueMat', scene);
 * torqueMaterial.emissiveColor = BABYLON.Color3.Yellow();
 * const torque = createTorqueVisualization(
 *   'torque1',
 *   scene,
 *   new BABYLON.Vector3(0, 0, 0),
 *   new BABYLON.Vector3(1, 0, 0),  // Torque around X axis
 *   0.06,  // torus radius
 *   0.003, // torus thickness
 *   270,   // 3/4 circle
 *   0.1,   // line offset
 *   0.2,   // line length
 *   torqueMaterial
 * );
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

  const arrowSize = 0.05;
  const arrowDiameter = 0.05;

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
  const arrowHeadSize = 0.05;
  const arrowHeadDiameter = 0.04;

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

  // Add label to the torus using shared texture
  const advancedTexture = getDimensionLabelTexture();

  const torqueLabel = new GUI.TextBlock();
  torqueLabel.text = '100';
  torqueLabel.color = 'black';
  torqueLabel.fontSize = 20;
  // torqueLabel.fontWeight = 
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


/**
 * Helper function to create a single arrow head cone.
 * Used by createDimensionLine to place arrows at dimension endpoints.
 * 
 * @function createArrow
 * @param {string} name - Base name for the arrow mesh
 * @param {number} arrowDiameter - Diameter of the arrow cone base in scene units
 * @param {number} arrowSize - Height of the arrow cone in scene units
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {BABYLON.Vector3} corner1Position - Position where the arrow point will be placed
 * @param {BABYLON.Quaternion} arrow1RotationQuaternion - Quaternion rotation for arrow orientation
 * @param {BABYLON.Material} material - Material for the arrow (color/appearance)
 * 
 * @returns {BABYLON.Mesh} The created arrow cone mesh
 * 
 * @example
 * const arrowMat = new BABYLON.StandardMaterial('arrowMat', scene);
 * arrowMat.emissiveColor = BABYLON.Color3.White();
 * const arrowQuat = BABYLON.Quaternion.FromUnitVectorsToRef(
 *   new BABYLON.Vector3(0, 1, 0),
 *   new BABYLON.Vector3(1, 0, 0),
 *   new BABYLON.Quaternion()
 * );
 * const arrow = createArrow(
 *   'dimArrow',
 *   0.02,  // 2cm diameter
 *   0.02,  // 2cm height
 *   scene,
 *   new BABYLON.Vector3(5, 0, 0),
 *   arrowQuat,
 *   arrowMat
 * );
 */
export const createArrow = (name: string,
  arrowDiameter: number,
  arrowSize: number,
  scene: BABYLON.Scene,
  corner1Position: BABYLON.Vector3,
  arrow1RotationQuaternion: BABYLON.Quaternion,
  material: BABYLON.Material) => {
  const arrow1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow1', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);
  arrow1.position = corner1Position;
  arrow1.rotationQuaternion = arrow1RotationQuaternion;
  arrow1.material = material;
  return arrow1;
}


/**
 * Creates a visual helper displaying X, Y, Z coordinate axes with arrows and labels.
 * Each axis is rendered as a colored line with an arrow head and text label.
 * Allows custom direction vectors to orient the axes in any direction and custom origin position.
 * Uses shared global texture for all labels to avoid multiple UI textures.
 * Returns both meshes and label data for proper caching and disposal.
 * 
 * @function createAxesBasic
 * @param {BABYLON.Scene} scene - The Babylon.js scene to add axes to
 * @param {BABYLON.Vector3} [origin=Vector3(0, 0, 0)] - Origin point where axes start
 * @param {BABYLON.Vector3} [xDirection=Vector3(1, 0, 0)] - Direction vector for X axis (red)
 * @param {BABYLON.Vector3} [yDirection=Vector3(0, 1, 0)] - Direction vector for Y axis (green)
 * @param {BABYLON.Vector3} [zDirection=Vector3(0, 0, 1)] - Direction vector for Z axis (blue)
 * @param {number} [axisLength=0.2] - Length of each axis in scene units
 * @param {boolean} [showLabels=true] - Whether to display X, Y, Z axis labels
 * @param {GUI.AdvancedDynamicTexture} [advancedTexture] - Optional shared GUI texture for labels. If not provided, uses shared global texture
 * @returns {Object} Object containing axis meshes and labels
 * @returns {BABYLON.Mesh[]} .meshes - Array of all axis meshes (lines and arrows)
 * @returns {AxisLabelNode[]} .labels - Array of axis label data
 * 
 * @example
 * // Standard axes at origin (default)
 * const result = createAxesBasic(scene);
 * const axisMeshes = result.meshes;
 * const axisLabels = result.labels;
 * 
 * @example
 * // Axes at custom position with custom directions
 * const result = createAxesBasic(
 *   scene,
 *   new BABYLON.Vector3(5, 0, 0),   // Origin at (5, 0, 0)
 *   new BABYLON.Vector3(0, 1, 0),   // X axis pointing up
 *   new BABYLON.Vector3(1, 0, 0),   // Y axis pointing right
 *   new BABYLON.Vector3(0, 0, 1),   // Z axis pointing forward
 *   0.2,                             // axis length
 *   true                             // show labels
 * );
 */
export const createAxesBasic = (
  scene: BABYLON.Scene,
  origin: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  xDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0),
  yDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0),
  zDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1),
  axisLength: number = 0.2,
  showLabels: boolean = true,
  advancedTexture?: GUI.AdvancedDynamicTexture
): { meshes: BABYLON.Mesh[]; labels: AxisLabelNode[] } => {
  const lines = [];
  const axisLabels: AxisLabelNode[] = [];
  const axisRadius = 0.005;
  const arrowSize = 0.03;

  // Normalize direction vectors
  const xDir = BABYLON.Vector3.Normalize(xDirection);
  const yDir = BABYLON.Vector3.Normalize(yDirection);
  const zDir = BABYLON.Vector3.Normalize(zDirection);

  // Use provided texture or get shared texture
  const axisTexture = advancedTexture || getDimensionLabelTexture();

  // Helper function to create arrow head at the end of axis
  const createArrowHead = (position: BABYLON.Vector3, direction: BABYLON.Vector3, color: BABYLON.Color3) => {
    const arrowMaterial = new BABYLON.StandardMaterial('arrowMaterial', scene);
    arrowMaterial.emissiveColor = color;

    // Rotate arrow to point along direction
    const yAxis = new BABYLON.Vector3(0, 1, 0);
    const normalizedDirection = BABYLON.Vector3.Normalize(direction);
    const quaternion = new BABYLON.Quaternion();
    BABYLON.Quaternion.FromUnitVectorsToRef(yAxis, normalizedDirection, quaternion);

    // Use createArrow helper from GeometryHelper
    const arrowMesh = createArrow(
      'axisArrow',
      arrowSize,
      arrowSize * 1.5,
      scene,
      position,
      quaternion,
      arrowMaterial
    );

    return arrowMesh;
  };

  // Helper function to create axis label using GUI.TextBlock and advancedTexture
  const createAxisLabel = (arrowMesh: BABYLON.Mesh, labelText: string, color: BABYLON.Color3): AxisLabelNode | null => {
    if (!showLabels) {
      return null;
    }

    const label = new GUI.TextBlock();
    label.text = labelText;
    label.fontSize = 24;
    // label.fontWeight = 'bold';
    label.color = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;

    // Add label to advancedTexture
    axisTexture.addControl(label);

    // Link label to arrow mesh with offset
    label.linkWithMesh(arrowMesh);
    label.linkOffsetX = 20;
    label.linkOffsetY = 0;

    return {
      label: label,
      arrowMesh: arrowMesh,
      axisName: labelText
    };
  };

  // X axis (red)
  const xEnd = origin.add(xDir.scale(axisLength));
  const redLine = BABYLON.MeshBuilder.CreateTube('xAxis', {
    path: [
      origin,
      xEnd,
    ],
    radius: axisRadius,
  }, scene);
  const redMaterial = new BABYLON.StandardMaterial('redMaterial', scene);
  redMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
  redLine.material = redMaterial;
  lines.push(redLine);

  // X axis arrow and label
  const xArrowPos = origin.add(xDir.scale(axisLength + arrowSize));
  const xArrow = createArrowHead(
    xArrowPos,
    xDir,
    new BABYLON.Color3(1, 0, 0)
  );
  lines.push(xArrow);

  const xLabel = createAxisLabel(
    xArrow,
    'X',
    new BABYLON.Color3(1, 0, 0)
  );
  if (xLabel) axisLabels.push(xLabel);

  // Y axis (green)
  const yEnd = origin.add(yDir.scale(axisLength));
  const greenLine = BABYLON.MeshBuilder.CreateTube('yAxis', {
    path: [
      origin,
      yEnd,
    ],
    radius: axisRadius,
  }, scene);
  const greenMaterial = new BABYLON.StandardMaterial('greenMaterial', scene);
  greenMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
  greenLine.material = greenMaterial;
  lines.push(greenLine);

  // Y axis arrow and label
  const yArrowPos = origin.add(yDir.scale(axisLength + arrowSize));
  const yArrow = createArrowHead(
    yArrowPos,
    yDir,
    new BABYLON.Color3(0, 1, 0)
  );
  lines.push(yArrow);

  const yLabel = createAxisLabel(
    yArrow,
    'Y',
    new BABYLON.Color3(0, 1, 0)
  );
  if (yLabel) axisLabels.push(yLabel);

  // Z axis (blue)
  const zEnd = origin.add(zDir.scale(axisLength));
  const blueLine = BABYLON.MeshBuilder.CreateTube('zAxis', {
    path: [
      origin,
      zEnd,
    ],
    radius: axisRadius,
  }, scene);
  const blueMaterial = new BABYLON.StandardMaterial('blueMaterial', scene);
  blueMaterial.emissiveColor = new BABYLON.Color3(0, 0, 1);
  blueLine.material = blueMaterial;
  lines.push(blueLine);

  // Z axis arrow and label
  const zArrowPos = origin.add(zDir.scale(axisLength + arrowSize));
  const zArrow = createArrowHead(
    zArrowPos,
    zDir,
    new BABYLON.Color3(0, 0, 1)
  );
  lines.push(zArrow);

  const zLabel = createAxisLabel(
    zArrow,
    'Z',
    new BABYLON.Color3(0, 0, 1)
  );
  if (zLabel) axisLabels.push(zLabel);

  return { meshes: lines, labels: axisLabels };
};