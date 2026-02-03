import * as BABYLON from '@babylonjs/core';
import { BaseStructNodeImpl } from './BaseNode';
import { createConcrete } from './ConcreteNode';
import type { ConcreteNode } from './ConcreteNode';
import { calculateCuboidPostPositions } from './CuboidPostPositionCalculator';
import { createPost } from './PostNode';
import { createUnitAxes } from './UnitAxisNode';
import { createMomens } from './BaseEndAnchorageNode';
import { getWaveBlockMaterial } from './Material';

// Helper function to create a combined mesh from two cuboids without duplicate vertices
const createCombinedCuboidMesh = (
  scene: BABYLON.Scene,
  cuboid1Pos: BABYLON.Vector3,
  cuboid1SizeX: number,
  cuboid1SizeZ: number,
  cuboid2Pos: BABYLON.Vector3,
  cuboid2SizeX: number,
  cuboid2SizeZ: number,
  cuboidHeight: number,
  material: BABYLON.Material,
): BABYLON.Mesh => {
  // Create vertex data for both cuboids
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const vertexMap = new Map<string, number>(); // Map to track unique vertices

  const VERTEX_TOLERANCE = 0.0001; // Tolerance for vertex merging

  // Function to get or create a vertex
  const getOrCreateVertex = (x: number, y: number, z: number): number => {
    // Round to tolerance to handle floating point precision
    const key = `${Math.round(x / VERTEX_TOLERANCE) * VERTEX_TOLERANCE},${Math.round(y / VERTEX_TOLERANCE) * VERTEX_TOLERANCE},${Math.round(z / VERTEX_TOLERANCE) * VERTEX_TOLERANCE}`;

    if (vertexMap.has(key)) {
      return vertexMap.get(key)!;
    }

    const index = vertices.length / 3;
    vertices.push(x, y, z);
    vertexMap.set(key, index);
    return index;
  };

  // Function to add a cuboid's vertices and indices
  const addCuboidGeometry = (
    position: BABYLON.Vector3,
    sizeX: number,
    sizeZ: number,
    height: number,
  ) => {
    const halfX = sizeX / 2;
    const halfZ = sizeZ / 2;
    const halfH = height / 2;

    // 8 vertices of the cuboid
    const v0 = getOrCreateVertex(
      position.x - halfX,
      position.y - halfH,
      position.z - halfZ,
    );
    const v1 = getOrCreateVertex(
      position.x + halfX,
      position.y - halfH,
      position.z - halfZ,
    );
    const v2 = getOrCreateVertex(
      position.x + halfX,
      position.y + halfH,
      position.z - halfZ,
    );
    const v3 = getOrCreateVertex(
      position.x - halfX,
      position.y + halfH,
      position.z - halfZ,
    );
    const v4 = getOrCreateVertex(
      position.x - halfX,
      position.y - halfH,
      position.z + halfZ,
    );
    const v5 = getOrCreateVertex(
      position.x + halfX,
      position.y - halfH,
      position.z + halfZ,
    );
    const v6 = getOrCreateVertex(
      position.x + halfX,
      position.y + halfH,
      position.z + halfZ,
    );
    const v7 = getOrCreateVertex(
      position.x - halfX,
      position.y + halfH,
      position.z + halfZ,
    );

    // 12 triangles (2 per face)
    const idx = [
      // Front face (z-)
      v0,
      v2,
      v1,
      v0,
      v3,
      v2,
      // Back face (z+)
      v5,
      v7,
      v6,
      v5,
      v4,
      v7,
      // Left face (x-)
      v4,
      v3,
      v7,
      v4,
      v0,
      v3,
      // Right face (x+)
      v1,
      v6,
      v5,
      v1,
      v2,
      v6,
      // Top face (y+)
      v3,
      v6,
      v7,
      v3,
      v2,
      v6,
      // Bottom face (y-)
      v4,
      v1,
      v5,
      v4,
      v0,
      v1,
    ];

    indices.push(...idx);
  };

  // Add both cuboids
  addCuboidGeometry(cuboid1Pos, cuboid1SizeX, cuboid1SizeZ, cuboidHeight);
  addCuboidGeometry(cuboid2Pos, cuboid2SizeX, cuboid2SizeZ, cuboidHeight);

  // Create mesh and compute normals
  const mesh = new BABYLON.Mesh('combinedCuboid', scene);
  const vertexData = new BABYLON.VertexData();

  vertexData.positions = vertices;
  vertexData.indices = indices;
  BABYLON.VertexData.ComputeNormals(vertices, indices, normals);
  vertexData.normals = normals;

  vertexData.applyToMesh(mesh);

  mesh.material = material;
  mesh.receiveShadows = true;

  return mesh;
};
export class ComplexColumnNode extends BaseStructNodeImpl {
  private concreteGroup?: ConcreteNode;
  private cuboid1?: BABYLON.Mesh;
  private cuboid2?: BABYLON.Mesh;
  mergedCuboid?: BABYLON.Mesh;
  cuboidsMerged?: boolean;

