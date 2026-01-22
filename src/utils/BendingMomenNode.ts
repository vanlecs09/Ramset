import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createLine, createLineArrow } from './GeometryHelper';
import { getDimensionLabelTexture } from './ConcreteNode';

/**
 * Class representing a bending moment visualization node.
 * Combines dotted line and arrow head for moment representation.
 * Manages resources and lifecycle.
 */
export class BendingMomentNode {
    readonly group: BABYLON.TransformNode;
    readonly meshes: BABYLON.Mesh[];
    readonly dottedLine: BABYLON.Mesh[];
    readonly arrow: BABYLON.Mesh;
    readonly label?: GUI.TextBlock | null;
    readonly labels: GUI.TextBlock[];
    private isDisposed: boolean = false;

    /**
     * Creates a new BendingMomentNode instance.
     */
    constructor(
        group: BABYLON.TransformNode,
        meshes: BABYLON.Mesh[],
        dottedLine: BABYLON.Mesh[],
        arrow: BABYLON.Mesh,
        label?: GUI.TextBlock | null,
        labels?: GUI.TextBlock[]
    ) {
        this.group = group;
        this.meshes = meshes;
        this.dottedLine = dottedLine;
        this.arrow = arrow;
        this.label = label;
        this.labels = labels || [];
    }

    /**
     * Disposes of all resources (meshes, labels, and transform node).
     * Should be called before discarding the instance to prevent memory leaks.
     */
    dispose(): void {
        if (this.isDisposed) return;

        // Dispose all meshes
        this.meshes.forEach(mesh => {
            if (mesh && !mesh.isDisposed()) {
                mesh.dispose();
            }
        });

        // Dispose labels
        this.labels.forEach(label => {
            if (label) {
                label.dispose();
            }
        });

        // Dispose transform group
        if (this.group && !this.group.isDisposed()) {
            this.group.dispose();
        }

        this.isDisposed = true;
    }

    /**
     * Checks if the node has been disposed.
     */
    getIsDisposed(): boolean {
        return this.isDisposed;
    }
}

/**
 * Constants for bending moment visualization
 */
export const BENDING_MOMENT_CONSTANTS = {
    DOT_SPACING: 0.1,        // Distance between dots
    DOT_RADIUS: 0.003,       // Radius of dot lines
    LINE_THICKNESS: 0.003,   // Thickness of connecting lines between dots
    ARROW_SIZE: 0.03,        // Size of arrow head
    ARROW_DIAMETER: 0.02,    // Diameter of arrow cone
    MATERIAL_COLOR: new BABYLON.Color3(0, 0, 0), // Black color
    LABEL_FONT_SIZE: 16,     // Font size for label
    LABEL_OFFSET_X: 10,      // Horizontal offset from arrow
    LABEL_OFFSET_Y: -15,     // Vertical offset from arrow
} as const;

/**
 * Creates a bending moment visualization consisting of a dotted line and arrow head.
 * The dotted line extends from the given position with specified length.
 * An arrow is placed at the end pointing along the line direction.
 * A label can be optionally displayed above the arrow.
 * 
 * @param scene - The Babylon.js scene
 * @param position - Starting position of the bending moment line
 * @param length - Total length of the bending moment visualization
 * @param direction - Direction vector for the line (defaults to X-axis)
 * @param color - Color for the visualization (defaults to black)
 * @param labelText - Optional text for the label (if not provided, no label is created)
 * @returns BendingMomentNode containing all meshes and group
 */
export const createBendingMomenNode = (
    scene: BABYLON.Scene,
    position: BABYLON.Vector3,
    length: number = 1,
    direction: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0),
    color: BABYLON.Color3 = BENDING_MOMENT_CONSTANTS.MATERIAL_COLOR,
    labelText?: string
): BendingMomentNode => {
    const group = new BABYLON.TransformNode('BendingMomentGroup', scene);
    const meshes: BABYLON.Mesh[] = [];
    const dottedLineMeshes: BABYLON.Mesh[] = [];
    const labels: GUI.TextBlock[] = [];

    // Normalize direction
    const normalizedDirection = BABYLON.Vector3.Normalize(direction);

    // Create material for the visualization
    const material = new BABYLON.StandardMaterial('bendingMomentMat', scene);
    material.diffuseColor = color;

    // Create dotted line from position with specified length
    const dotCount = Math.ceil(length / BENDING_MOMENT_CONSTANTS.DOT_SPACING);
    const dotSpacing = length / dotCount; // Adjust spacing to fit exactly

    for (let i = 0; i < dotCount; i++) {
        const dotStart = position.add(
            normalizedDirection.scale(i * dotSpacing)
        );
        const dotEnd = position.add(
            normalizedDirection.scale((i + 0.5) * dotSpacing)
        );

        // Create individual dot segment
        const dot = createLine(
            dotStart,
            dotEnd,
            `bendingMoment_dot_${i}`,
            BENDING_MOMENT_CONSTANTS.DOT_RADIUS,
            scene,
            material
        );
        dot.parent = group;
        dottedLineMeshes.push(dot);
        meshes.push(dot);
    }

    // Create arrow at the end of the line
    const arrowPosition = position.add(normalizedDirection.scale(length));
    const arrowLine = createLineArrow(
        arrowPosition,
        arrowPosition.add(normalizedDirection.scale(0.1)),
        'bendingMoment_arrow',
        scene,
        material
    );
    arrowLine.line.parent = group;
    arrowLine.arrow.parent = group;
    meshes.push(arrowLine.line);
    meshes.push(arrowLine.arrow);

    // Create label if text is provided
    let label: GUI.TextBlock | null = null;
    if (labelText) {
        label = createBendingMomentLabel(arrowLine.arrow, labelText);
        if (label) {
            labels.push(label);
        }
    }

    return new BendingMomentNode(group, meshes, dottedLineMeshes, arrowLine.arrow, label, labels);
};

/**
 * Creates a GUI label for the bending moment.
 * Label is linked to the arrow position.
 * @private
 */
const createBendingMomentLabel = (
    arrowMesh: BABYLON.Mesh,
    labelText: string
): GUI.TextBlock | null => {
    try {
        const texture = getDimensionLabelTexture();
        const label = new GUI.TextBlock();
        label.text = labelText;
        label.color = 'black';
        label.fontSize = BENDING_MOMENT_CONSTANTS.LABEL_FONT_SIZE;

        texture.addControl(label);
        label.linkWithMesh(arrowMesh);
        label.linkOffsetX = BENDING_MOMENT_CONSTANTS.LABEL_OFFSET_X;
        label.linkOffsetY = BENDING_MOMENT_CONSTANTS.LABEL_OFFSET_Y;

        return label;
    } catch (error) {
        console.warn('Failed to create bending moment label:', error);
        return null;
    }
};