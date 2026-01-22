import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { getDimensionLabelTexture } from './ConcreteBuilder';

/**
 * Arc direction enumeration for torsion moment visualization.
 * Determines whether the arc points forward or backward along the direction vector.
 */
export const ArcDirection = {
    FORWARD: 1,   // Arc points in the positive direction
    BACKWARD: -1  // Arc points in the negative direction
} as const;

export type ArcDirection = typeof ArcDirection[keyof typeof ArcDirection];

/**
 * Class representing a torsion moment visualization node.
 * Manages arc, arrow indicator, label, and resource lifecycle.
 */
export class TorsionMomentNode {
    readonly group: BABYLON.TransformNode;
    readonly arc: BABYLON.Mesh;
    readonly arrow: BABYLON.Mesh;
    readonly label?: GUI.TextBlock | null;
    readonly meshes: BABYLON.Mesh[];
    readonly labels: GUI.TextBlock[];
    private isDisposed: boolean = false;

    /**
     * Creates a new TorsionMomentNode instance.
     */
    constructor(
        group: BABYLON.TransformNode,
        arc: BABYLON.Mesh,
        arrow: BABYLON.Mesh,
        meshes: BABYLON.Mesh[],
        label?: GUI.TextBlock | null,
        labels?: GUI.TextBlock[]
    ) {
        this.group = group;
        this.arc = arc;
        this.arrow = arrow;
        this.label = label;
        this.meshes = meshes;
        this.labels = labels || [];
    }

