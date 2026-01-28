import type { ComplexColumnParams, SlabParams } from '../App';
import type { EndAnchorageParams } from '../utils/BaseEndAnchorageNode';

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
  isFiniteConcrete: false,
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

export const DEFAULT_LAPSPLICE_SLAB_PARAMS: SlabParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  slabWidth: 1,
  slabDepth: 0.25,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.25 / 2,
  concreteOffsetZFront: 0.25 / 2,
};

export const DEFAULT_LAPSPLICE_BEAM_PARAMS: SlabParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  slabWidth: 0.4,
  slabDepth: 0.6,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.2,
  concreteOffsetXLeft: 0.2,
  concreteOffsetZBack: 0.3,
  concreteOffsetZFront: 0.3,
};

export const DEFAULT_LAPSPLICE_WALL_PARAMS: SlabParams = {
  isFiniteConcrete: true,
  concreteThickness: 1,
  slabWidth: 1,
  slabDepth: 0.25,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.25 / 2,
  concreteOffsetZFront: 0.25 / 2,
};

export const DEFAULT_LAPSPLICE_COLUMN_PARAMS: SlabParams = {
  isFiniteConcrete: true,
  concreteThickness: 2,
  slabWidth: 0.5,
  slabDepth: 0.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.25,
  concreteOffsetXLeft: 0.25,
  concreteOffsetZBack: 0.25,
  concreteOffsetZFront: 0.25,
};

export const DEFAULT_END_ANCHORAGE_PARAMS: EndAnchorageParams = {
  beamWidth: 0.3,
  beamDepth: 0.5,
  beamHeight: 0.4,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
  concreteThickness: 1,
  isBoundlessConcrete: true,
};

export const DEFAULT_END_ANCHORAGE_SLAB_PARAMS: EndAnchorageParams = {
  beamWidth: 1,
  beamDepth: 0.25,
  beamHeight: 0.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
  concreteThickness: 1,
  isBoundlessConcrete: true,
};

export const DEFAULT_END_ANCHORAGE_WALL_PARAMS: EndAnchorageParams = {
  beamWidth: 0.25,
  beamDepth: 1,
  beamHeight: 0.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.01,
  postOffset: 0.02,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
  concreteThickness: 1,
  isBoundlessConcrete: true,
};

export const DEFAULT_END_ANCHORAGE_RECTANGULAR_COLUMN_PARAMS: EndAnchorageParams = {
  beamWidth: 0.25,
  beamDepth: 0.25,
  beamHeight: 0.5,
  postCountX: 3,
  postCountZ: 2,
  postDiameter: 0.03,
  postOffset: 0.05,
  concreteOffsetXRight: 0.5,
  concreteOffsetXLeft: 0.5,
  concreteOffsetZBack: 0.5,
  concreteOffsetZFront: 0.5,
  concreteThickness: 1,
  isBoundlessConcrete: true,
};
