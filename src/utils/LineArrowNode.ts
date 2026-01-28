import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createArrow, createLine, DIMENSION_LINE_CONSTANTS } from './GeometryHelper';

/**
 * Class representing a line with arrow visualization.
 * Manages a line mesh and arrow mesh with optional label.
 * Provides methods to control visibility and lifecycle.
 */
export class LineArrowNode {
  readonly group: BABYLON.TransformNode;
  readonly line: BABYLON.Mesh;
  readonly arrow: BABYLON.Mesh;
  readonly label?: GUI.TextBlock | null;
  readonly meshes: BABYLON.Mesh[];

  /**
   * Creates a new LineArrowNode instance.
   */
  constructor(
    group: BABYLON.TransformNode,
    line: BABYLON.Mesh,
    arrow: BABYLON.Mesh,
    label?: GUI.TextBlock | null,
  ) {
    this.group = group;
    this.line = line;
    this.arrow = arrow;
    this.label = label;
    this.meshes = [line, arrow];
  }

  /**
   * Shows or hides the arrow mesh while keeping the line visible.
   * @param visible - True to show arrow, false to hide
   */
  setArrowVisible(visible: boolean): void {
    this.arrow.setEnabled(visible);
  }

  /**
   * Shows or hides the line mesh while keeping the arrow visible.
   * @param visible - True to show line, false to hide
   */
  setLineVisible(visible: boolean): void {
    this.line.setEnabled(visible);
  }

  /**
   * Shows or hides the label while keeping line and arrow visible.
   * @param visible - True to show label, false to hide
   */
  setLabelVisible(visible: boolean): void {
    if (this.label) {
      this.label.isVisible = visible;
    }
  }

  /**
   * Shows or hides both line and arrow while keeping label visible.
   * @param visible - True to show line and arrow, false to hide
   */
  setLineAndArrowVisible(visible: boolean): void {
    this.line.setEnabled(visible);
    this.arrow.setEnabled(visible);
  }

  /**
   * Shows or hides all elements (line, arrow, and label).
   * @param visible - True to show all elements, false to hide
   */
  setVisible(visible: boolean): void {
    this.line.setEnabled(visible);
    this.arrow.setEnabled(visible);
    if (this.label) {
      this.label.isVisible = visible;
    }
  }

  /**
   * Disposes of all resources (meshes, label, and transform node).
   * Should be called before discarding the instance to prevent memory leaks.
   */
  dispose(): void {
    this.line.dispose();
    this.arrow.dispose();
    if (this.label) {
      this.label.dispose();
    }
    this.group.dispose();
  }
}


export const createLineArrowNode = (
  beginPoint01: BABYLON.Vector3,
  endPoint01: BABYLON.Vector3,
  name: string,
  scene: BABYLON.Scene,
  lineMat: BABYLON.Material,
): LineArrowNode => {
  const group = new BABYLON.TransformNode('LineArrowGroup', scene);
  
  const line = createLine(
    beginPoint01,
    endPoint01,
    name,
    DIMENSION_LINE_CONSTANTS.LINE_THICKNESS,
    scene,
    lineMat,
  );
  line.parent = group;
  
  const direction = endPoint01.subtract(beginPoint01).normalize();
  // Create arrows at measurement points
  const arrow = createArrow(
    name,
    DIMENSION_LINE_CONSTANTS.ARROW_DIAMETER,
    DIMENSION_LINE_CONSTANTS.ARROW_SIZE,
    scene,
    endPoint01,
    direction,
    lineMat,
  );
  arrow.parent = group;

  return new LineArrowNode(group, line, arrow);
};
