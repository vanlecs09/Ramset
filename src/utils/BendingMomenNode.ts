import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createLine } from './GeometryHelper';
import { getDimensionLabelTexture } from './Material';
import { createLineArrowNode, LineArrowNode } from './LineArrowNode';

/**
 * Class representing a bending moment visualization node.
 * Combines dotted line and arrow head for moment representation.
 * Manages resources and lifecycle.
 */
export class BendingMomentNode {
  readonly group: BABYLON.TransformNode;
  readonly dottedLineMeshes: BABYLON.Mesh[];
  readonly arrowNode: LineArrowNode;
  readonly label?: GUI.TextBlock | null;

  /**
   * Creates a new BendingMomentNode instance.
   */
  constructor(
    group: BABYLON.TransformNode,
    dottedLineMeshes: BABYLON.Mesh[],
    arrowNode: LineArrowNode,
    label?: GUI.TextBlock | null,
  ) {
    this.group = group;
    this.dottedLineMeshes = dottedLineMeshes;
    this.arrowNode = arrowNode;
    this.label = label;
  }

  /**
   * Shows or hides the arrow and label elements of the bending moment.
   * Keeps the dotted line visible while toggling arrow and label visibility.
   * @param visible - True to show arrow and label, false to hide
   */
  setLineAndArrowVisible(visible: boolean): void {
    // Delegate arrow visibility to arrowNode
    // this.arrowNode.setArrowVisible(visible);
    this.arrowNode.setLineAndArrowVisible(visible); // Keep line visible

    // Hide/show single label if it exists
    if (this.label) {
      this.label.isVisible = visible;
    }
  }

  /**
   * Shows or hides the dotted line elements while keeping arrow and label visible.
   * @param visible - True to show dotted line, false to hide
   */
  setDottedLineVisible(visible: boolean): void {
    this.dottedLineMeshes.forEach(mesh => mesh.setEnabled(visible));
  }

  /**
   * Shows or hides all elements of the bending moment (dotted line, arrow, and label).
   * @param visible - True to show all elements, false to hide
   */
  setVisible(visible: boolean): void {
    // Show/hide dotted line
    this.dottedLineMeshes.forEach(mesh => mesh.setEnabled(visible));

    // Show/hide arrow and label through arrowNode
    this.arrowNode.setVisible(visible);

    // Show/hide single label if it exists
    if (this.label) {
      this.label.isVisible = visible;
    }
  }

  /**
   * Disposes of all resources (meshes, labels, and transform node).
   * Should be called before discarding the instance to prevent memory leaks.
   */
  dispose(): void {
    // Dispose dotted line meshes
    this.dottedLineMeshes.forEach(mesh => mesh.dispose());
    // Dispose arrow node (which handles its own meshes and group)
    this.arrowNode.dispose();
    // Dispose label
    this.label?.dispose();
    this.group.dispose();
  }
}

/**
 * Constants for bending moment visualization
 */
export const BENDING_MOMENT_CONSTANTS = {
  DOT_SPACING: 0.1, // Distance between dots
  DOT_RADIUS: 0.003, // Radius of dot lines
  LINE_THICKNESS: 0.003, // Thickness of connecting lines between dots
  ARROW_SIZE: 0.03, // Size of arrow head
  ARROW_DIAMETER: 0.02, // Diameter of arrow cone
  MATERIAL_COLOR: new BABYLON.Color3(0, 0, 0), // Black color
  LABEL_FONT_SIZE: 16, // Font size for label
  LABEL_OFFSET_X: 10, // Horizontal offset from arrow
  LABEL_OFFSET_Y: -15, // Vertical offset from arrow
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
  momenValue: number,
  parent: BABYLON.TransformNode,
): BendingMomentNode => {

  const dottedLineMeshes: BABYLON.Mesh[] = [];

  // Normalize direction
  const normalizedDirection = BABYLON.Vector3.Normalize(direction);

  // Create material for the visualization
  const material = new BABYLON.StandardMaterial('bendingMomentMat', scene);
  material.diffuseColor = color;

  // Create dotted line from position with specified length
  const dotCount = Math.ceil(length / BENDING_MOMENT_CONSTANTS.DOT_SPACING);
  const dotSpacing = length / dotCount; // Adjust spacing to fit exactly

  for (let i = 0; i < dotCount; i++) {
    const dotStart = position.add(normalizedDirection.scale(i * dotSpacing));
    const dotEnd = position.add(
      normalizedDirection.scale((i + 0.5) * dotSpacing),
    );

    // Create individual dot segment
    const dot = createLine(
      dotStart,
      dotEnd,
      `bendingMoment_dot_${i}`,
      BENDING_MOMENT_CONSTANTS.DOT_RADIUS,
      scene,
      material,
    );
    dot.parent = parent;
    dottedLineMeshes.push(dot);
  }

  let arrowBeginPosition = BABYLON.Vector3.Zero();
  let arrowEndPosition = BABYLON.Vector3.Zero();
  // Create arrow at the end of the line using createLineArrow
  if (momenValue > 0) {
    arrowBeginPosition = position.add(normalizedDirection.scale(length));
    arrowEndPosition = arrowBeginPosition.add(normalizedDirection.scale(0.1));
  }
  else {
    arrowBeginPosition = position.add(normalizedDirection.scale(length + 0.1));
    arrowEndPosition = arrowBeginPosition.add(normalizedDirection.scale(-0.1));
  }

  const arrowNode = createLineArrowNode(
    arrowBeginPosition,
    arrowEndPosition,
    'bendingMoment_arrow',
    scene,
    material,
  );
  arrowNode.group.parent = parent;

  // Create label if text is provided
  let label: GUI.TextBlock | null = null;
  let text = momenValue.toString();
  if (text) {
    label = createBendingMomentLabel(arrowNode.arrow, text);
  }

  return new BendingMomentNode(
    parent,
    dottedLineMeshes,
    arrowNode,
    label,
  );
};

/**
 * Creates a GUI label for the bending moment.
 * Label is linked to the arrow position.
 * @private
 */
const createBendingMomentLabel = (
  arrowMesh: BABYLON.Mesh,
  labelText: string,
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
