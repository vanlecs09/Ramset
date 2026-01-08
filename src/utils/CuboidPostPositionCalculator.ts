import * as BABYLON from '@babylonjs/core';

export interface CuboidPostPosition {
  position: BABYLON.Vector3;
  index: number;
}

/**
 * Calculate post positions around a cuboid perimeter
 * Posts are distributed evenly around the entire perimeter (4 edges)
 * 
 * @param centerX - X coordinate of cuboid center
 * @param centerZ - Z coordinate of cuboid center
 * @param sizeX - Width of cuboid (X direction)
 * @param sizeZ - Depth of cuboid (Z direction)
 * @param postCountLeftEdge - Number of posts along left/right edges (Z direction)
 * @param postCountTopEdge - Number of posts along top/bottom edges (X direction)
 * @param postOffset - Distance from the edge
 * @param baseY - Y coordinate for posts
 * @returns Array of post positions
 */
export const calculateCuboidPostPositions = (
  centerX: number,
  centerZ: number,
  sizeX: number,
  sizeZ: number,
  postCountLeftEdge: number,
  postCountTopEdge: number,
  postOffset: number,
  baseY: number
): CuboidPostPosition[] => {
  const positions: CuboidPostPosition[] = [];
  
  const halfSizeX = sizeX / 2;
  const halfSizeZ = sizeZ / 2;
  
  // Edge positions (offset from perimeter)
  const leftEdgeX = centerX - halfSizeX + postOffset;
  const rightEdgeX = centerX + halfSizeX - postOffset;
  const bottomEdgeZ = centerZ - halfSizeZ + postOffset;
  const topEdgeZ = centerZ + halfSizeZ - postOffset;
  
  let index = 0;
  
  // Calculate spacing for each edge
  // Left/Right edges (along Z axis): postCountLeftEdge posts
  const spacingZ = postCountLeftEdge > 1 ? (2 * halfSizeZ - 2 * postOffset) / (postCountLeftEdge - 1) : 0;
  // Top/Bottom edges (along X axis): postCountTopEdge posts
  const spacingX = postCountTopEdge > 1 ? (2 * halfSizeX - 2 * postOffset) / (postCountTopEdge - 1) : 0;
  
  // 1. Left edge (X = leftEdgeX): postCountLeftEdge posts from bottom to top
  for (let i = 0; i < postCountLeftEdge; i++) {
    const z = bottomEdgeZ + (i * spacingZ);
    positions.push({
      position: new BABYLON.Vector3(leftEdgeX, baseY, z),
      index: index++,
    });
  }
  
  // 2. Top edge (Z = topEdgeZ): postCountTopEdge posts from left to right (excluding left corner)
  for (let i = 1; i < postCountTopEdge; i++) {
    const x = leftEdgeX + (i * spacingX);
    positions.push({
      position: new BABYLON.Vector3(x, baseY, topEdgeZ),
      index: index++,
    });
  }
  
  // 3. Right edge (X = rightEdgeX): postCountLeftEdge posts from top to bottom (excluding top corner)
  for (let i = postCountLeftEdge - 2; i >= 0; i--) {
    const z = bottomEdgeZ + (i * spacingZ);
    positions.push({
      position: new BABYLON.Vector3(rightEdgeX, baseY, z),
      index: index++,
    });
  }
  
  // 4. Bottom edge (Z = bottomEdgeZ): postCountTopEdge posts from right to left (excluding right corner and left corner)
  for (let i = postCountTopEdge - 2; i > 0; i--) {
    const x = leftEdgeX + (i * spacingX);
    positions.push({
      position: new BABYLON.Vector3(x, baseY, bottomEdgeZ),
      index: index++,
    });
  }
  
  return positions;
};

/**
 * Calculate total number of posts for a cuboid perimeter
 * Total = posts on all 4 edges, excluding corner overlaps
 */
export const calculateCuboidPostCount = (
  postCountLeftEdge: number,
  postCountTopEdge: number
): number => {
  // Total = 2 * left edges + 2 * top edges - 4 corners (shared)
  // = 2 * postCountLeftEdge + 2 * postCountTopEdge - 4
  return 2 * postCountLeftEdge + 2 * postCountTopEdge - 4;
};
