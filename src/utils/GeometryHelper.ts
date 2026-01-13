import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

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

export interface DimensionLabel {
  label: GUI.TextBlock;
  lineMesh: BABYLON.Mesh;
  linePosition: BABYLON.Vector3;
  offsetX: number;
  offsetY: number;
}

export interface DimensionLineResult {
  group: BABYLON.TransformNode;
  meshes: BABYLON.Mesh[];
  labels: DimensionLabel[];
  width: number;
  depth: number;
  height: number;
}

/**
 * Creates dimension lines for width, depth, and height of any mesh/object
 * @param targetMesh - The mesh or object to measure (or provide bounds directly)
 * @param scene - The Babylon scene
 * @param options - Configuration options
 * @returns Object containing all dimension meshes and parent group
 */
export const createDimensionLineSystem = (
  targetMesh: BABYLON.AbstractMesh | null,
  scene: BABYLON.Scene,
  options: DimensionLineOptions = {}
): DimensionLineResult => {
  // Set defaults
  const {
    dimensions = ['width', 'depth', 'height'],
    offset = 0.3,
    color = new BABYLON.Color3(1, 1, 1),
    scale = 1.0,
    arrowSize = 0.15,
    showLabel = true,
    bounds = null,
  } = options;

  // Get mesh bounds
  let minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number;

  if (bounds) {
    minX = bounds.minX;
    maxX = bounds.maxX;
    minY = bounds.minY;
    maxY = bounds.maxY;
    minZ = bounds.minZ;
    maxZ = bounds.maxZ;
  } else if (targetMesh instanceof BABYLON.AbstractMesh) {
    const boundingInfo = targetMesh.getBoundingInfo();
    const min = boundingInfo.minimum;
    const max = boundingInfo.maximum;
    minX = min.x;
    maxX = max.x;
    minY = min.y;
    maxY = max.y;
    minZ = min.z;
    maxZ = max.z;
  } else {
    throw new Error('targetMesh must be a Babylon mesh or bounds must be provided');
  }

  const width = maxX - minX;
  const depth = maxZ - minZ;
  const height = maxY - minY;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Create material
  const dimensionMat = new BABYLON.StandardMaterial('dimensionMat_' + Math.random(), scene);
  dimensionMat.diffuseColor = color;
  dimensionMat.emissiveColor = color;
  dimensionMat.disableLighting = true;

  // Parent group for all dimension elements
  const dimensionGroup = new BABYLON.TransformNode('dimensionGroup', scene);

  const result: DimensionLineResult = {
    group: dimensionGroup,
    meshes: [],
    labels: [],
    width,
    depth,
    height,
  };

  const lineThickness = 0.002 * scale;
  const arrowDiameter = 0.01 * scale;
  const arrowSizeScaled = arrowSize * scale;
  const yAxis = new BABYLON.Vector3(0, 1, 0);

  // Helper function to create a dimension line between two points
  const createDimensionBetweenPoints = (
    p1: BABYLON.Vector3,
    p2: BABYLON.Vector3,
    dimension: string,
    value: number
  ) => {
    const distance = BABYLON.Vector3.Distance(p1, p2);
    const midpoint = BABYLON.Vector3.Lerp(p1, p2, 0.5);
    const direction = p2.subtract(p1).normalize();

    // Main dimension line
    const line = BABYLON.MeshBuilder.CreateCylinder(`dimLine_${dimension}`, {
      diameter: lineThickness,
      height: distance,
    }, scene);
    line.position = midpoint;
    line.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
      yAxis,
      direction,
      new BABYLON.Quaternion()
    );
    line.material = dimensionMat;
    line.parent = dimensionGroup;
    result.meshes.push(line);

    // Arrow 1
    const arrow1 = BABYLON.MeshBuilder.CreateCylinder(`dimArrow1_${dimension}`, {
      diameterTop: 0,
      diameterBottom: arrowDiameter,
      height: arrowSizeScaled * 0.3,
    }, scene);
    arrow1.position = p1;
    arrow1.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
      yAxis,
      direction.scale(-1),
      new BABYLON.Quaternion()
    );
    arrow1.material = dimensionMat;
    arrow1.parent = dimensionGroup;
    result.meshes.push(arrow1);

    // Arrow 2
    const arrow2 = BABYLON.MeshBuilder.CreateCylinder(`dimArrow2_${dimension}`, {
      diameterTop: 0,
      diameterBottom: arrowDiameter,
      height: arrowSizeScaled * 0.3,
    }, scene);
    arrow2.position = p2;
    arrow2.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
      yAxis,
      direction,
      new BABYLON.Quaternion()
    );
    arrow2.material = dimensionMat;
    arrow2.parent = dimensionGroup;
    result.meshes.push(arrow2);

    // Create label if enabled
    if (showLabel) {
      const labelText = `${dimension.toUpperCase()}: ${value.toFixed(2)}`;
      const label = new GUI.TextBlock();
      label.text = labelText;
      label.color = `#${Math.floor(color.r * 255)
        .toString(16)
        .padStart(2, '0')}${Math.floor(color.g * 255)
        .toString(16)
        .padStart(2, '0')}${Math.floor(color.b * 255)
        .toString(16)
        .padStart(2, '0')}`;
      label.fontSize = 14;
      label.fontWeight = 'bold';
    //   label.background = 'rgba(0, 0, 0, 0.5)';
      label.paddingLeftInPixels = 5;
      label.paddingRightInPixels = 5;
      // Create a placeholder line mesh for linking (will be replaced by actual line mesh in future)
      result.labels.push({ 
        label, 
        lineMesh: result.meshes[0],
        linePosition: midpoint.clone(),
        offsetX: 0,
        offsetY: 0
      });
    }
  };

  // Create dimension lines based on requested dimensions
  if (dimensions.includes('width')) {
    const p1 = new BABYLON.Vector3(minX, centerY, centerZ - offset);
    const p2 = new BABYLON.Vector3(maxX, centerY, centerZ - offset);
    createDimensionBetweenPoints(p1, p2, 'width', width);
  }

  if (dimensions.includes('depth')) {
    const p1 = new BABYLON.Vector3(centerX + offset, centerY, minZ);
    const p2 = new BABYLON.Vector3(centerX + offset, centerY, maxZ);
    createDimensionBetweenPoints(p1, p2, 'depth', depth);
  }

  if (dimensions.includes('height')) {
    const p1 = new BABYLON.Vector3(centerX - offset, minY, centerZ);
    const p2 = new BABYLON.Vector3(centerX - offset, maxY, centerZ);
    createDimensionBetweenPoints(p1, p2, 'height', height);
  }

  return result;
};