  constructor(group: BABYLON.TransformNode) {
    super(group);
  }

  getConcreteGroup(): ConcreteNode | undefined {
    return this.concreteGroup;
  }

  setConcreteGroup(concreteGroup: ConcreteNode): void {
    this.concreteGroup = concreteGroup;
  }

  getCuboid1(): BABYLON.Mesh | undefined {
    return this.cuboid1;
  }

  setCuboid1(cuboid: BABYLON.Mesh): void {
    this.cuboid1 = cuboid;
  }

  getCuboid2(): BABYLON.Mesh | undefined {
    return this.cuboid2;
  }

  setCuboid2(cuboid: BABYLON.Mesh): void {
    this.cuboid2 = cuboid;
  }

  dispose(): void {
    // Dispose concrete group and all its resources
    if (this.concreteGroup) {
      this.concreteGroup.dispose();
    }

    // Dispose cuboids
    this.cuboid1?.dispose();
    this.cuboid2?.dispose();
    this.mergedCuboid?.dispose();
    // Call parent to dispose axis meshes and posts
    super.dispose();
  }
}

export const createComplexColumn = (
  scene: BABYLON.Scene,
  concreteThickness: number = 1,
  concreteWidth: number = 3,
  concreteDepth: number = 3,
  concretePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0),
  _infiniteBlockPositions: BABYLON.Vector3[] = [],
  isFiniteConcrete: boolean = true,
  cuboid1SizeX: number = 2,
  cuboid1SizeZ: number = 2,
  cuboid1PostCountLeftEdge: number = 2,
  cuboid1PostCountTopEdge: number = 2,
  cuboid2SizeX: number = 2,
  cuboid2SizeZ: number = 2,
  cuboid2TranslateX: number = 0,
  cuboid2TranslateZ: number = 0,
  cuboid2PostCountLeftEdge: number = 2,
  cuboid2PostCountTopEdge: number = 2,
  postRadius: number = 0.05,
  postOffset: number = 0.1,
): ComplexColumnNode => {
  const columnGroup = new BABYLON.TransformNode('complexColumn', scene);
  const complexColumn = new ComplexColumnNode(columnGroup);
  console.log('_infiniteBlockPositions', _infiniteBlockPositions);

  // 1. Create concrete base using ConcreteBuilder
  const concreteGroup = createConcrete(
    scene,
    {
      thickness: concreteThickness,
      width: concreteWidth,
      depth: concreteDepth,
      position: concretePosition,
    },
    columnGroup,
    isFiniteConcrete,
  );
  complexColumn.setConcreteGroup(concreteGroup);

  // 2. Create 2 cuboids that cross each other on top
  // const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  // cuboidMaterial.diffuseColor = new BABYLON.Color3(1, 0.42, 0.42); // #FF6B6B
  // cuboidMaterial.alpha = 0.4;

  // Calculate cuboid position: concrete top (2) + gap (0.5) + height/2 (0.3) = 2.8
  const concreteTopY = 0;
  const cuboidGap = 0;
  const cuboidHeight = 0.3;
  const cuboidCenterY = concreteTopY + cuboidGap + cuboidHeight / 2;

  const cuboid1Pos = new BABYLON.Vector3(0, cuboidCenterY, 0);
  const cuboid2Pos = new BABYLON.Vector3(
    cuboid2TranslateX,
    cuboidCenterY,
    cuboid2TranslateZ,
  );

  const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  cuboidMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // #FF6B6B
  cuboidMaterial.alpha = 0.2;
  cuboidMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  cuboidMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
  // cuboidMaterial.disableLighting = true;
  // cuboidMaterial.rei
  // cuboidMaterial.alphaMode = BABYLON.Engine.alpha_;
  cuboidMaterial.backFaceCulling = false;
  cuboidMaterial.disableLighting = true;

  const doIntersect = checkCuboidIntersection(
    cuboid1Pos,
    cuboid1SizeX,
    cuboid1SizeZ,
    cuboidHeight,
    cuboid2Pos,
    cuboid2SizeX,
    cuboid2SizeZ,
  );

  // if (doIntersect) {
  //   // Create single combined mesh from both cuboids
  //   complexColumn.cuboidsMerged = true;

  //   const combinedMesh = createCombinedCuboidMesh(
  //     scene,
  //     cuboid1Pos,
  //     cuboid1SizeX,
  //     cuboid1SizeZ,
  //     cuboid2Pos,
  //     cuboid2SizeX,
  //     cuboid2SizeZ,
  //     cuboidHeight,
  //     cuboidMaterial
  //   );

  //   combinedMesh.parent = columnGroup;
  //   complexColumn.mergedCuboid = combinedMesh;
  // } else {
  //   // Keep cuboids separate
  //   complexColumn.cuboidsMerged = false;

  //   // First cuboid (along X axis)
  //   const cuboid1 = BABYLON.MeshBuilder.CreateBox('cuboid1', { width: cuboid1SizeX, height: cuboidHeight, depth: cuboid1SizeZ }, scene);
  //   cuboid1.position = cuboid1Pos;
  //   cuboid1.material = cuboidMaterial;
  //   cuboid1.receiveShadows = true;
  //   cuboid1.parent = columnGroup;
  //   complexColumn.setCuboid1(cuboid1);

  //   // Second cuboid (along Z axis)
  //   const cuboid2 = BABYLON.MeshBuilder.CreateBox('cuboid2', { width: cuboid2SizeX, height: cuboidHeight, depth: cuboid2SizeZ }, scene);
  //   cuboid2.position = cuboid2Pos;
  //   cuboid2.material = cuboidMaterial;
  //   cuboid2.receiveShadows = true;
  //   cuboid2.parent = columnGroup;
  //   complexColumn.setCuboid2(cuboid2);
  // }

  // 3. Create posts around the perimeter of cuboids
  const cuboid1Positions = calculateCuboidPostPositions(
    0, // centerX (cuboid1 is centered)
    0, // centerZ (cuboid1 is centered)
    cuboid1SizeX,
    cuboid1SizeZ,
    cuboid1PostCountLeftEdge,
    cuboid1PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2, // baseY (bottom of cuboid)
  );

  const cuboid2Positions = calculateCuboidPostPositions(
    cuboid2TranslateX,
    cuboid2TranslateZ,
    cuboid2SizeX,
    cuboid2SizeZ,
    cuboid2PostCountLeftEdge,
    cuboid2PostCountTopEdge,
    postOffset,
    cuboidCenterY - cuboidHeight / 2, // baseY (bottom of cuboid)
  );

  const allPostPositions = [...cuboid1Positions, ...cuboid2Positions];
  const postHeight = cuboidHeight * 2;

  allPostPositions.forEach(postPos => {
    // Position post at concrete top surface with adjusted Y
    const postPositionY = concreteTopY;
    const adjustedPostPosition = new BABYLON.Vector3(
      postPos.position.x,
      postPositionY,
      postPos.position.z,
    );

    const postGroup = createPost(
      scene,
      postHeight,
      postRadius * 2, // diameter
      adjustedPostPosition,
      undefined,
      columnGroup,
      `complexColumnPost_${postPos.index}`,
    );
    complexColumn.addPost(postGroup.mesh!);
  });

  // 4. Create unit axis node
  const axisNode = createUnitAxes(
    scene,
    complexColumn.group,
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
  );
  complexColumn.setUnitAxisNode(axisNode);

  // 5. Create moments
  createMomens(
    scene,
    concretePosition,
    {
      thickness: concreteThickness,
      width: concreteWidth,
      depth: concreteDepth,
      position: concretePosition,
    },
    complexColumn,
  );

  // 8. Create standing wave on top of the cross shape
  const waveHeight = 0.3;
  const standingWave = createCrossStandingWave(
    scene,
    cuboid1SizeX,
    cuboid1SizeZ,
    cuboid2SizeX,
    cuboid2SizeZ,
    cuboid2TranslateX,
    cuboid2TranslateZ,
    waveHeight,
    cuboidCenterY,
    cuboidHeight,
  );
  standingWave.parent = columnGroup;
  complexColumn.addWaveBlock(standingWave);

  return complexColumn;
};

