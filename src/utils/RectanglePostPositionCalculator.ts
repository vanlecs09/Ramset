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

/**
 * Calculate post positions on the Y surface (top) of column heading towards Z axis
 * Posts distributed across the width (X-axis) and height (Y-axis) of the column
 * @param columnWidth - Width of the column (X-axis span)
 * @param columnHeight - Height of the column (Y-axis span)
 * @param postCountX - Number of posts along the width
 * @param postCountY - Number of posts along the height
 * @param postOffset - Distance offset from the column edges
 * @param baseZ - Z position (front or back surface of column)
 */
export const calculateYSurfacePostPositions = (
    columnWidth: number,
    columnHeight: number,
    postCountX: number,
    postCountY: number,
    postOffset: number,
    baseZ: number
): RectanglePostPosition[] => {
    const positions: RectanglePostPosition[] = [];
    const halfWidth = columnWidth / 2;
    const halfHeight = columnHeight / 2;

    let index = 0;

    // Posts are positioned at the edges with postOffset distance from the edge
    const edgeX = halfWidth - postOffset;
    const edgeY = halfHeight - postOffset;

    // Calculate spacing between posts
    const spacingX = postCountX > 1 ? (2 * edgeX) / (postCountX - 1) : 0;
    const spacingY = postCountY > 1 ? (2 * edgeY) / (postCountY - 1) : 0;

    // Bottom edge (Y = -edgeY): postCountX posts from left to right
    for (let i = 0; i < postCountX; i++) {
        const x = -edgeX + (i * spacingX);
        const y = -edgeY;
        positions.push({
            position: new BABYLON.Vector3(x, y, baseZ),
            index: index++,
        });
    }

    // Right edge (X = edgeX): postCountY posts from bottom to top (excluding corner)
    for (let i = 1; i < postCountY; i++) {
        const x = edgeX;
        const y = -edgeY + (i * spacingY);
        positions.push({
            position: new BABYLON.Vector3(x, y, baseZ),
            index: index++,
        });
    }

    // Top edge (Y = edgeY): postCountX posts from right to left (excluding corner)
    for (let i = postCountX - 2; i >= 0; i--) {
        const x = -edgeX + (i * spacingX);
        const y = edgeY;
        positions.push({
            position: new BABYLON.Vector3(x, y, baseZ),
            index: index++,
        });
    }

    // Left edge (X = -edgeX): postCountY posts from top to bottom (excluding both corners)
    for (let i = postCountY - 2; i >= 1; i--) {
        const x = -edgeX;
        const y = -edgeY + (i * spacingY);
        positions.push({
            position: new BABYLON.Vector3(x, y, baseZ),
            index: index++,
        });
    }

    return positions;
};
