import * as BABYLON from '@babylonjs/core';

/**
 * Parameters for concrete base configuration
 * Defines the dimensions and properties of the concrete foundation
 */
export interface ConcreteParams {
  /**
   * Thickness (height) of the concrete base along Y-axis
   * 
   */ 
  thickness: number;

  /**
   * Width of the concrete base along X-axis
   * cái này tính từ center concrete ra 2 bên
   */
  width: number;

  /**
   * Depth of the concrete base along Z-axis
   */
  depth: number;

  /**
   * Position of the concrete center in 3D space
   * giá trị default là (0, -thichness/2, 0) để concrete nằm dưới y=0
   */
  position: BABYLON.Vector3;

  /**
   * Whether the concrete has finite bounds (true) or extends infinitely (false)
   * When true, concrete is a finite block. When false, extends to infinity with visual indicators.
   * @default true
   */
  isBounded: boolean;
}

/**
 * Parameters for post configuration
 * Defines the dimensions and positions of vertical support posts
 */
export interface PostParam {
  /**
   * Radius of each cylindrical post
   * lấy từ bar param
   */
  postRadius: number;

  /**
   * Height of each post along Y-axis
   * có thể default = 0.3
   */
  postHeight: number;

  /**
   * Array of 3D positions where posts should be placed
   * Each Vector3 represents the center position of a post
   * bar x: 200, bar: 400 => position (200, 0, 400)
   */
  postPositions: BABYLON.Vector3[];
}

/**
 * Parameters for complex column configuration
 * Used to define the dimensions and positioning of two cuboids that form a cross shape
 */
export interface ComplexColumnParam {
  /**
   * Width (X-axis) of the first cuboid
   * @default 2
   */
  cuboid1SizeX?: number;

  /**
   * Depth (Z-axis) of the first cuboid
   * @default 2
   */
  cuboid1SizeZ?: number;

  /**
   * Width (X-axis) of the second cuboid
   * @default 2
   */
  cuboid2SizeX?: number;

  /**
   * Depth (Z-axis) of the second cuboid
   * @default 2
   */
  cuboid2SizeZ?: number;

  /**
   * Translation offset along X-axis for the second cuboid
   * @default 0
   */
  cuboid2TranslateX?: number;

  /**
   * Translation offset along Z-axis for the second cuboid
   * @default 0
   */
  cuboid2TranslateZ?: number;
}

/**
 * Parameters for end anchorage configuration
 * Defines the dimensions and properties of the beam and concrete structure
 */
export interface EndAnchorageParams {
  /**
   * Width of the beam (along X-axis)
   */
  beamWidth: number;

  /**
   * Depth of the beam (along Z-axis)
   */
  beamDepth: number;

  /**
   * Height of the beam (along Y-axis)
   */
  beamHeight: number;

  /**
   * Number of posts along the X-axis
   */
  postCountX: number;

  /**
   * Number of posts along the Z-axis
   */
  postCountZ: number;

  /**
   * Diameter of each post
   */
  postDiameter: number;

  /**
   * Offset distance from the edge for post placement
   */
  postOffset: number;

  /**
   * Concrete offset on the right side (positive X direction)
   */
  concreteOffsetXRight: number;

  /**
   * Concrete offset on the left side (negative X direction)
   */
  concreteOffsetXLeft: number;

  /**
   * Concrete offset on the back side (negative Z direction)
   */
  concreteOffsetZBack: number;

  /**
   * Concrete offset on the front side (positive Z direction)
   */
  concreteOffsetZFront: number;

  /**
   * Thickness of the concrete base
   */
  concreteThickness: number;

  /**
   * Whether the concrete has finite bounds (true) or is boundless (false)
   * @default false
   */
  isBoundlessConcrete?: boolean;
}

/**
 * Parameters for top block configuration
 * Defines the dimensions of the block placed on top of the structure
 */
export interface TopBlockParams {
  /**
   * Width of the top block (along X-axis) 
   * là width trong request
   */
  width: number;

  /**
   * Depth of the top block (along Z-axis)
   * là height trong request
   */
  depth: number; 

  /**
   * Height of the top block (along Y-axis)
   * cho giá trị default là 0.3
   */
  height: number;
}
