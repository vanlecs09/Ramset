import * as BABYLON from '@babylonjs/core';

/**
 * Split point on an edge of the rectangle
 * edge: 'left' | 'right' | 'top' | 'bottom'
 * position: 0 to 1 (normalized position along the edge)
 */
export interface SplitPoint {
  edge: 'left' | 'right' | 'top' | 'bottom';
  position: number; // 0 to 1
}

/**
 * Creates a rectangular plane split by a diagonal line with two different colors
 * @param scene - Babylon.js scene
 * @param width - Width of the rectangle (along X-axis)
 * @param depth - Depth of the rectangle (along Z-axis)
 * @param position - Center position of the rectangle
 * @param splitPoint1 - First point on an edge (creates diagonal with splitPoint2)
 * @param splitPoint2 - Second point on opposite edge
 * @param leftColor - Color for one side (default: gray)
 * @param rightColor - Color for other side (default: orange)
 * @returns Babylon.js Mesh representing the split rectangle
 */
export const createSplitRectangle = (
  scene: BABYLON.Scene,
  width: number,
  depth: number,
  position: BABYLON.Vector3,
  splitPoint1: BABYLON.Vector2,//
  splitPoint2: BABYLON.Vector2,
  leftColor: BABYLON.Color3 = new BABYLON.Color3(0.5, 0.5, 0.5), // Gray
  rightColor: BABYLON.Color3 = new BABYLON.Color3(1, 0.5, 0), // Orange
): BABYLON.Mesh => {
  const positions: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  // Calculate half dimensions
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  
  // Get coordinates for both split points
  const [x1, z1] = [splitPoint1.x, splitPoint1.y]//getPointCoordinates(splitPoint1);
  const [x2, z2] = [splitPoint2.x, splitPoint2.y]//getPointCoordinates(splitPoint2);

  // Define the 4 corners of the rectangle
  const corners = [
    [-halfWidth, -halfDepth], // Bottom-left (0)
    [halfWidth, -halfDepth],  // Bottom-right (1)
    [halfWidth, halfDepth],   // Top-right (2)
    [-halfWidth, halfDepth],  // Top-left (3)
  ];

  // Helper function to determine which side of the line a point is on
  // Returns positive if on right side, negative if on left side
  const getSide = (px: number, pz: number): number => {
    return (x2 - x1) * (pz - z1) - (z2 - z1) * (px - x1);
  };

  // Determine which corners are on which side
  const cornerSides = corners.map(([x, z]) => getSide(x, z));

  // Create split point vertices
  const splitPoint1Vertex: [number, number] = [x1, z1] ;
  const splitPoint2Vertex: [number, number] = [x2, z2] ;

  // Build triangulation based on which corners are on which side
  // We need to create polygons on each side of the diagonal line
  
  // Collect vertices for left side (negative side values)
  const leftVertices: [number, number][] = [];
  const rightVertices: [number, number][] = [];

  // Add split points to both sides
  leftVertices.push(splitPoint1Vertex);
  rightVertices.push(splitPoint1Vertex);

  // Check each corner and assign to appropriate side
  for (let i = 0; i < 4; i++) {
    if (cornerSides[i] < -0.0001) {
      leftVertices.push(corners[i] as [number, number]);
    } else if (cornerSides[i] > 0.0001) {
      rightVertices.push(corners[i] as [number, number]);
    } else {
      // Point is on the line
      leftVertices.push(corners[i] as [number, number]);
      rightVertices.push(corners[i] as [number, number]);
    }
  }

  leftVertices.push(splitPoint2Vertex);
  rightVertices.push(splitPoint2Vertex);

  // Sort vertices by angle from center for proper triangulation
  const sortByAngle = (vertices: [number, number][]) => {
    const center = vertices.reduce(
      (acc, v) => [acc[0] + v[0], acc[1] + v[1]],
      [0, 0]
    ).map(v => v / vertices.length) as [number, number];
    
    return vertices.sort((a, b) => {
      const angleA = Math.atan2(a[1] - center[1], a[0] - center[0]);
      const angleB = Math.atan2(b[1] - center[1], b[0] - center[0]);
      return angleA - angleB;
    });
  };

  const sortedLeftVertices = sortByAngle([...leftVertices]);
  const sortedRightVertices = sortByAngle([...rightVertices]);

  // Add left side vertices and triangulate
  const leftStartIndex = positions.length / 3;
  sortedLeftVertices.forEach(([x, z]) => {
    positions.push(x + position.x, position.y, z + position.z);
    colors.push(leftColor.r, leftColor.g, leftColor.b, 1);
  });

  // Triangulate left polygon (fan triangulation from first vertex)
  for (let i = 1; i < sortedLeftVertices.length - 1; i++) {
    indices.push(leftStartIndex, leftStartIndex + i, leftStartIndex + i + 1);
  }

  // Add right side vertices and triangulate
  const rightStartIndex = positions.length / 3;
  sortedRightVertices.forEach(([x, z]) => {
    positions.push(x + position.x, position.y, z + position.z);
    colors.push(rightColor.r, rightColor.g, rightColor.b, 1);
  });

  // Triangulate right polygon (fan triangulation from first vertex)
  for (let i = 1; i < sortedRightVertices.length - 1; i++) {
    indices.push(rightStartIndex, rightStartIndex + i, rightStartIndex + i + 1);
  }

  // Create mesh
  const mesh = new BABYLON.Mesh('splitRectangle', scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
  mesh.setIndices(indices);

  // Compute normals
  const normals: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);

  // Create material that uses vertex colors
  const material = new BABYLON.StandardMaterial('splitRectMaterial', scene);
  material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  material.backFaceCulling = false; // Show both sides
  mesh.material = material;

  return mesh;
};

