import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createDimensionWithLabel, DimensionLineNode } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';
import {
  getConcreteMaterial,
  getBoundlessMaterial,
  getDimensionLabelTexture,
} from './Material';
import type { ConcreteParams } from './EndAnchorageParams';

export class ConcreteNode extends BaseStructNodeImpl {
  private mesh?: BABYLON.Mesh;
  private infiniteBlocks?: BABYLON.Mesh[];
  // private dimensionLines?: DimensionLineNode;
  private concreteWidth: number = 0;
  private concreteDepth: number = 0;
  private concreteHeight: number = 0;

  constructor(group: BABYLON.TransformNode) {
    super(group);
  }

  getMesh(): BABYLON.Mesh | undefined {
    return this.mesh;
  }

  setMesh(mesh: BABYLON.Mesh | undefined): void {
    this.mesh = mesh;
  }

  getInfiniteBlocks(): BABYLON.Mesh[] | undefined {
    return this.infiniteBlocks;
  }

  setInfiniteBlocks(blocks: BABYLON.Mesh[] | undefined): void {
    this.infiniteBlocks = blocks;
  }

  getConcreteWidth(): number {
    return this.concreteWidth;
  }

  setConcreteWidth(width: number): void {
    this.concreteWidth = width;
  }

  getConcreteDepth(): number {
    return this.concreteDepth;
  }

  setConcreteDepth(depth: number): void {
    this.concreteDepth = depth;
  }

  getConcreteHeight(): number {
    return this.concreteHeight;
  }

  setConcreteHeight(height: number): void {
    this.concreteHeight = height;
  }

  dispose(): void {
    // this.dimensionLines?.dispose?.();
    this.mesh?.dispose();
    this.infiniteBlocks?.forEach(block => block.dispose());
    // Call parent to dispose axis meshes
    super.dispose();
  }
}

export const createConcrete = (
  scene: BABYLON.Scene,
  params: ConcreteParams,
  parent?: BABYLON.TransformNode,
  isBounded: boolean = true,
  showDimensions: boolean = true,
  showLapSpliceDimension: boolean = false,
): ConcreteNode => {
  // Create a transform node to group concrete elements
  const concreteTransformNode = new BABYLON.TransformNode(
    'concreteGroup',
    scene,
  );
  if (parent) {
    concreteTransformNode.parent = parent as BABYLON.Node;
  }

  const concreteNode = new ConcreteNode(concreteTransformNode);

  if (isBounded) {
    const concrete = BABYLON.MeshBuilder.CreateBox(
      'concrete',
      { width: params.width, height: params.thickness, depth: params.depth },
      scene,
    );
    concrete.position = params.position;
    concrete.material = getConcreteMaterial(scene);
    concrete.receiveShadows = true;
    if (parent) {
      concrete.parent = parent as BABYLON.Node;
    }

    // Create dimension lines if requested
    let dimensionLines: DimensionLineNode | undefined;
    if (showDimensions) {
      dimensionLines = createDimension(
        scene,
        concrete,
        params,
        showLapSpliceDimension,
        dimensionLines,
        parent,
      );
    }
    concreteNode.setMesh(concrete);
    concreteNode.addDimensionLine(dimensionLines!);
  }


  const sinBlocks = !isBounded
    ? createBoundlessBlocks(
      scene,
      params.width,
      params.depth,
      params.thickness,
      params.position,
      parent,
    )
    : [];




  concreteNode.setInfiniteBlocks(sinBlocks);

  concreteNode.setConcreteWidth(params.width);
  concreteNode.setConcreteDepth(params.depth);
  concreteNode.setConcreteHeight(params.thickness);

  return concreteNode;
};

const createBoundlessBlocks = (
  scene: BABYLON.Scene,
  concreteWidth: number,
  concreteDepth: number,
  concreteThickness: number,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  parent?: BABYLON.TransformNode,
): BABYLON.Mesh[] => {
  // Create the main mesh (4 wavy outer surfaces)
  const mainMesh = createSurroundingConcreteMesh(
    scene,
    'infiniteBlock_main',
    concreteWidth,
    concreteDepth,
    concreteThickness,
    concretePosition,
  );

  // Create the bottom wall mesh
  const bottomWallMesh = createWallMesh(
    scene,
    'infiniteBlock_walls_bottom',
    concreteWidth,
    concreteDepth,
    concreteThickness,
    concretePosition,
    'bottom',
  );

  // Create the top wall mesh
  const topWallMesh = createWallMesh(
    scene,
    'infiniteBlock_walls_top',
    concreteWidth,
    concreteDepth,
    concreteThickness,
    concretePosition,
    'top',
  );

  if (parent) {
    mainMesh.parent = parent as BABYLON.Node;
    bottomWallMesh.parent = parent as BABYLON.Node;
    topWallMesh.parent = parent as BABYLON.Node;
  }

  return [mainMesh, bottomWallMesh, topWallMesh];
};