export const createDimensionLine = (
  name: string,
  scene: BABYLON.Scene,
  length: number,
  linePosition: BABYLON.Vector3,
  lineRotation: BABYLON.Vector3,
  arrow1Position: BABYLON.Vector3,
  arrow2Position: BABYLON.Vector3,
  arrow1Rotation: BABYLON.Vector3,
  arrow2Rotation: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  lineMat: BABYLON.Material,
  showLabel: boolean = true,
  labelValue?: number
): { meshes: BABYLON.Mesh[]; lineMesh: BABYLON.Mesh; label?: GUI.TextBlock } => {
  const lineThickness = 0.015;
  const arrowSize = 0.15;
  const arrowDiameter = 0.08;
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

  // Create arrow 1
  const arrow1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow1', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);
  arrow1.position = arrow1Position;
  arrow1.rotation = arrow1Rotation;
  arrow1.material = lineMat;
  meshes.push(arrow1);

  // Create arrow 2
  const arrow2 = BABYLON.MeshBuilder.CreateCylinder(name + 'Arrow2', {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize,
  }, scene);
  arrow2.position = arrow2Position;
  arrow2.rotation = arrow2Rotation;
  arrow2.material = lineMat;
  meshes.push(arrow2);

  // Create connector 1
  const distance1 = BABYLON.Vector3.Distance(arrow1Position, corner1Position);
  const connector1 = BABYLON.MeshBuilder.CreateCylinder(name + 'Connector1', {
    diameter: connectorThickness,
    height: distance1,
  }, scene);
  connector1.position = BABYLON.Vector3.Lerp(arrow1Position, corner1Position, 0.5);
  const direction1 = corner1Position.subtract(arrow1Position).normalize();
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
  const direction2 = corner2Position.subtract(arrow2Position).normalize();
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
  arrow1Rotation: BABYLON.Vector3,
  arrow2Rotation: BABYLON.Vector3,
  corner1Position: BABYLON.Vector3,
  corner2Position: BABYLON.Vector3,
  material: BABYLON.Material,
  dimensionValue: number,
  parentGroup: BABYLON.TransformNode,
  advancedTexture: GUI.AdvancedDynamicTexture,
  labelOffsetX: number = 0,
  labelOffsetY: number = 0
): DimensionLabel | null => {
  const result = createDimensionLine(
    dimensionName,
    scene,
    length,
    linePosition,
    lineRotation,
    arrow1Position,
    arrow2Position,
    arrow1Rotation,
    arrow2Rotation,
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
