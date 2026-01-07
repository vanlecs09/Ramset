import * as BABYLON from '@babylonjs/core';

export interface PostPosition {
    position: BABYLON.Vector3;
    index: number;
}

export const calculateCircularPostPositions = (
    cylinderRadius: number,
    circumferenceToPostOffset: number,
    postCount: number,
    baseY: number
): PostPosition[] => {
    const positions: PostPosition[] = [];
    const angle = (Math.PI * 2) / postCount;

    for (let i = 0; i < postCount; i++) {
        const theta = i * angle;
        const x = Math.cos(theta) * (cylinderRadius - circumferenceToPostOffset);
        const z = Math.sin(theta) * (cylinderRadius - circumferenceToPostOffset);

        positions.push({
            position: new BABYLON.Vector3(x, baseY, z),
            index: i,
        });
    }

    return positions;
};


export const calculateRectanglePostPositions = (
    columnWidth: number,
    columnDepth: number,
    postCountX: number,
    postCountZ: number,
    postOffset: number,
    baseY: number
): PostPosition[] => {
    const positions: PostPosition[] = [];
    const positionSet = new Set<string>(); // To track unique positions

    const halfWidth = columnWidth / 2;
    const halfDepth = columnDepth / 2;

    // Calculate spacing
    const spacingX = postCountX > 1 ? (columnWidth - 2 * postOffset) / (postCountX - 1) : 0;
    const spacingZ = postCountZ > 1 ? (columnDepth - 2 * postOffset) / (postCountZ - 1) : 0;

    let index = 0;

    // Generate grid positions
    for (let ix = 0; ix < postCountX; ix++) {
        for (let iz = 0; iz < postCountZ; iz++) {
            const x = postCountX > 1
                ? -halfWidth + postOffset + (ix * spacingX)
                : 0;
            const z = postCountZ > 1
                ? -halfDepth + postOffset + (iz * spacingZ)
                : 0;

            // Create a unique key for this position to eliminate duplicates
            const posKey = `${x.toFixed(4)},${z.toFixed(4)}`;

            if (!positionSet.has(posKey)) {
                positionSet.add(posKey);
                positions.push({
                    position: new BABYLON.Vector3(x, baseY, z),
                    index: index++,
                });
            }
        }
    }

    return positions;
};