const createSurroundingConcreteMesh = (
  scene: BABYLON.Scene,
  name: string,
  concreteWidth: number,
  concreteDepth: number,
  concreteThickness: number,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
): BABYLON.Mesh => {
  const blockThickness = 0.2;
  const amp = 0.02;
  const freq = 10 * concreteWidth;
  const divU = 50;
  const divV = 10;

  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  let vertexCount = 0;

  // Helper function to add only the wavy outer surface
  const addWavyOuterSurface = (
    blockWidth: number,
    blockHeight: number,
    blockDepth: number,
    direction: 'x' | '-x' | 'z' | '-z',
  ) => {
    const startVertex = vertexCount;

    // Outer face vertices (wavy surface)
    const outerWidth = blockWidth + blockDepth * 2;
    for (let iv = 0; iv <= divV; iv++) {
      const v =
        (iv / divV) * blockHeight + (concretePosition.y - blockHeight / 2);
      for (let iu = 0; iu <= divU; iu++) {
        const u = (iu / divU - 0.5) * outerWidth;const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;
        

        if (direction === 'z') {
          positions.push(
            u + concretePosition.x,
            v,
            blockDepth +
            waveDisplacement +
            (concretePosition.z + concreteDepth / 2),
          );
        } else if (direction === '-z') {
          positions.push(
            u + concretePosition.x,
            v,
            -blockDepth -
            waveDisplacement +
            (concretePosition.z - concreteDepth / 2),
          );
        } else if (direction === 'x') {
          positions.push(
            blockDepth +
            waveDisplacement +
            (concretePosition.x + concreteWidth / 2),
            v,
            u + concretePosition.z,
          );
        } else if (direction === '-x') {
          positions.push(
            -blockDepth -
            waveDisplacement +
            (concretePosition.x - concreteWidth / 2),
            v,
            u + concretePosition.z,
          );
        }
        uvs.push(iu / divU, iv / divV);
      }
    }

    const ring = divU + 1;

    // Wavy outer face triangles
    for (let iv = 0; iv < divV; iv++) {
      for (let iu = 0; iu < divU; iu++) {
        const a = startVertex + iv * ring + iu;
        const b = a + 1;
        const c = a + ring;
        const d = c + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    vertexCount += (divV + 1) * (divU + 1);
  };

  // Add wavy outer surfaces for all four sides
  addWavyOuterSurface(concreteWidth, concreteThickness, blockThickness, 'z');
  addWavyOuterSurface(concreteWidth, concreteThickness, blockThickness, '-z');
  addWavyOuterSurface(concreteDepth, concreteThickness, blockThickness, 'x');
  addWavyOuterSurface(concreteDepth, concreteThickness, blockThickness, '-x');

  const mesh = new BABYLON.Mesh(name, scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

  const normalsArray: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
  mesh.setIndices(indices);

  mesh.material = getBoundlessMaterial(scene);

  return mesh;
};

const createWallMesh = (
  scene: BABYLON.Scene,
  name: string,
  concreteWidth: number,
  concreteDepth: number,
  concreteThickness: number,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  wallType: 'top' | 'bottom' = 'bottom',
): BABYLON.Mesh => {
  const blockThickness = 0.2;
  const amp = 0.02;
  const freq = 10 * concreteWidth;
  const divU = 50;
  const divV = 50;

  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  // Y position for this horizontal plane
  const yPos =
    wallType === 'bottom'
      ? concretePosition.y - concreteThickness / 2
      : concretePosition.y + concreteThickness / 2;

  // Total dimensions including blockThickness
  const totalWidth = concreteWidth + blockThickness * 2;
  const totalDepth = concreteDepth + blockThickness * 2;

  // Create a grid of vertices on the XZ plane
  for (let iv = 0; iv <= divV; iv++) {
    for (let iu = 0; iu <= divU; iu++) {
      const uNorm = iu / divU; // 0 to 1
      const vNorm = iv / divV; // 0 to 1
      
      // Position in XZ plane (centered at concretePosition)
      let x = (uNorm - 0.5) * totalWidth + concretePosition.x;
      let z = (vNorm - 0.5) * totalDepth + concretePosition.z;
      
      // Apply wave displacement only to perimeter vertices
      let waveDisplacement = 0;
      
      // Check if vertex is on the perimeter
      if (iu === 0 || iu === divU || iv === 0 || iv === divV) {
        // Determine which edge and apply wave
        if (iv === 0) {
          // Front edge (z min)
          waveDisplacement = Math.sin(uNorm * Math.PI * freq) * amp;
          z = (concretePosition.z - totalDepth / 2) - waveDisplacement;
        } else if (iv === divV) {
          // Back edge (z max)
          waveDisplacement = Math.sin(uNorm * Math.PI * freq) * amp;
          z = (concretePosition.z + totalDepth / 2) + waveDisplacement;
        } else if (iu === 0) {
          // Left edge (x min)
          waveDisplacement = Math.sin(vNorm * Math.PI * freq) * amp;
          x = (concretePosition.x - totalWidth / 2) - waveDisplacement;
        } else if (iu === divU) {
          // Right edge (x max)
          waveDisplacement = Math.sin(vNorm * Math.PI * freq) * amp;
          x = (concretePosition.x + totalWidth / 2) + waveDisplacement;
        }
      }
      
      positions.push(x, yPos, z);
      uvs.push(uNorm, vNorm);
    }
  }

  // Create triangles for the grid
  const ring = divU + 1;
  for (let iv = 0; iv < divV; iv++) {
    for (let iu = 0; iu < divU; iu++) {
      const a = iv * ring + iu;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      // Winding order depends on top/bottom
      if (wallType === 'bottom') {
        // Bottom face: normal points down
        indices.push(a, c, b);
        indices.push(b, c, d);
      } else {
        // Top face: normal points up
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  // Create the mesh
  const mesh = new BABYLON.Mesh(name, scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

  const normalsArray: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
  mesh.setIndices(indices);

  mesh.material = getBoundlessMaterial(scene);

  return mesh;
};
function createDimension(
  scene: BABYLON.Scene,
  concrete: BABYLON.Mesh,
  params: ConcreteParams,
  showLapSpliceDimension: boolean,
  dimensionLines: DimensionLineNode | undefined,
  parent: BABYLON.TransformNode | undefined,
) {
  const dimensionMat = new BABYLON.StandardMaterial(
    'dimensionMat_concrete',
    scene,
  );
  dimensionMat.emissiveColor = new BABYLON.Color3(0, 0, 0); // black
  dimensionMat.disableLighting = true;

  const boundingInfo = concrete.getBoundingInfo();
  const min = boundingInfo.minimum;
  const max = boundingInfo.maximum;

  // Apply concrete position to transform bounding box from local to world space
  const minX = min.x + params.position.x;
  const maxX = max.x + params.position.x;
  const minY = min.y + params.position.y;
  const maxY = max.y + params.position.y;
  const minZ = min.z + params.position.z;
  const maxZ = max.z + params.position.z;

  const offset = 0.1;
  const dimensionGroup = new BABYLON.TransformNode(
    'dimensionGroup_concrete',
    scene,
  );
  const labels: GUI.TextBlock[] = [];

  // Use global AdvancedDynamicTexture for dimension labels
  const advancedTexture = getDimensionLabelTexture();

  if (showLapSpliceDimension) {
    // Width dimension (X axis) - offset from Z min edge
    const widthLabel = createDimensionWithLabel(
      'width',
      scene,
      new BABYLON.Vector3(minX, minY - offset, minZ - offset),
      new BABYLON.Vector3(maxX, minY - offset, minZ - offset),
      new BABYLON.Vector3(minX, minY, minZ),
      new BABYLON.Vector3(maxX, minY, minZ),
      dimensionMat,
      params.width,
      dimensionGroup,
      advancedTexture,
      0,
      30,
    );
    if (widthLabel) labels.push(widthLabel.label);

    // Depth dimension (Z axis) - offset from X max edge
    const depthLabel = createDimensionWithLabel(
      'depth',
      scene,
      new BABYLON.Vector3(minX - offset, minY - offset, minZ),
      new BABYLON.Vector3(minX - offset, minY - offset, maxZ),
      new BABYLON.Vector3(minX, minY, minZ),
      new BABYLON.Vector3(minX, minY, maxZ),
      dimensionMat,
      params.depth,
      dimensionGroup,
      advancedTexture,
      -30,
      0,
    );
    if (depthLabel) labels.push(depthLabel.label);
  }

  // Height dimension (Y axis) - offset from X min, Z min corner
  const heightDimensionNode = createDimensionWithLabel(
    'height',
    scene,
    new BABYLON.Vector3(minX - offset, minY, minZ - offset),
    new BABYLON.Vector3(minX - offset, maxY, minZ - offset),
    new BABYLON.Vector3(minX, minY, minZ),
    new BABYLON.Vector3(minX, maxY, minZ),
    dimensionMat,
    params.thickness,
    dimensionGroup,
    advancedTexture,
    -30,
    0,
  );
  if (heightDimensionNode) labels.push(heightDimensionNode.label);

  const dimensionLineResult2 = new DimensionLineNode(dimensionGroup);
  dimensionLineResult2.setLabels(labels);
  // Add meshes from dimension group
  (dimensionGroup.getChildren() as BABYLON.Mesh[]).forEach(mesh => {
    dimensionLineResult2.addMesh(mesh);
  });
  dimensionLines = dimensionLineResult2;

  if (parent) {
    dimensionGroup.parent = parent as BABYLON.Node;
  }
  return dimensionLines;
}
