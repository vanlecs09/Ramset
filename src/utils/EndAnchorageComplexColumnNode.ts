import * as BABYLON from '@babylonjs/core';
import { BaseStructNodeImpl } from './BaseNode';
import { createConcrete, type ConcreteParams } from './ConcreteNode';
import type { ConcreteNode } from './ConcreteNode';
import { createPost, type PostParam } from './PostNode';
import { createUnitAxes } from './UnitAxisNode';
import { createMomens } from './BaseEndAnchorageNode';

export interface ComplexColumnParam {
  cuboid1SizeX?: number;
  cuboid1SizeZ?: number;
  cuboid2SizeX?: number;
  cuboid2SizeZ?: number;
  cuboid2TranslateX?: number;
  cuboid2TranslateZ?: number;
}

export class EndAnchorageComplexColumnNode extends BaseStructNodeImpl {
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

export const createEnAnchorageComplexColumn = (
  scene: BABYLON.Scene,
  concreteParams: ConcreteParams,
  params: ComplexColumnParam,
  postParam: PostParam,
): EndAnchorageComplexColumnNode => {
  // Extract parameters with defaults
  const cuboid1SizeX = params.cuboid1SizeX ?? 2;
  const cuboid1SizeZ = params.cuboid1SizeZ ?? 2;
  const cuboid2SizeX = params.cuboid2SizeX ?? 2;
  const cuboid2SizeZ = params.cuboid2SizeZ ?? 2;
  const cuboid2TranslateX = params.cuboid2TranslateX ?? 0;
  const cuboid2TranslateZ = params.cuboid2TranslateZ ?? 0;

  // Extract concrete parameters
  const concretePosition = concreteParams.position;
  const isBounded = concreteParams.isBounded;

  const columnGroup = new BABYLON.TransformNode('complexColumn', scene);
  const complexColumn = new EndAnchorageComplexColumnNode(columnGroup);

  // 1. Create concrete base using ConcreteBuilder
  const concreteGroup = createConcrete(
    scene,
    concreteParams,
    columnGroup,
    !isBounded,
  );
  complexColumn.setConcreteGroup(concreteGroup);

  // 2. Create 2 cuboids that cross each other on top
  // const cuboidMaterial = new BABYLON.StandardMaterial('cuboidMaterial', scene);
  // cuboidMaterial.diffuseColor = new BABYLON.Color3(1, 0.42, 0.42); // #FF6B6B
  // cuboidMaterial.alpha = 0.4;

  // Calculate cuboid position: concrete top (2) + gap (0.5) + height/2 (0.3) = 2.8
  const concreteTopY = 0;
  const waveHeight = 0.3 + 0.1;
  const cuboidCenterY = concreteTopY + waveHeight / 2;

  // 8. Create standing wave on top of the cross shape

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
    0,
  );