    /**
     * Disposes of all resources (meshes, labels, and transform node).
     * Should be called before discarding the instance to prevent memory leaks.
     */
    dispose(): void {
        if (this.isDisposed) return;

        // Dispose meshes
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
 * Default values for torsion moment visualization
 */
export const TORSION_MOMENT_CONSTANTS = {
    ARC_RADIUS: 0.06,
    ARC_THICKNESS: 0.003,
    ARC_ANGLE: 270,
    ARROW_SIZE: 0.05,
    ARROW_DIAMETER: 0.05,
    ARC_SEGMENTS: 60,
    ARC_TESSELLATION: 16,
    LABEL_FONT_SIZE: 18,
    LABEL_OFFSET_X: 15,
    LABEL_OFFSET_Y: -15,
} as const;

/**
 * Creates a torsion moment visualization with an arc and directional arrow.
 * The arc is drawn in a plane perpendicular to the given direction.
 * The arrow indicates the direction of the moment (forward or backward).
 * 
 * @param name - Base name for generated meshes
 * @param scene - The Babylon.js scene
 * @param centerPosition - Center position of the arc
 * @param direction - Direction vector defining the arc plane
 * @param arcRadius - Radius of the arc (default: 0.06)
 * @param arcThickness - Thickness of the arc line (default: 0.003)
 * @param arcAngle - Arc angle in degrees (default: 270)
 * @param arcDir - Direction the arc points: FORWARD or BACKWARD (default: FORWARD)
 * @param material - Material for the arc and arrow visualization
 * @param labelText - Optional text for the label
 * @returns TorsionMomentNode containing arc, arrow, label, and all meshes
 */
export const createTorsionMoment = (
    name: string,
    scene: BABYLON.Scene,
    centerPosition: BABYLON.Vector3,
    direction: BABYLON.Vector3,
    arcAngle: number = TORSION_MOMENT_CONSTANTS.ARC_ANGLE,
    arcDir: ArcDirection = ArcDirection.FORWARD,
    material: BABYLON.Material,
    labelText: string = 'T'
): TorsionMomentNode => {

    const arcRadius: number = TORSION_MOMENT_CONSTANTS.ARC_RADIUS;
    const arcThickness: number = TORSION_MOMENT_CONSTANTS.ARC_THICKNESS;
    const group = new BABYLON.TransformNode(name + 'Group', scene);
    const meshes: BABYLON.Mesh[] = [];
    const labels: GUI.TextBlock[] = [];

    const normalizedDirection = BABYLON.Vector3.Normalize(direction);

    // Calculate perpendicular vectors for the arc plane
    const { perp1, perp2 } = calculatePerpendiculars(normalizedDirection);

    // Create the arc
    const arc = createArc(
        name,
        scene,
        centerPosition,
        perp1,
        perp2,
        arcRadius,
        arcThickness,
        arcAngle,
        arcDir,
        material
    );
    arc.parent = group;
    meshes.push(arc);

    // Create arrow at arc end indicating direction
    const arrow = createArcArrow(
        name,
        scene,
        centerPosition,
        perp1,
        perp2,
        arcRadius,
        arcAngle,
        arcDir,
        material
    );
    arrow.parent = group;
    meshes.push(arrow);

    // Create label
    const label = createLabel(
        arrow,
        labelText
    );
    if (label) labels.push(label);

    return new TorsionMomentNode(group, arc, arrow, meshes, label, labels);
};

/**
 * Calculates two perpendicular vectors to a given direction.
 * Used to define the plane for the arc visualization.
 * @private
 */
const calculatePerpendiculars = (direction: BABYLON.Vector3) => {
    let perp1: BABYLON.Vector3;
    let perp2: BABYLON.Vector3;

    // Choose first perpendicular based on direction to avoid parallel vectors
    if (Math.abs(direction.x) < 0.9) {
        perp1 = BABYLON.Vector3.Cross(direction, new BABYLON.Vector3(1, 0, 0)).normalize();
    } else {
        perp1 = BABYLON.Vector3.Cross(direction, new BABYLON.Vector3(0, 1, 0)).normalize();
    }

    // Calculate second perpendicular as cross product
    perp2 = BABYLON.Vector3.Cross(direction, perp1).normalize();

    return { perp1, perp2 };
};

/**
 * Creates an arc in the plane defined by two perpendicular vectors.
 * The arc can be directed forward or backward.
 * @private
 */
const createArc = (
    name: string,
    scene: BABYLON.Scene,
    centerPosition: BABYLON.Vector3,
    perp1: BABYLON.Vector3,
    perp2: BABYLON.Vector3,
    arcRadius: number,
    arcThickness: number,
    arcAngle: number,
    arcDirection: ArcDirection,
    material: BABYLON.Material
): BABYLON.Mesh => {
    const arcRadians = (arcAngle / 180) * Math.PI;
    const path: BABYLON.Vector3[] = [];

    // Generate arc path points
    for (let i = 0; i <= TORSION_MOMENT_CONSTANTS.ARC_SEGMENTS; i++) {
        const t = i / TORSION_MOMENT_CONSTANTS.ARC_SEGMENTS;
        const angle = t * arcRadians * arcDirection;

        const x = arcRadius * Math.cos(angle);
        const y = arcRadius * Math.sin(angle);

        // Build point in the perpendicular plane
        const point = centerPosition
            .add(perp1.scale(x))
            .add(perp2.scale(y));

        path.push(point);
    }

    // Create tube mesh along the arc path
    const arc = BABYLON.MeshBuilder.CreateTube(name + '_Arc', {
        path,
        radius: arcThickness,
        tessellation: TORSION_MOMENT_CONSTANTS.ARC_TESSELLATION,
        cap: BABYLON.Mesh.CAP_ALL
    }, scene);

    arc.material = material;
    return arc;
};

/**
 * Creates an arrow head at the end of the arc.
 * Arrow orientation indicates the direction of the moment.
 * @private
 */
const createArcArrow = (
    name: string,
    scene: BABYLON.Scene,
    centerPosition: BABYLON.Vector3,
    perp1: BABYLON.Vector3,
    perp2: BABYLON.Vector3,
    arcRadius: number,
    arcAngle: number,
    arcDirection: ArcDirection,
    material: BABYLON.Material
): BABYLON.Mesh => {
    const yAxis = new BABYLON.Vector3(0, 1, 0);
    const arcRadians = (arcAngle / 180) * Math.PI;

    // Calculate end angle accounting for direction
    const endAngle = arcRadians * arcDirection;
    const endX = arcRadius * Math.cos(endAngle);
    const endY = arcRadius * Math.sin(endAngle);

    // Calculate tangent direction for arrow orientation
    const tangentAngle = endAngle + (Math.PI / 2) * arcDirection;
    const tangentDirection = perp1
        .scale(Math.cos(tangentAngle))
        .add(perp2.scale(Math.sin(tangentAngle)));

    // Create arrow head
    const arrow = BABYLON.MeshBuilder.CreateCylinder(name + '_Arrow', {
        diameterTop: 0,
        diameterBottom: TORSION_MOMENT_CONSTANTS.ARROW_DIAMETER,
        height: TORSION_MOMENT_CONSTANTS.ARROW_SIZE
    }, scene);

    // Position at arc end
    arrow.position = centerPosition
        .add(perp1.scale(endX))
        .add(perp2.scale(endY));

    // Rotate to point along tangent direction
    const rotation = BABYLON.Quaternion.FromUnitVectorsToRef(
        yAxis,
        tangentDirection,
        new BABYLON.Quaternion()
    );
    arrow.rotationQuaternion = rotation;
    arrow.material = material;

    return arrow;
};

/**
 * Creates a GUI label for the torsion moment.
 * Label is linked to the arrow position.
 * @private
 */
const createLabel = (
    arrowMesh: BABYLON.Mesh,
    labelText: string
): GUI.TextBlock | null => {
    try {
        const texture = getDimensionLabelTexture();
        const label = new GUI.TextBlock();
        label.text = labelText;
        label.color = 'black';
        label.fontSize = TORSION_MOMENT_CONSTANTS.LABEL_FONT_SIZE;

        texture.addControl(label);
        label.linkWithMesh(arrowMesh);
        label.linkOffsetX = TORSION_MOMENT_CONSTANTS.LABEL_OFFSET_X;
        label.linkOffsetY = TORSION_MOMENT_CONSTANTS.LABEL_OFFSET_Y;

        return label;
    } catch (error) {
        console.warn('Failed to create label:', error);
        return null;
    }
};
