import * as BABYLON from '@babylonjs/core';

export interface RectanglePostPosition {
    position: BABYLON.Vector3;
    index: number;
}

export const calculateRectanglePostPositions = (
    columnWidth: number,
    columnDepth: number,
    postCountX: number,
    postCountZ: number,
    postOffset: number,
    baseY: number
): RectanglePostPosition[] => {
    const positions: RectanglePostPosition[] = [];
    const halfWidth = columnWidth / 2;
    const halfDepth = columnDepth / 2;

    let index = 0;

    // Posts are positioned at the edges with postOffset distance from the edge
    const edgeX = halfWidth - postOffset;
    const edgeZ = halfDepth - postOffset;

    // Calculate spacing between posts on each edge
    const spacingX = postCountX > 1 ? (2 * edgeX) / (postCountX - 1) : 0;
    const spacingZ = postCountZ > 1 ? (2 * edgeZ) / (postCountZ - 1) : 0;

    // Bottom edge (Z = -edgeZ): postCountX posts from left to right
    for (let i = 0; i < postCountX; i++) {
        const x = -edgeX + (i * spacingX);
        const z = -edgeZ;
        positions.push({
            position: new BABYLON.Vector3(x, baseY, z),
            index: index++,
        });
    }

    // Right edge (X = edgeX): postCountZ posts from bottom to top (excluding corner)
    for (let i = 1; i < postCountZ; i++) {
        const x = edgeX;
        const z = -edgeZ + (i * spacingZ);
        positions.push({
            position: new BABYLON.Vector3(x, baseY, z),
            index: index++,
        });
    }

    // Top edge (Z = edgeZ): postCountX posts from right to left (excluding corner)
    for (let i = postCountX - 2; i >= 0; i--) {
        const x = -edgeX + (i * spacingX);
        const z = edgeZ;
        positions.push({
            position: new BABYLON.Vector3(x, baseY, z),
            index: index++,
        });
    }

    // Left edge (X = -edgeX): postCountZ posts from top to bottom (excluding both corners)
    for (let i = postCountZ - 2; i >= 1; i--) {
        const x = -edgeX;
        const z = -edgeZ + (i * spacingZ);
        positions.push({
            position: new BABYLON.Vector3(x, baseY, z),
            index: index++,
        });
    }

    return positions;
};