/**
 * Creates a standing wave surface on the cross shape
 * Includes top wavy surface, bottom flat surface, and side wall skirts
 */
const createCrossStandingWave = (
  scene: BABYLON.Scene,
  cuboid1SizeX: number,
  cuboid1SizeZ: number,
  cuboid2SizeX: number,
  cuboid2SizeZ: number,
  cuboid2TranslateX: number,
  cuboid2TranslateZ: number,
  waveHeight: number,
  centerY: number,
  cuboidHeight: number,
): BABYLON.Mesh => {
  const divU = 50;
  const divV = 10;
  const amp = 0.02;
  const freq = 8;

  const half1X = cuboid1SizeX / 2;
  const half1Z = cuboid1SizeZ / 2;
  const half2X = cuboid2SizeX / 2;
  const half2Z = cuboid2SizeZ / 2;

  const c1MinX = -half1X;
  const c1MaxX = half1X;
  const c1MinZ = -half1Z;
  const c1MaxZ = half1Z;

  const c2MinX = cuboid2TranslateX - half2X;
  const c2MaxX = cuboid2TranslateX + half2X;
  const c2MinZ = cuboid2TranslateZ - half2Z;
  const c2MaxZ = cuboid2TranslateZ + half2Z;

  // Calculate bounding rectangle for the entire cross
  const rectMinX = Math.min(c1MinX, c2MinX);
  const rectMaxX = Math.max(c1MaxX, c2MaxX);
  const rectMinZ = Math.min(c1MinZ, c2MinZ);
  const rectMaxZ = Math.max(c1MaxZ, c2MaxZ);

  const topY = centerY + cuboidHeight / 2;
  const rectWidth = rectMaxX - rectMinX;
  const rectDepth = rectMaxZ - rectMinZ;

  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];

  // Create rectangular standing wave grid
  const xStep = rectWidth / divU;
  const zStep = rectDepth / divV;
  const vertexGrid: number[][] = [];

  // Helper to check if a point is inside the cross shape
  const isInsideCross = (x: number, z: number): boolean => {
    const inC1 = x >= c1MinX && x <= c1MaxX && z >= c1MinZ && z <= c1MaxZ;
    const inC2 = x >= c2MinX && x <= c2MaxX && z >= c2MinZ && z <= c2MaxZ;
    return inC1 || inC2;
  };

  // Calculate wave displacement
  const getWaveDisplacement = (iu: number, iv: number): number => {
    const xWave = Math.sin((iu / divU) * Math.PI * freq) * amp;
    // const zWave = Math.cos((iv / divV) * Math.PI * freq) * amp * 0.7;
    const zWave = 0;
    return xWave + zWave;
  };

  // TOP WAVY SURFACE - vertices only in cross areas
  for (let iv = 0; iv <= divV; iv++) {
    vertexGrid[iv] = [];
    for (let iu = 0; iu <= divU; iu++) {
      const x = rectMinX + iu * xStep;
      const z = rectMinZ + iv * zStep;

      if (isInsideCross(x, z)) {
        const waveDisp = getWaveDisplacement(iu, iv);
        const vertexIndex = positions.length / 3;
        positions.push(x, topY + waveDisp + waveHeight / 2, z);
        uvs.push(iu / divU, iv / divV);
        vertexGrid[iv][iu] = vertexIndex;
      } else {
        vertexGrid[iv][iu] = -1;
      }
    }
  }

  // Create top surface triangles
  for (let iv = 0; iv < divV; iv++) {
    for (let iu = 0; iu < divU; iu++) {
      const a = vertexGrid[iv][iu];
      const b = vertexGrid[iv][iu + 1];
      const c = vertexGrid[iv + 1][iu];
      const d = vertexGrid[iv + 1][iu + 1];

      if (a >= 0 && b >= 0 && c >= 0 && d >= 0) {
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  // BOTTOM FLAT SURFACE - same grid pattern as top
  // const bottomVertexGrid: number[][] = [];

  // for (let iv = 0; iv <= divV; iv++) {
  //   bottomVertexGrid[iv] = [];
  //   for (let iu = 0; iu <= divU; iu++) {
  //     const x = rectMinX + iu * xStep;
  //     const z = rectMinZ + iv * zStep;

  //     if (isInsideCross(x, z)) {
  //       const vertexIndex = positions.length / 3;
  //       positions.push(x, topY - waveHeight / 2, z);
  //       uvs.push(iu / divU, iv / divV);
  //       bottomVertexGrid[iv][iu] = vertexIndex;
  //     } else {
  //       bottomVertexGrid[iv][iu] = -1;
  //     }
  //   }
  // }

  // // Create bottom surface triangles (reversed winding for backface)
  // for (let iv = 0; iv < divV; iv++) {
  //   for (let iu = 0; iu < divU; iu++) {
  //     const a = bottomVertexGrid[iv][iu];
  //     const b = bottomVertexGrid[iv][iu + 1];
  //     const c = bottomVertexGrid[iv + 1][iu];
  //     const d = bottomVertexGrid[iv + 1][iu + 1];

  //     if (a >= 0 && b >= 0 && c >= 0 && d >= 0) {
  //       indices.push(a, c, b);
  //       indices.push(b, c, d);
  //     }
  //   }
  // }

  // SIDE WALLS - create skirts along cross edges
  const addSideWallSkirt = (
    edgeAxis: 'x' | 'z',
    edgePosition: number,
    rangeMin: number,
    rangeMax: number,
  ) => {
    const rangeLength = rangeMax - rangeMin;
    const rangeDivisions = Math.max(
      8,
      Math.ceil(rangeLength / ((cuboid1SizeX + cuboid1SizeZ) / 10)),
    );

    const bottomWallVertices: number[] = [];
    const topWallVertices: number[] = [];

    for (let il = 0; il <= rangeDivisions; il++) {
      let x, z;

      if (edgeAxis === 'x') {
        x = edgePosition;
        z = rangeMin + (il / rangeDivisions) * rangeLength;
      } else {
        x = rangeMin + (il / rangeDivisions) * rangeLength;
        z = edgePosition;
      }

      // Calculate grid indices for wave
      const iu = Math.round(((x - rectMinX) / rectWidth) * divU);
      const iv = Math.round(((z - rectMinZ) / rectDepth) * divV);
      const waveDisp = getWaveDisplacement(iu, iv);

      // Bottom vertex (flat, at cuboid top surface)
      const bottomIdx = positions.length / 3;
      positions.push(x, topY - waveHeight / 2, z);
      uvs.push(il / rangeDivisions, 0);
      bottomWallVertices.push(bottomIdx);

      // Top vertex (wavy, at wave surface)
      const topIdx = positions.length / 3;
      positions.push(x, topY + waveDisp + waveHeight / 2, z);
      uvs.push(il / rangeDivisions, 1);
      topWallVertices.push(topIdx);
    }

    // Create triangles connecting bottom and top
    for (let il = 0; il < rangeDivisions; il++) {
      const b0 = bottomWallVertices[il];
      const b1 = bottomWallVertices[il + 1];
      const t0 = topWallVertices[il];
      const t1 = topWallVertices[il + 1];

      indices.push(b0, t0, b1);
      indices.push(b1, t0, t1);
    }
  };

  // Create skirt walls along all 8 cross edges
  addSideWallSkirt('x', c1MinX, c1MinZ, c1MaxZ); // Left
  addSideWallSkirt('x', c1MaxX, c1MinZ, c1MaxZ); // Right
  addSideWallSkirt('z', c1MinZ, c1MinX, c1MaxX); // Front
  addSideWallSkirt('z', c1MaxZ, c1MinX, c1MaxX); // Back
  addSideWallSkirt('x', c2MinX, c2MinZ, c2MaxZ); // Left
  addSideWallSkirt('x', c2MaxX, c2MinZ, c2MaxZ); // Right
  addSideWallSkirt('z', c2MinZ, c2MinX, c2MaxX); // Front
  addSideWallSkirt('z', c2MaxZ, c2MinX, c2MaxX); // Back

  // Build mesh
  const mesh = new BABYLON.Mesh('crossStandingWave', scene);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.uvs = uvs;

  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  vertexData.normals = normals;

  const waveBlockMaterial = new BABYLON.StandardMaterial(
    'waveBlockMaterial',
    scene,
  );
  waveBlockMaterial.diffuseColor = new BABYLON.Color3(
    214 / 255,
    217 / 255,
    200 / 255,
  ); // tan/beige
  waveBlockMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
  waveBlockMaterial.alpha = 0.2;
  waveBlockMaterial.disableLighting = true;
  waveBlockMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  waveBlockMaterial.backFaceCulling = false;

  vertexData.applyToMesh(mesh);
  mesh.material = waveBlockMaterial;

  return mesh;
};

// Helper function to check if two cuboids intersect
const checkCuboidIntersection = (
  pos1: BABYLON.Vector3,
  size1X: number,
  size1Z: number,
  height: number,
  pos2: BABYLON.Vector3,
  size2X: number,
  size2Z: number,
): boolean => {
  // Check AABB (Axis-Aligned Bounding Box) collision
  const minX1 = pos1.x - size1X / 2;
  const maxX1 = pos1.x + size1X / 2;
  const minZ1 = pos1.z - size1Z / 2;
  const maxZ1 = pos1.z + size1Z / 2;

  const minX2 = pos2.x - size2X / 2;
  const maxX2 = pos2.x + size2X / 2;
  const minZ2 = pos2.z - size2Z / 2;
  const maxZ2 = pos2.z + size2Z / 2;

  // Check if bounding boxes overlap
  return !(maxX1 < minX2 || minX1 > maxX2 || maxZ1 < minZ2 || minZ1 > maxZ2);
};
