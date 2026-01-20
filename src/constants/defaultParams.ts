import type { ComplexColumnParams, RectangleColumnParams, SlabParams } from '../App';

export interface TowerParams {
  isFiniteConcrete: boolean;
  concreteThickness: number;
  cylinderHeight: number;
  cylinderRadius: number;
  postRadius: number;
  postCount: number;
  circumferenceToPostOffset: number;
  concreteOffsetXRight: number;
  concreteOffsetXLeft: number;
  concreteOffsetZBack: number;
  concreteOffsetZFront: number;
}

export const DEFAULT_TOWER_PARAMS: TowerParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  cylinderHeight: 0.3,
  cylinderRadius: 0.2,
  postRadius: 0.01,
  postCount: 10,
  circumferenceToPostOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
};

export const DEFAULT_COMPLEX_COLUMN_PARAMS: ComplexColumnParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
  cuboid1SizeX: 0.3,
  cuboid1SizeZ: 0.1,
  cuboid1PostCountLeftEdge: 2,
  cuboid1PostCountTopEdge: 2,
  cuboid2SizeX: 0.1,
  cuboid2SizeZ: 0.3,
  cuboid2TranslateX: 0,
  cuboid2TranslateZ: 0,
  cuboid2PostCountLeftEdge: 2,
  cuboid2PostCountTopEdge: 2,
  postRadius: 0.01,
  postOffset: 0.1,
};

export const DEFAULT_RECTANGLE_COLUMN_PARAMS: RectangleColumnParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  columnWidth: 0.3,
  columnDepth: 0.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.02,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
};

export const DEFAULT_SLAB_PARAMS: SlabParams = {
  isFiniteConcrete: true,
  concreteThickness: 0.2,
  slabWidth: 0.2,
  slabDepth: 1,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.02,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
};