  // 3. Create posts around the perimeter of cuboids
  postParam.postPositions.forEach((postPos: BABYLON.Vector3, index: number) => {
    // Position post at concrete top surface with adjusted Y
    const postPositionY = concreteTopY;
    const adjustedPostPosition = new BABYLON.Vector3(
      postPos.x,
      postPositionY,
      postPos.z,
    );

    const postGroup = createPost(
      scene,
      postParam.postHeight,
      postParam.postRadius * 2, // diameter
      adjustedPostPosition,
      undefined,
      columnGroup,
      `complexColumnPost_${index}`,
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
  createMomens(scene, concretePosition, concreteParams, complexColumn);

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
  const divV = 50;
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
    const zWave = Math.cos((iv / divV) * Math.PI * freq) * amp * 0.7;
    // const zWave = 0;
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
  const bottomVertexGrid: number[][] = [];

  for (let iv = 0; iv <= divV; iv++) {
    bottomVertexGrid[iv] = [];
    for (let iu = 0; iu <= divU; iu++) {
      const x = rectMinX + iu * xStep;
      const z = rectMinZ + iv * zStep;

      if (isInsideCross(x, z)) {
        const vertexIndex = positions.length / 3;
        positions.push(x, topY - waveHeight / 2, z);
        uvs.push(iu / divU, iv / divV);
        bottomVertexGrid[iv][iu] = vertexIndex;
      } else {
        bottomVertexGrid[iv][iu] = -1;
      }
    }
  }

  // Create bottom surface triangles (reversed winding for backface)
  for (let iv = 0; iv < divV; iv++) {
    for (let iu = 0; iu < divU; iu++) {
      const a = bottomVertexGrid[iv][iu];
      const b = bottomVertexGrid[iv][iu + 1];
      const c = bottomVertexGrid[iv + 1][iu];
      const d = bottomVertexGrid[iv + 1][iu + 1];

      if (a >= 0 && b >= 0 && c >= 0 && d >= 0) {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  // SIDE WALLS - Create walls around each cuboid perimeter separately
  // If cuboids don't overlap, this is much simpler than extracting complex borders

  // Helper to check if two cuboids overlap
  const cuboidsOverlap = (): boolean => {
    const overlapX = !(c1MaxX < c2MinX || c2MaxX < c1MinX);
    const overlapZ = !(c1MaxZ < c2MinZ || c2MaxZ < c1MinZ);
    return overlapX && overlapZ;
  };

  const overlap = cuboidsOverlap();
  console.log(`Cuboids overlap: ${overlap}`);

  if (!overlap) {
    // Simple case: Create walls for each cuboid separately
    const createWallsForCuboid = (
      minX: number,
      maxX: number,
      minZ: number,
      maxZ: number,
    ) => {
      // Find grid indices that correspond to this cuboid's boundaries
      const edges = [
        // Left edge (X = minX)
        { axis: 'x', value: minX, dir: 'z', start: minZ, end: maxZ },
        // Right edge (X = maxX)
        { axis: 'x', value: maxX, dir: 'z', start: minZ, end: maxZ },
        // Bottom edge (Z = minZ)
        { axis: 'z', value: minZ, dir: 'x', start: minX, end: maxX },
        // Top edge (Z = maxZ)
        { axis: 'z', value: maxZ, dir: 'x', start: minX, end: maxX },
      ];

      edges.forEach(edge => {
        const topIndices: number[] = [];
        const bottomIndices: number[] = [];

        if (edge.axis === 'x') {
          // Vertical edge (constant X, varying Z)
          const iu = Math.round(((edge.value - rectMinX) / rectWidth) * divU);
          for (let iv = 0; iv <= divV; iv++) {
            const z = rectMinZ + iv * zStep;
            if (z >= edge.start && z <= edge.end) {
              const topIdx = vertexGrid[iv]?.[iu];
              const bottomIdx = bottomVertexGrid[iv]?.[iu];
              if (topIdx >= 0 && bottomIdx >= 0) {
                topIndices.push(topIdx);
                bottomIndices.push(bottomIdx);
              }
            }
          }
        } else {
          // Horizontal edge (constant Z, varying X)
          const iv = Math.round(((edge.value - rectMinZ) / rectDepth) * divV);
          for (let iu = 0; iu <= divU; iu++) {
            const x = rectMinX + iu * xStep;
            if (x >= edge.start && x <= edge.end) {
              const topIdx = vertexGrid[iv]?.[iu];
              const bottomIdx = bottomVertexGrid[iv]?.[iu];
              if (topIdx >= 0 && bottomIdx >= 0) {
                topIndices.push(topIdx);
                bottomIndices.push(bottomIdx);
              }
            }
          }
        }

        // Create wall quads
        for (let i = 0; i < topIndices.length - 1; i++) {
          const topA = topIndices[i];
          const topB = topIndices[i + 1];
          const bottomA = bottomIndices[i];
          const bottomB = bottomIndices[i + 1];

          if (topA >= 0 && topB >= 0 && bottomA >= 0 && bottomB >= 0) {
            indices.push(topA, bottomA, topB);
            indices.push(topB, bottomA, bottomB);
          }
        }
      });
    };

    // Create walls for both cuboids
    createWallsForCuboid(c1MinX, c1MaxX, c1MinZ, c1MaxZ);
    createWallsForCuboid(c2MinX, c2MaxX, c2MinZ, c2MaxZ);

    console.log('Created simple walls for non-overlapping cuboids');
  } else {
    // Complex case: Extract border edges for overlapping cuboids
    
    // Helper to collect edge vertices in order
    const collectEdgeVertices = (
      cellIndices: Array<[number, number]>,
      topGrid: number[][],
      bottomGrid: number[][],
    ): { topIndices: number[]; bottomIndices: number[] } => {
      const topIndices: number[] = [];
      const bottomIndices: number[] = [];

      for (const [iu, iv] of cellIndices) {
        const topIdx = topGrid[iv][iu];
        const bottomIdx = bottomGrid[iv][iu];
        if (topIdx >= 0 && bottomIdx >= 0) {
          topIndices.push(topIdx);
          bottomIndices.push(bottomIdx);
        }
      }

      return { topIndices, bottomIndices };
    };

    // Scan vertexGrid to find boundary vertices
    const boundaryVertices = new Set<number>();

    for (let iv = 0; iv <= divV; iv++) {
      for (let iu = 0; iu <= divU; iu++) {
        const vertexIdx = vertexGrid[iv][iu];

        if (vertexIdx >= 0) {
          let isBoundary = false;

          const neighbors = [
            [iu - 1, iv],
            [iu + 1, iv],
            [iu, iv - 1],
            [iu, iv + 1],
            [iu - 1, iv - 1],
            [iu - 1, iv + 1],
            [iu + 1, iv - 1],
            [iu + 1, iv + 1],
          ];

          for (const [nIu, nIv] of neighbors) {
            if (
              nIu < 0 ||
              nIu > divU ||
              nIv < 0 ||
              nIv > divV ||
              vertexGrid[nIv]?.[nIu] === -1
            ) {
              isBoundary = true;
              break;
            }
          }

          if (isBoundary) {
            boundaryVertices.add(iu * 10000 + iv);
          }
        }
      }
    }

    console.log(`Found ${boundaryVertices.size} boundary vertex positions`);
    
    // Extract 12 continuous border edge sequences from boundary
    // Trace each boundary segment in perimeter order
    const extractBorderEdges = (): Array<{
      topIndices: number[];
      bottomIndices: number[];
    }> => {
      const edges: Array<{ topIndices: number[]; bottomIndices: number[] }> =
        [];
      const visited = new Set<number>();

      // For each boundary vertex, trace a continuous edge segment
      for (const encoded of boundaryVertices) {
        if (visited.has(encoded)) continue;

        const iv = encoded % 10000;
        const iu = Math.floor(encoded / 10000);

        // Trace this edge segment by following boundary vertices
        const edgeCells: Array<[number, number]> = [];
        let currentIu = iu;
        let currentIv = iv;
        let direction = 0; // 0=right, 1=down, 2=left, 3=up

        const maxSteps = 200;
        let steps = 0;

        while (steps < maxSteps) {
          edgeCells.push([currentIu, currentIv]);
          visited.add(currentIu * 10000 + currentIv);

          // Try to move to next boundary vertex
          let foundNext = false;

          // Try 4 directions in order (prefer continuing in same direction)
          const tryDirections = [
            direction,
            (direction + 1) % 4,
            (direction + 3) % 4,
            (direction + 2) % 4,
          ];

          for (const d of tryDirections) {
            let nextIu = currentIu;
            let nextIv = currentIv;

            if (d === 0)
              nextIu++; // right
            else if (d === 1)
              nextIv++; // down
            else if (d === 2)
              nextIu--; // left
            else if (d === 3) nextIv--; // up

            const nextEncoded = nextIu * 10000 + nextIv;

            if (
              nextIu >= 0 &&
              nextIu <= divU &&
              nextIv >= 0 &&
              nextIv <= divV &&
              vertexGrid[nextIv]?.[nextIu] !== undefined &&
              vertexGrid[nextIv][nextIu] >= 0 &&
              boundaryVertices.has(nextEncoded)
            ) {
              currentIu = nextIu;
              currentIv = nextIv;
              direction = d;
              foundNext = true;
              break;
            }
          }

          if (!foundNext || edgeCells.length > divU + divV) {
            break; // End of edge segment
          }

          steps++;
        }

        if (edgeCells.length > 2) {
          const edge = collectEdgeVertices(
            edgeCells,
            vertexGrid,
            bottomVertexGrid,
          );
          if (edge.topIndices.length > 0) {
            edges.push(edge);
          }
        }
      }

      return edges;
    };

    const borderEdgesExtracted = extractBorderEdges();
    console.log(
      `Extracted ${borderEdgesExtracted.length} border edges from vertexGrid`,
    );

    // Create walls from extracted border edges
    const addWallFromEdge = (
      topEdgeIndices: number[],
      bottomEdgeIndices: number[],
    ) => {
      const edgeLength = Math.min(
        topEdgeIndices.length,
        bottomEdgeIndices.length,
      );

      for (let i = 0; i < edgeLength - 1; i++) {
        const topA = topEdgeIndices[i];
        const topB = topEdgeIndices[i + 1];
        const bottomA = bottomEdgeIndices[i];
        const bottomB = bottomEdgeIndices[i + 1];

        if (topA >= 0 && topB >= 0 && bottomA >= 0 && bottomB >= 0) {
          // Two triangles per quad
          indices.push(topA, bottomA, topB);
          indices.push(topB, bottomA, bottomB);
        }
      }
    };

    // Create all wall segments
    borderEdgesExtracted.forEach(edge => {
      addWallFromEdge(edge.topIndices, edge.bottomIndices);
    });

    console.log('Created walls from extracted border edges for overlapping cuboids');
  }

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
  waveBlockMaterial.alpha = 0.4;
  // waveBlockMaterial.disableLighting = true;
  waveBlockMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  waveBlockMaterial.backFaceCulling = false;
  waveBlockMaterial.cullBackFaces = false;

  vertexData.applyToMesh(mesh);
  mesh.material = waveBlockMaterial;

  return mesh;
};
