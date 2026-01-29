import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createDimensionWithLabel, DimensionLineNode } from './GeometryHelper';
import { BaseStructNodeImpl } from './BaseNode';
import {
  getConcreteMaterial,
  getBoundlessMaterial,
  getDimensionLabelTexture,
} from './Material';

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

export interface ConcreteParams {
  thickness: number;
  width: number;
  depth: number;
  position: BABYLON.Vector3;
}

export const createConcrete = (
  scene: BABYLON.Scene,
  params: ConcreteParams,
  parent?: BABYLON.TransformNode,
  isBounded: boolean = true,
  showDimensions: boolean = true,
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

  const concrete = BABYLON.MeshBuilder.CreateBox(
    'concrete',
    { width: params.width, height: params.thickness, depth: params.depth },
    scene,
  );
  concrete.position = params.position;
  concrete.material = getConcreteMaterial(scene);;
  concrete.receiveShadows = true;

  if (parent) {
    concrete.parent = parent as BABYLON.Node;
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

  // Create dimension lines if requested
  let dimensionLines: DimensionLineNode | undefined;
  if (showDimensions) {
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

    // // Width dimension (X axis) - offset from Z min edge
    // const widthLabel = createDimensionWithLabel(
    //   'width',
    //   scene,
    //   new BABYLON.Vector3(minX, maxY + offset, minZ - offset),
    //   new BABYLON.Vector3(maxX, maxY + offset, minZ - offset),
    //   new BABYLON.Vector3(minX, maxY, minZ),
    //   new BABYLON.Vector3(maxX, maxY, minZ),
    //   dimensionMat,
    //   params.width,
    //   dimensionGroup,
    //   advancedTexture,
    //   0,
    //   30,
    // );
    // if (widthLabel) labels.push(widthLabel.label);

    // // Depth dimension (Z axis) - offset from X max edge
    // const depthLabel = createDimensionWithLabel(
    //   'depth',
    //   scene,
    //   new BABYLON.Vector3(minX - offset, maxY + offset, minZ),
    //   new BABYLON.Vector3(minX - offset, maxY + offset, maxZ),
    //   new BABYLON.Vector3(minX, maxY, minZ),
    //   new BABYLON.Vector3(minX, maxY, maxZ),
    //   dimensionMat,
    //   params.depth,
    //   dimensionGroup,
    //   advancedTexture,
    //   -30,
    //   0,
    // );
    // if (depthLabel) labels.push(depthLabel.label);

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
  }

  concreteNode.setMesh(concrete);
  concreteNode.setInfiniteBlocks(sinBlocks);
  concreteNode.addDimensionLine(dimensionLines!);
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

  // Create a single mesh that surrounds the concrete on all sides
  const surroundingMesh = createSurroundingConcreteMesh(
    scene,
    'infiniteBlock',
    concreteWidth,
    concreteDepth,
    concreteThickness,
    concretePosition,
    // sinBlockMat,
  );

  if (parent) {
    surroundingMesh.parent = parent as BABYLON.Node;
  }

  return [surroundingMesh];
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

  // Helper function to add a block's vertices and indices
  const addBlockVertices = (
    blockWidth: number,
    blockHeight: number,
    blockDepth: number,
    direction: 'x' | '-x' | 'z' | '-z',
  ) => {
    const startVertex = vertexCount;

    // Outer face vertices (wavy surface)
    // we need to add extra width to account for the depth on both sides
    const outerWidth = blockWidth + blockDepth * 2;
    for (let iv = 0; iv <= divV; iv++) {
      const v =
        (iv / divV) * blockHeight + (concretePosition.y - blockHeight / 2);
      for (let iu = 0; iu <= divU; iu++) {
        const u = (iu / divU - 0.5) * outerWidth;
        const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

        if (direction === 'z') {
          // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
          positions.push(
            u + concretePosition.x,
            v,
            blockDepth +
              waveDisplacement +
              (concretePosition.z + concreteDepth / 2),
          );
        } else if (direction === '-z') {
          // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
          positions.push(
            u + concretePosition.x,
            v,
            -blockDepth -
              waveDisplacement +
              (concretePosition.z - concreteDepth / 2),
          );
        } else if (direction === 'x') {
          // interate y from 0 to blockheight, interate u from -width/2 to width/2
          positions.push(
            blockDepth +
              waveDisplacement +
              (concretePosition.x + concreteWidth / 2),
            v,
            u + concretePosition.z,
          );
        } else if (direction === '-x') {
          // interate y from 0 to blockheight, interate u from -width/2 to width/2
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

    // Inner face vertices (flat surface)
    const offset = divV + 1;
    for (let iv = 0; iv <= divV; iv++) {
      const v =
        concretePosition.y - blockHeight * 0.5 + (iv / divV) * blockHeight;
      for (let iu = 0; iu <= divU; iu++) {
        const u = (iu / divU - 0.5) * blockWidth;

        if (direction === 'z') {
          // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
          positions.push(
            u + concretePosition.x,
            v,
            concreteDepth / 2 + concretePosition.z,
          );
        } else if (direction === '-z') {
          // interate y from 0 to blockheight, interate x from -width/2 to width/2, z is constant
          positions.push(
            u + concretePosition.x,
            v,
            -concreteDepth / 2 + concretePosition.z,
          );
        } else if (direction === 'x') {
          positions.push(
            concreteWidth / 2 + concretePosition.x,
            v,
            u + concretePosition.z,
          );
        } else if (direction === '-x') {
          positions.push(
            -concreteWidth / 2 + concretePosition.x,
            v,
            u + concretePosition.z,
          );
        }
        uvs.push(iu / divU, iv / divV);
      }
    }

    const ring = divU + 1;

    // Outer face triangles
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

    // Inner face triangles
    for (let iv = 0; iv < divV; iv++) {
      for (let iu = 0; iu < divU; iu++) {
        const a = startVertex + offset * ring + iv * ring + iu;
        const b = a + 1;
        const c = a + ring;
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    // Side walls
    const backCol = divU;
    for (let iv = 0; iv < divV; iv++) {
      const outerA = startVertex + iv * ring;
      const outerB = startVertex + (iv + 1) * ring;
      const innerA = startVertex + offset * ring + iv * ring;
      const innerB = startVertex + offset * ring + (iv + 1) * ring;

      indices.push(outerA, outerB, innerA);
      indices.push(innerA, outerB, innerB);
    }

    for (let iv = 0; iv < divV; iv++) {
      const outerA = startVertex + iv * ring + backCol;
      const outerB = startVertex + (iv + 1) * ring + backCol;
      const innerA = startVertex + offset * ring + iv * ring + backCol;
      const innerB = startVertex + offset * ring + (iv + 1) * ring + backCol;

      indices.push(outerA, innerA, outerB);
      indices.push(innerA, innerB, outerB);
    }

    // Bottom wall
    for (let iu = 0; iu < divU; iu++) {
      const outerA = startVertex + iu;
      const outerB = startVertex + iu + 1;
      const innerA = startVertex + offset * ring + iu;
      const innerB = startVertex + offset * ring + iu + 1;

      indices.push(outerA, innerA, outerB);
      indices.push(innerA, innerB, outerB);
    }

    // Top wall
    const topRow = startVertex + divV * ring;
    for (let iu = 0; iu < divU; iu++) {
      const outerA = topRow + iu;
      const outerB = topRow + iu + 1;
      const innerA = startVertex + offset * ring + divV * ring + iu;
      const innerB = startVertex + offset * ring + divV * ring + iu + 1;

      indices.push(outerA, outerB, innerA);
      indices.push(innerA, outerB, innerB);
    }

    vertexCount += (divV + 1) * (divU + 1) * 2;
  };

  // Add all four blocks with the margin
  addBlockVertices(concreteWidth, concreteThickness, blockThickness, 'z');
  addBlockVertices(concreteWidth, concreteThickness, blockThickness, '-z');
  addBlockVertices(concreteDepth, concreteThickness, blockThickness, 'x');
  addBlockVertices(concreteDepth, concreteThickness, blockThickness, '-x');

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
