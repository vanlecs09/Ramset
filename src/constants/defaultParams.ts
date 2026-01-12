import type { ComplexColumnParams, RectangleColumnParams } from '../App';

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
  concreteThickness: 3,
  cylinderHeight: 1,
  cylinderRadius: 0.5,
  postRadius: 0.05,
  postCount: 10,
  circumferenceToPostOffset: 0.06,
  concreteOffsetXRight: 1.5,
  concreteOffsetXLeft: 1.5,
  concreteOffsetZBack: 1.5,
  concreteOffsetZFront: 1.5,
};

export const DEFAULT_COMPLEX_COLUMN_PARAMS: ComplexColumnParams = {
  isFiniteConcrete: true,
  concreteThickness: 3,
  concreteOffsetXRight: 1.5,
  concreteOffsetXLeft: 1.5,
  concreteOffsetZBack: 1.5,
  concreteOffsetZFront: 1.5,
  cuboid1SizeX: 1,
  cuboid1SizeZ: 0.5,
  cuboid1PostCountLeftEdge: 2,
  cuboid1PostCountTopEdge: 2,
  cuboid2SizeX: 0.5,
  cuboid2SizeZ: 1,
  cuboid2TranslateX: 0,
  cuboid2TranslateZ: 0,
  cuboid2PostCountLeftEdge: 2,
  cuboid2PostCountTopEdge: 2,
  postRadius: 0.05,
  postOffset: 0.1,
};

export const DEFAULT_RECTANGLE_COLUMN_PARAMS: RectangleColumnParams = {
  isFiniteConcrete: true,
  concreteThickness: 3,
  columnWidth: 1,
  columnDepth: 1.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.1,
  postOffset: 0.1,
  concreteOffsetXRight: 1.5,
  concreteOffsetXLeft: 1.5,
  concreteOffsetZBack: 1.5,
  concreteOffsetZFront: 1.5,
};
