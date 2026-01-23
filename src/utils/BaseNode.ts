import * as BABYLON from '@babylonjs/core';
import type { DimensionLabelNode, AxisLabelNode } from './GeometryHelper';

/**
 * Union type for label nodes that can be stored in the base class.
 * Supports both dimension labels and axis labels which share a common `label` property.
 */
export type LabelNode = DimensionLabelNode | AxisLabelNode;

/**
 * Interface for all structure groups in the scene.
 * Defines the contract for managing structure meshes and resources.
 */
export interface BaseNode {
  group: BABYLON.TransformNode;
  dispose(): void;
}


export abstract class BaseNodeImpl implements BaseNode {
  group: BABYLON.TransformNode;
  constructor(group: BABYLON.TransformNode) {
    this.group = group;
  }
  dispose(): void {
    // throw new Error('Method not implemented.');
  }
}

// export abstract class BaseNodeImpl implements BaseNode {
// }

/**
 * Abstract base class that implements common disposal logic for all structure groups.
 * Provides default implementation for axis mesh caching and label caching, with cleanup.
 * Subclasses should call super.dispose() to ensure all resources are properly cleaned up.
 */
export abstract class BaseStructNodeImpl implements BaseNode {
  group: BABYLON.TransformNode;
  protected axisMeshes?: BABYLON.Mesh[];
  protected labels?: LabelNode[];
  protected posts?: BABYLON.Mesh[];

  constructor(group: BABYLON.TransformNode) {
    this.group = group;
    this.axisMeshes = [];
    this.labels = [];
    this.posts = [];
  }

  getAxisMeshes(): BABYLON.Mesh[] {
    return this.axisMeshes || [];
  }

  setAxisMeshes(meshes: BABYLON.Mesh[]): void {
    this.axisMeshes = meshes;
  }

  clearAxisMeshes(): void {
    if (this.axisMeshes) {
      this.axisMeshes.forEach(mesh => mesh.dispose());
      this.axisMeshes = [];
    }
  }

  getLabels(): LabelNode[] {
    return this.labels || [];
  }

  setLabels(labels: LabelNode[]): void {
    this.labels = labels;
  }

  clearLabels(): void {
    if (this.labels) {
      this.labels.forEach(labelData => {
        labelData.label.dispose();
      });
      this.labels = [];
    }
  }

  getPosts(): BABYLON.Mesh[] {
    return this.posts || [];
  }

  addPost(post: BABYLON.Mesh): void {
    if (!this.posts) {
      this.posts = [];
    }
    this.posts.push(post);
  }

  clearPosts(): void {
    if (this.posts) {
      this.posts.forEach(post => post.dispose());
      this.posts = [];
    }
  }

  /**
   * Base dispose method that cleans up axis meshes, labels, and posts.
   * Subclasses should override this and call super.dispose() at the end.
   */
  dispose(): void {
    this.clearAxisMeshes();
    this.clearLabels();
    this.clearPosts();
  }
}
