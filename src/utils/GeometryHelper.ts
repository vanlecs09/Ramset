import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { initializeDimensionLabelTexture } from './ConcreteBuilder';
import type { BaseStructureGroup } from './CircularColumnsBuilder';

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
export class DimensionLineNode implements BaseStructureGroup {
  group: BABYLON.TransformNode;
  private meshes: BABYLON.Mesh[] = [];
  private labels: DimensionLabelNode[] = [];
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
    this.group = group;
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
   * @returns {DimensionLabelNode[]} Array of label nodes
   */
  getLabels(): DimensionLabelNode[] {
    return this.labels;
  }

  /**
   * Sets all labels for this dimension line, replacing any existing labels.
   * @param {DimensionLabelNode[]} labels - Array of label nodes to manage
   */
  setLabels(labels: DimensionLabelNode[]): void {
    this.labels = labels;
  }

  /**
   * Adds a single label to this dimension line's label collection.
   * @param {DimensionLabelNode} label - Label node to add
   */
  addLabel(label: DimensionLabelNode): void {
    this.labels.push(label);
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

    // Dispose all labels
    this.labels.forEach(labelData => {
      labelData.label.dispose();
    });

    // Dispose the transform node
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
  labelValue?: number
): { meshes: BABYLON.Mesh[]; lineMesh: BABYLON.Mesh; label?: GUI.TextBlock } => {
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
 * @param {GUI.AdvancedDynamicTexture} advancedTexture - GUI texture for label rendering
 * @param {number} [labelOffsetX=0] - Horizontal offset for label positioning (pixels)
 * @param {number} [labelOffsetY=0] - Vertical offset for label positioning (pixels)
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
 *   guiTexture,
 *   0,
 *   30
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
  advancedTexture: GUI.AdvancedDynamicTexture,
  labelOffsetX: number = 0,
  labelOffsetY: number = 0
): DimensionLabelNode | null => {
  let linePosition = BABYLON.Vector3.Lerp(arrow1Position, arrow2Position, 0.5);
  const result = createDimensionLine(
    dimensionName,
    scene,
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

  // Add label to the torus using singleton texture
  const advancedTexture = initializeDimensionLabelTexture();

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
 * Creates a width dimension (X-axis) dimension line with label positioned above the object.
 * Specialized helper function for ConcreteBuilder and SlabBuilder structures.
 * Dimension line runs horizontally (minX to maxX) positioned above the top face.
 * 
 * @function createWidthDimensionLabel
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {number} concreteWidth - Width value to display in dimension label
 * @param {number} centerX - Center X position of the measured object
 * @param {number} maxY - Top Y position (dimension positioned above this)
 * @param {number} offset - Distance offset from measured surface in scene units
 * @param {number} minZ - Front Z position of the measured object
 * @param {number} minX - Minimum X position of the measured object
 * @param {number} maxX - Maximum X position of the measured object
 * @param {BABYLON.StandardMaterial} dimensionMat - Material for dimension line
 * @param {BABYLON.TransformNode} dimensionGroup - Parent transform node
 * @param {GUI.AdvancedDynamicTexture} advancedTexture - GUI texture for label
 * 
 * @returns {DimensionLabelNode|null} Complete dimension label data with mesh and positioning info
 * 
 * @example
 * const widthDim = createWidthDimensionLabel(
 *   scene,
 *   10.5,  // width value
 *   0,     // center X
 *   5,     // top Y
 *   0.5,   // offset
 *   -5,    // min Z
 *   -5.25, // min X
 *   5.25,  // max X
 *   dimensionMat,
 *   dimensionGroup,
 *   guiTexture
 * );
 */
export const createWidthDimensionLabel = (scene: BABYLON.Scene,
    concreteWidth: number,
    centerX: number, maxY: number,
    offset: number, minZ: number,
    minX: number, maxX: number,
    dimensionMat: BABYLON.StandardMaterial,
    dimensionGroup: BABYLON.TransformNode,
    advancedTexture: GUI.AdvancedDynamicTexture) => {
    return createDimensionWithLabel(
        'width',
        scene,
        new BABYLON.Vector3(centerX, maxY + offset, minZ - offset),
        new BABYLON.Vector3(0, 0, Math.PI / 2),
        new BABYLON.Vector3(minX, maxY + offset, minZ - offset),
        new BABYLON.Vector3(maxX, maxY + offset, minZ - offset),
        new BABYLON.Vector3(minX, maxY, minZ),
        new BABYLON.Vector3(maxX, maxY, minZ),
        dimensionMat,
        concreteWidth,
        dimensionGroup,
        advancedTexture,
        0,
        30
    );
}

/**
 * Creates a depth dimension (Z-axis) dimension line with label positioned left of the object.
 * Specialized helper function for ConcreteBuilder and SlabBuilder structures.
 * Dimension line runs front-to-back (minZ to maxZ) positioned to the left and above.
 * 
 * @function createDepthDimensionLabel
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {number} concreteDepth - Depth value to display in dimension label
 * @param {number} minX - Minimum X position (dimension positioned left of this)
 * @param {number} offset - Distance offset from measured surface in scene units
 * @param {number} maxY - Top Y position (dimension positioned above this)
 * @param {number} centerZ - Center Z position of the measured object
 * @param {number} minZ - Minimum Z position of the measured object
 * @param {number} maxZ - Maximum Z position of the measured object
 * @param {BABYLON.StandardMaterial} dimensionMat - Material for dimension line
 * @param {BABYLON.TransformNode} dimensionGroup - Parent transform node
 * @param {GUI.AdvancedDynamicTexture} advancedTexture - GUI texture for label
 * 
 * @returns {DimensionLabelNode|null} Complete dimension label data with mesh and positioning info
 * 
 * @example
 * const depthDim = createDepthDimensionLabel(
 *   scene,
 *   8.5,   // depth value
 *   -5.25, // min X
 *   0.5,   // offset
 *   5,     // max Y
 *   0,     // center Z
 *   -4.25, // min Z
 *   4.25,  // max Z
 *   dimensionMat,
 *   dimensionGroup,
 *   guiTexture
 * );
 */
export const createDepthDimensionLabel = (scene: BABYLON.Scene, concreteDepth: number, minX: number, offset: number, maxY: number, centerZ: number, minZ: number, maxZ: number, dimensionMat: BABYLON.StandardMaterial, dimensionGroup: BABYLON.TransformNode, advancedTexture: GUI.AdvancedDynamicTexture) => {
    return createDimensionWithLabel(
        'depth',
        scene,
        new BABYLON.Vector3(minX - offset, maxY + offset, centerZ),
        new BABYLON.Vector3(Math.PI / 2, 0, 0),
        new BABYLON.Vector3(minX - offset, maxY + offset, minZ),
        new BABYLON.Vector3(minX - offset, maxY + offset, maxZ),
        new BABYLON.Vector3(minX, maxY, minZ),
        new BABYLON.Vector3(minX, maxY, maxZ),
        dimensionMat,
        concreteDepth,
        dimensionGroup,
        advancedTexture,
        -30,
        0
    );
}

/**
 * Creates a height dimension (Y-axis) dimension line with label positioned left of the object.
 * Specialized helper function for ConcreteBuilder and SlabBuilder structures.
 * Dimension line runs vertically (minY to maxY) positioned to the left and front.
 * 
 * @function createHeightDemensionLabel
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {number} concreteThickness - Height/thickness value to display in dimension label
 * @param {number} minX - Minimum X position (dimension positioned left of this)
 * @param {number} offset - Distance offset from measured surface in scene units
 * @param {number} centerY - Center Y position of the measured object
 * @param {number} minZ - Front Z position (dimension positioned in front of this)
 * @param {number} minY - Minimum Y position of the measured object
 * @param {number} maxY - Maximum Y position of the measured object
 * @param {BABYLON.StandardMaterial} dimensionMat - Material for dimension line
 * @param {BABYLON.TransformNode} dimensionGroup - Parent transform node
 * @param {GUI.AdvancedDynamicTexture} advancedTexture - GUI texture for label
 * 
 * @returns {DimensionLabelNode|null} Complete dimension label data with mesh and positioning info
 * 
 * @example
 * const heightDim = createHeightDemensionLabel(
 *   scene,
 *   2.5,    // height/thickness value
 *   -5.25,  // min X
 *   0.5,    // offset
 *   1.25,   // center Y
 *   -4.25,  // min Z
 *   0,      // min Y
 *   2.5,    // max Y
 *   dimensionMat,
 *   dimensionGroup,
 *   guiTexture
 * );
 */
export const createHeightDemensionLabel = (scene: BABYLON.Scene, concreteThickness: number, minX: number, offset: number, centerY: number, minZ: number, minY: number, maxY: number, dimensionMat: BABYLON.StandardMaterial, dimensionGroup: BABYLON.TransformNode, advancedTexture: GUI.AdvancedDynamicTexture) => {
    return createDimensionWithLabel(
        'height',
        scene,
        new BABYLON.Vector3(minX - offset, centerY, minZ - offset),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(minX - offset, minY, minZ - offset),
        new BABYLON.Vector3(minX - offset, maxY, minZ - offset),
        new BABYLON.Vector3(minX, minY, minZ),
        new BABYLON.Vector3(minX, maxY, minZ),
        dimensionMat,
        concreteThickness,
        dimensionGroup,
        advancedTexture,
        -30,
        0
    );
}


