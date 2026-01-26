import React, { useState } from 'react';
import '../styles/ControlPanel.css';
import type { RectangleColumnParams, SlabParams } from '../App';
import type { EndAnchorageParams } from '../utils/BaseEndAnchorageNode';
import { DEFAULT_TOWER_PARAMS, DEFAULT_COMPLEX_COLUMN_PARAMS, DEFAULT_RECTANGLE_COLUMN_PARAMS, DEFAULT_LAPSPLICE_SLAB_PARAMS, DEFAULT_LAPSPLICE_BEAM_PARAMS, DEFAULT_LAPSPLICE_WALL_PARAMS, DEFAULT_END_ANCHORAGE_PARAMS, DEFAULT_END_ANCHORAGE_SLAB_PARAMS, DEFAULT_END_ANCHORAGE_WALL_PARAMS } from '../constants/defaultParams';

interface ComplexColumnParams {
  isFiniteConcrete: boolean;
  concreteThickness: number;
  concreteOffsetXRight: number;
  concreteOffsetXLeft: number;
  concreteOffsetZBack: number;
  concreteOffsetZFront: number;
  cuboid1SizeX: number;
  cuboid1SizeZ: number;
  cuboid1PostCountLeftEdge: number;
  cuboid1PostCountTopEdge: number;
  cuboid2SizeX: number;
  cuboid2SizeZ: number;
  cuboid2TranslateX: number;
  cuboid2TranslateZ: number;
  cuboid2PostCountLeftEdge: number;
  cuboid2PostCountTopEdge: number;
  postRadius: number;
  postOffset: number;
}

interface ControlPanelProps {
  onModelChange: (model:  'circularColumns' | 'complexColumn' | 'rectangleColumn' | 'lapspliceSlab' | 'lapspliceBeam' | 'lapspliceWall' | 'endAnchorage' | 'endAnchorageSlab' | 'endAnchorageWall') => void;
  onTowerParamsChange: (params: {
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
  }) => void;
  onComplexColumnParamsChange: (params: ComplexColumnParams) => void;
  onRectangleColumnParamsChange: (params: RectangleColumnParams) => void;
  onLapspliceSlabParamsChange: (params: SlabParams) => void;
  onLapspliceBeamParamsChange: (params: SlabParams) => void;
  onLapspliceWallParamsChange: (params: SlabParams) => void;
  onEndAnchorageParamsChange: (params: EndAnchorageParams) => void;
  onEndAnchorageSlabParamsChange: (params: EndAnchorageParams) => void;
  onEndAnchorageWallParamsChange: (params: EndAnchorageParams) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onModelChange,
  onTowerParamsChange,
  onComplexColumnParamsChange,
  onRectangleColumnParamsChange,
  onLapspliceSlabParamsChange,
  onLapspliceBeamParamsChange,
  onLapspliceWallParamsChange,
  onEndAnchorageParamsChange,
  onEndAnchorageSlabParamsChange,
  onEndAnchorageWallParamsChange,
}) => {
  const [currentModel, setCurrentModel] = useState<'circularColumns' | 'complexColumn' | 'rectangleColumn' | 'lapspliceSlab' | 'lapspliceBeam' | 'lapspliceWall' | 'endAnchorage' | 'endAnchorageSlab' | 'endAnchorageWall'>('endAnchorage');

  // Tower parameters
  const [towerIsFiniteConcrete, setTowerIsFiniteConcrete] = useState(DEFAULT_TOWER_PARAMS.isFiniteConcrete);
  const [towerConcreteThickness, setTowerConcreteThickness] = useState(DEFAULT_TOWER_PARAMS.concreteThickness);
  const [towerCylinderHeight, setTowerCylinderHeight] = useState(DEFAULT_TOWER_PARAMS.cylinderHeight);
  const [towerCylinderRadius, setTowerCylinderRadius] = useState(DEFAULT_TOWER_PARAMS.cylinderRadius);
  const [towerPostRadius, setTowerPostRadius] = useState(DEFAULT_TOWER_PARAMS.postRadius);
  const [towerPostCount, setTowerPostCount] = useState(DEFAULT_TOWER_PARAMS.postCount);
  const [towerCircumferenceOffset, setTowerCircumferenceOffset] = useState(DEFAULT_TOWER_PARAMS.circumferenceToPostOffset);
  const [towerConcreteOffsetXRight, setTowerConcreteOffsetXRight] = useState(DEFAULT_TOWER_PARAMS.concreteOffsetXRight);
  const [towerConcreteOffsetXLeft, setTowerConcreteOffsetXLeft] = useState(DEFAULT_TOWER_PARAMS.concreteOffsetXLeft);
  const [towerConcreteOffsetZBack, setTowerConcreteOffsetZBack] = useState(DEFAULT_TOWER_PARAMS.concreteOffsetZBack);
  const [towerConcreteOffsetZFront, setTowerConcreteOffsetZFront] = useState(DEFAULT_TOWER_PARAMS.concreteOffsetZFront);

  // Complex Column parameters
  const [complexIsFiniteConcrete, setComplexIsFiniteConcrete] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.isFiniteConcrete);
  const [complexConcreteThickness, setComplexConcreteThickness] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteThickness);
  const [complexConcreteOffsetXRight, setComplexConcreteOffsetXRight] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteOffsetXRight);
  const [complexConcreteOffsetXLeft, setComplexConcreteOffsetXLeft] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteOffsetXLeft);
  const [complexConcreteOffsetZBack, setComplexConcreteOffsetZBack] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteOffsetZBack);
  const [complexConcreteOffsetZFront, setComplexConcreteOffsetZFront] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteOffsetZFront);
  const [cuboid1SizeX, setCuboid1SizeX] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid1SizeX);
  const [cuboid1SizeZ, setCuboid1SizeZ] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid1SizeZ);
  const [cuboid1PostCountLeftEdge, setCuboid1PostCountLeftEdge] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid1PostCountLeftEdge);
  const [cuboid1PostCountTopEdge, setCuboid1PostCountTopEdge] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid1PostCountTopEdge);
  const [cuboid2SizeX, setCuboid2SizeX] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2SizeX);
  const [cuboid2SizeZ, setCuboid2SizeZ] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2SizeZ);
  const [cuboid2TranslateX, setCuboid2TranslateX] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2TranslateX);
  const [cuboid2TranslateZ, setCuboid2TranslateZ] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2TranslateZ);
  const [cuboid2PostCountLeftEdge, setCuboid2PostCountLeftEdge] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2PostCountLeftEdge);
  const [cuboid2PostCountTopEdge, setCuboid2PostCountTopEdge] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.cuboid2PostCountTopEdge);
  const [complexColumnPostRadius, setComplexColumnPostRadius] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.postRadius);
  const [complexColumnPostOffset, setComplexColumnPostOffset] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.postOffset);

  // Rectangle Column parameters
  const [rectangleIsFiniteConcrete, setRectangleIsFiniteConcrete] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.isFiniteConcrete);

  // Rectangle Column parameters
  const [concreteThickness, setConcreteThickness] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.concreteThickness);
  const [columnWidth, setColumnWidth] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.columnWidth);
  const [columnDepth, setColumnDepth] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.columnDepth);
  const [postCountX, setPostCountX] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.postCountX);
  const [postCountZ, setPostCountZ] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.postCountZ);
  const [postDiameter, setPostDiameter] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.postDiameter);
  const [postOffset, setPostOffset] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.postOffset);
  const [concreteOffsetXRight, setConcreteOffsetXRight] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.concreteOffsetXRight);
  const [concreteOffsetXLeft, setConcreteOffsetXLeft] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.concreteOffsetXLeft);
  const [concreteOffsetZBack, setConcreteOffsetZBack] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.concreteOffsetZBack);
  const [concreteOffsetZFront, setConcreteOffsetZFront] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.concreteOffsetZFront);

  // Lapsplice Slab parameters
  const [lapspliceSlabIsFiniteConcrete, setLapspliceSlabIsFiniteConcrete] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.isFiniteConcrete);
  const [lapspliceSlabConcreteThickness, setLapspliceSlabConcreteThickness] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.concreteThickness);
  const [lapspliceSlabWidth, setLapspliceSlabWidth] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.slabWidth);
  const [lapspliceSlabDepth, setLapspliceSlabDepth] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.slabDepth);
  const [lapspliceSlabPostCountX, setLapspliceSlabPostCountX] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.postCountX);
  const [lapspliceSlabPostCountZ, setLapspliceSlabPostCountZ] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.postCountZ);
  const [lapspliceSlabPostDiameter, setLapspliceSlabPostDiameter] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.postDiameter);
  const [lapspliceSlabPostOffset, setLapspliceSlabPostOffset] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.postOffset);
  const [lapspliceSlabConcreteOffsetXRight, setLapspliceSlabConcreteOffsetXRight] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.concreteOffsetXRight);
  const [lapspliceSlabConcreteOffsetXLeft, setLapspliceSlabConcreteOffsetXLeft] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.concreteOffsetXLeft);
  const [lapspliceSlabConcreteOffsetZBack, setLapspliceSlabConcreteOffsetZBack] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.concreteOffsetZBack);
  const [lapspliceSlabConcreteOffsetZFront, setLapspliceSlabConcreteOffsetZFront] = useState(DEFAULT_LAPSPLICE_SLAB_PARAMS.concreteOffsetZFront);

  // Lapsplice Beam parameters
  const [beamIsFiniteConcrete, setBeamIsFiniteConcrete] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.isFiniteConcrete);
  const [beamConcreteThickness, setBeamConcreteThickness] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.concreteThickness);
  const [beamWidth, setBeamWidth] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.slabWidth);
  const [beamDepth, setBeamDepth] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.slabDepth);
  const [beamPostCountX, setBeamPostCountX] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.postCountX);
  const [beamPostCountZ, setBeamPostCountZ] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.postCountZ);
  const [beamPostDiameter, setBeamPostDiameter] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.postDiameter);
  const [beamPostOffset, setBeamPostOffset] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.postOffset);
  const [beamConcreteOffsetXRight, setBeamConcreteOffsetXRight] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.concreteOffsetXRight);
  const [beamConcreteOffsetXLeft, setBeamConcreteOffsetXLeft] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.concreteOffsetXLeft);
  const [beamConcreteOffsetZBack, setBeamConcreteOffsetZBack] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.concreteOffsetZBack);
  const [beamConcreteOffsetZFront, setBeamConcreteOffsetZFront] = useState(DEFAULT_LAPSPLICE_BEAM_PARAMS.concreteOffsetZFront);

  // Lapsplice Wall parameters
  const [wallIsFiniteConcrete, setWallIsFiniteConcrete] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.isFiniteConcrete);
  const [wallConcreteThickness, setWallConcreteThickness] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.concreteThickness);
  const [wallWidth, setWallWidth] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.slabWidth);
  const [wallDepth, setWallDepth] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.slabDepth);
  const [wallPostCountX, setWallPostCountX] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.postCountX);
  const [wallPostCountZ, setWallPostCountZ] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.postCountZ);
  const [wallPostDiameter, setWallPostDiameter] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.postDiameter);
  const [wallPostOffset, setWallPostOffset] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.postOffset);
  const [wallConcreteOffsetXRight, setWallConcreteOffsetXRight] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.concreteOffsetXRight);
  const [wallConcreteOffsetXLeft, setWallConcreteOffsetXLeft] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.concreteOffsetXLeft);
  const [wallConcreteOffsetZBack, setWallConcreteOffsetZBack] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.concreteOffsetZBack);
  const [wallConcreteOffsetZFront, setWallConcreteOffsetZFront] = useState(DEFAULT_LAPSPLICE_WALL_PARAMS.concreteOffsetZFront);

  // End Anchorage parameters
  const [anchorageBeamWidth, setAnchorageBeamWidth] = useState(DEFAULT_END_ANCHORAGE_PARAMS.beamWidth);
  const [anchorageBeamDepth, setAnchorageBeamDepth] = useState(DEFAULT_END_ANCHORAGE_PARAMS.beamDepth);
  const [anchorageBeamHeight, setAnchorageBeamHeight] = useState(DEFAULT_END_ANCHORAGE_PARAMS.beamHeight);
  const [anchoragePostCountX, setAnchoragePostCountX] = useState(DEFAULT_END_ANCHORAGE_PARAMS.postCountX);
  const [anchoragePostCountZ, setAnchoragePostCountZ] = useState(DEFAULT_END_ANCHORAGE_PARAMS.postCountZ);
  const [anchoragePostDiameter, setAnchoragePostDiameter] = useState(DEFAULT_END_ANCHORAGE_PARAMS.postDiameter);
  const [anchoragePostOffset, setAnchoragePostOffset] = useState(DEFAULT_END_ANCHORAGE_PARAMS.postOffset);
  const [anchorageConcreteOffsetXRight, setAnchorageConcreteOffsetXRight] = useState(DEFAULT_END_ANCHORAGE_PARAMS.concreteOffsetXRight);
  const [anchorageConcreteOffsetXLeft, setAnchorageConcreteOffsetXLeft] = useState(DEFAULT_END_ANCHORAGE_PARAMS.concreteOffsetXLeft);
  const [anchorageConcreteOffsetZBack, setAnchorageConcreteOffsetZBack] = useState(DEFAULT_END_ANCHORAGE_PARAMS.concreteOffsetZBack);
  const [anchorageConcreteOffsetZFront, setAnchorageConcreteOffsetZFront] = useState(DEFAULT_END_ANCHORAGE_PARAMS.concreteOffsetZFront);
  const [anchorageConcreteThickness, setAnchorageConcreteThickness] = useState(DEFAULT_END_ANCHORAGE_PARAMS.concreteThickness);

  // End Anchorage Slab parameters
  const [anchorageSlabBeamWidth, setAnchorageSlabBeamWidth] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.beamWidth);
  const [anchorageSlabBeamDepth, setAnchorageSlabBeamDepth] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.beamDepth);
  const [anchorageSlabBeamHeight, setAnchorageSlabBeamHeight] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.beamHeight);
  const [anchorageSlabPostCountX, setAnchorageSlabPostCountX] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.postCountX);
  const [anchorageSlabPostCountZ, setAnchorageSlabPostCountZ] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.postCountZ);
  const [anchorageSlabPostDiameter, setAnchorageSlabPostDiameter] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.postDiameter);
  const [anchorageSlabPostOffset, setAnchorageSlabPostOffset] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.postOffset);
  const [anchorageSlabConcreteOffsetXRight, setAnchorageSlabConcreteOffsetXRight] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.concreteOffsetXRight);
  const [anchorageSlabConcreteOffsetXLeft, setAnchorageSlabConcreteOffsetXLeft] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.concreteOffsetXLeft);
  const [anchorageSlabConcreteOffsetZBack, setAnchorageSlabConcreteOffsetZBack] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.concreteOffsetZBack);
  const [anchorageSlabConcreteOffsetZFront, setAnchorageSlabConcreteOffsetZFront] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.concreteOffsetZFront);
  const [anchorageSlabConcreteThickness, setAnchorageSlabConcreteThickness] = useState(DEFAULT_END_ANCHORAGE_SLAB_PARAMS.concreteThickness);

  // End Anchorage Wall parameters
  const [anchorageWallBeamWidth, setAnchorageWallBeamWidth] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.beamWidth);
  const [anchorageWallBeamDepth, setAnchorageWallBeamDepth] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.beamDepth);
  const [anchorageWallBeamHeight, setAnchorageWallBeamHeight] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.beamHeight);
  const [anchorageWallPostCountX, setAnchorageWallPostCountX] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.postCountX);
  const [anchorageWallPostCountZ, setAnchorageWallPostCountZ] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.postCountZ);
  const [anchorageWallPostDiameter, setAnchorageWallPostDiameter] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.postDiameter);
  const [anchorageWallPostOffset, setAnchorageWallPostOffset] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.postOffset);
  const [anchorageWallConcreteOffsetXRight, setAnchorageWallConcreteOffsetXRight] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.concreteOffsetXRight);
  const [anchorageWallConcreteOffsetXLeft, setAnchorageWallConcreteOffsetXLeft] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.concreteOffsetXLeft);
  const [anchorageWallConcreteOffsetZBack, setAnchorageWallConcreteOffsetZBack] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.concreteOffsetZBack);
  const [anchorageWallConcreteOffsetZFront, setAnchorageWallConcreteOffsetZFront] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.concreteOffsetZFront);
  const [anchorageWallConcreteThickness, setAnchorageWallConcreteThickness] = useState(DEFAULT_END_ANCHORAGE_WALL_PARAMS.concreteThickness);

  // Helper function to build complete complex column params
  const getComplexColumnParams = (overrides?: Partial<ComplexColumnParams>): ComplexColumnParams => ({
    isFiniteConcrete: overrides?.isFiniteConcrete ?? complexIsFiniteConcrete,
    concreteThickness: overrides?.concreteThickness ?? complexConcreteThickness,
    concreteOffsetXRight: overrides?.concreteOffsetXRight ?? complexConcreteOffsetXRight,
    concreteOffsetXLeft: overrides?.concreteOffsetXLeft ?? complexConcreteOffsetXLeft,
    concreteOffsetZBack: overrides?.concreteOffsetZBack ?? complexConcreteOffsetZBack,
    concreteOffsetZFront: overrides?.concreteOffsetZFront ?? complexConcreteOffsetZFront,
    cuboid1SizeX: overrides?.cuboid1SizeX ?? cuboid1SizeX,
    cuboid1SizeZ: overrides?.cuboid1SizeZ ?? cuboid1SizeZ,
    cuboid1PostCountLeftEdge: overrides?.cuboid1PostCountLeftEdge ?? cuboid1PostCountLeftEdge,
    cuboid1PostCountTopEdge: overrides?.cuboid1PostCountTopEdge ?? cuboid1PostCountTopEdge,
    cuboid2SizeX: overrides?.cuboid2SizeX ?? cuboid2SizeX,
    cuboid2SizeZ: overrides?.cuboid2SizeZ ?? cuboid2SizeZ,
    cuboid2TranslateX: overrides?.cuboid2TranslateX ?? cuboid2TranslateX,
    cuboid2TranslateZ: overrides?.cuboid2TranslateZ ?? cuboid2TranslateZ,
    cuboid2PostCountLeftEdge: overrides?.cuboid2PostCountLeftEdge ?? cuboid2PostCountLeftEdge,
    cuboid2PostCountTopEdge: overrides?.cuboid2PostCountTopEdge ?? cuboid2PostCountTopEdge,
    postRadius: overrides?.postRadius ?? complexColumnPostRadius,
    postOffset: overrides?.postOffset ?? complexColumnPostOffset,
  });

  const handleTowerIsFiniteConcreteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setTowerIsFiniteConcrete(value);
    onTowerParamsChange({
      isFiniteConcrete: value,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerConcreteThickness(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: value,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerCylinderHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerCylinderHeight(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      cylinderHeight: value,
      concreteThickness: towerConcreteThickness,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerCylinderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerCylinderRadius(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: value,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerPostRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerPostRadius(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: value,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerPostCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 10;
    setTowerPostCount(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: value,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerCircumferenceOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerCircumferenceOffset(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: value,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerConcreteOffsetXRight(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: value,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerConcreteOffsetXLeft(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: value,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerConcreteOffsetZBack(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: value,
      concreteOffsetZFront: towerConcreteOffsetZFront,
    });
  };

  const handleTowerConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerConcreteOffsetZFront(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      concreteOffsetXRight: towerConcreteOffsetXRight,
      concreteOffsetXLeft: towerConcreteOffsetXLeft,
      concreteOffsetZBack: towerConcreteOffsetZBack,
      concreteOffsetZFront: value,
    });
  };

  const handleComplexConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteThickness(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteThickness: value }));
  };

  const handleComplexConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteOffsetXRight(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteOffsetXRight: value }));
  };

  const handleComplexConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteOffsetXLeft(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteOffsetXLeft: value }));
  };

  const handleComplexConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteOffsetZBack(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteOffsetZBack: value }));
  };

  const handleComplexConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteOffsetZFront(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteOffsetZFront: value }));
  };

  const handleCuboid1SizeXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid1SizeX(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid1SizeX: value }));
  };

  const handleCuboid1SizeZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid1SizeZ(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid1SizeZ: value }));
  };

  const handleCuboid2SizeXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2SizeX(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2SizeX: value }));
  };

  const handleCuboid2SizeZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2SizeZ(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2SizeZ: value }));
  };

  const handleCuboid2TranslateXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2TranslateX(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2TranslateX: value }));
  };

  const handleCuboid2TranslateZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2TranslateZ(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2TranslateZ: value }));
  };

  const handleCuboid1PostCountLeftEdgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2;
    setCuboid1PostCountLeftEdge(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid1PostCountLeftEdge: value }));
  };

  const handleCuboid1PostCountTopEdgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2;
    setCuboid1PostCountTopEdge(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid1PostCountTopEdge: value }));
  };

  const handleCuboid2PostCountLeftEdgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2;
    setCuboid2PostCountLeftEdge(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2PostCountLeftEdge: value }));
  };

  const handleCuboid2PostCountTopEdgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2;
    setCuboid2PostCountTopEdge(value);
    onComplexColumnParamsChange(getComplexColumnParams({ cuboid2PostCountTopEdge: value }));
  };

  const handleComplexColumnPostRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexColumnPostRadius(value);
    onComplexColumnParamsChange(getComplexColumnParams({ postRadius: value }));
  };

  const handleComplexColumnPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexColumnPostOffset(value);
    onComplexColumnParamsChange(getComplexColumnParams({ postOffset: value }));
  };

  const handleConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setConcreteThickness(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: value,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleColumnWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setColumnWidth(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: value,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleColumnDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setColumnDepth(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: value,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleRectanglePostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 3;
    setPostCountX(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: value,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleRectanglePostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 2;
    setPostCountZ(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: value,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handlePostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setPostDiameter(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: value,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleRectanglePostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setPostOffset(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: value,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setConcreteOffsetXRight(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: value,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setConcreteOffsetXLeft(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: value,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setConcreteOffsetZBack(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: value,
      concreteOffsetZFront: concreteOffsetZFront,
    });
  };

  const handleConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setConcreteOffsetZFront(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      concreteOffsetXRight: concreteOffsetXRight,
      concreteOffsetXLeft: concreteOffsetXLeft,
      concreteOffsetZBack: concreteOffsetZBack,
      concreteOffsetZFront: value,
    });
  };

  // Slab parameter change handlers
  const handleLapspliceSlabIsFiniteConcreteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setLapspliceSlabIsFiniteConcrete(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: value,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabConcreteThickness(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: value,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabWidth(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: value,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabDepth(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: value,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabPostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setLapspliceSlabPostCountX(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: value,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabPostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setLapspliceSlabPostCountZ(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: value,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabPostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabPostDiameter(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: value,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabPostOffset(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: value,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabConcreteOffsetXRight(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: value,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabConcreteOffsetXLeft(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: value,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabConcreteOffsetZBack(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: value,
      concreteOffsetZFront: lapspliceSlabConcreteOffsetZFront,
    });
  };

  const handleLapspliceSlabConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLapspliceSlabConcreteOffsetZFront(value);
    onLapspliceSlabParamsChange({
      isFiniteConcrete: lapspliceSlabIsFiniteConcrete,
      concreteThickness: lapspliceSlabConcreteThickness,
      slabWidth: lapspliceSlabWidth,
      slabDepth: lapspliceSlabDepth,
      postCountX: lapspliceSlabPostCountX,
      postCountZ: lapspliceSlabPostCountZ,
      postDiameter: lapspliceSlabPostDiameter,
      postOffset: lapspliceSlabPostOffset,
      concreteOffsetXRight: lapspliceSlabConcreteOffsetXRight,
      concreteOffsetXLeft: lapspliceSlabConcreteOffsetXLeft,
      concreteOffsetZBack: lapspliceSlabConcreteOffsetZBack,
      concreteOffsetZFront: value,
    });
  };

  // Lapsplice Wall parameter change handlers
  const handleWallIsFiniteConcreteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setWallIsFiniteConcrete(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: value,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallConcreteThickness(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: value,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallWidth(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: value,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallDepth(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: value,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallPostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setWallPostCountX(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: value,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallPostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setWallPostCountZ(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: value,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallPostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallPostDiameter(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: value,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallPostOffset(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: value,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallConcreteOffsetXRight(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: value,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallConcreteOffsetXLeft(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: value,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallConcreteOffsetZBack(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: value,
      concreteOffsetZFront: wallConcreteOffsetZFront,
    });
  };

  const handleWallConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setWallConcreteOffsetZFront(value);
    onLapspliceWallParamsChange({
      isFiniteConcrete: wallIsFiniteConcrete,
      concreteThickness: wallConcreteThickness,
      slabWidth: wallWidth,
      slabDepth: wallDepth,
      postCountX: wallPostCountX,
      postCountZ: wallPostCountZ,
      postDiameter: wallPostDiameter,
      postOffset: wallPostOffset,
      concreteOffsetXRight: wallConcreteOffsetXRight,
      concreteOffsetXLeft: wallConcreteOffsetXLeft,
      concreteOffsetZBack: wallConcreteOffsetZBack,
      concreteOffsetZFront: value,
    });
  };

  // Helper function to build complete end anchorage params
  const getEndAnchorageParams = (overrides?: Partial<EndAnchorageParams>): EndAnchorageParams => ({
    beamWidth: overrides?.beamWidth ?? anchorageBeamWidth,
    beamDepth: overrides?.beamDepth ?? anchorageBeamDepth,
    beamHeight: overrides?.beamHeight ?? anchorageBeamHeight,
    postCountX: overrides?.postCountX ?? anchoragePostCountX,
    postCountZ: overrides?.postCountZ ?? anchoragePostCountZ,
    postDiameter: overrides?.postDiameter ?? anchoragePostDiameter,
    postOffset: overrides?.postOffset ?? anchoragePostOffset,
    concreteOffsetXRight: overrides?.concreteOffsetXRight ?? anchorageConcreteOffsetXRight,
    concreteOffsetXLeft: overrides?.concreteOffsetXLeft ?? anchorageConcreteOffsetXLeft,
    concreteOffsetZBack: overrides?.concreteOffsetZBack ?? anchorageConcreteOffsetZBack,
    concreteOffsetZFront: overrides?.concreteOffsetZFront ?? anchorageConcreteOffsetZFront,
    concreteThickness: overrides?.concreteThickness ?? anchorageConcreteThickness,
  });

  const handleAnchorageBeamWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageBeamWidth(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ beamWidth: value }));
  };

  const handleAnchorageBeamDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageBeamDepth(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ beamDepth: value }));
  };

  const handleAnchorageBeamHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageBeamHeight(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ beamHeight: value }));
  };

  const handleAnchoragePostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchoragePostCountX(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ postCountX: value }));
  };

  const handleAnchoragePostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchoragePostCountZ(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ postCountZ: value }));
  };

  const handleAnchoragePostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchoragePostDiameter(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ postDiameter: value }));
  };

  const handleAnchoragePostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchoragePostOffset(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ postOffset: value }));
  }

  const handleAnchorageConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageConcreteOffsetXRight(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ concreteOffsetXRight: value }));
  };

  const handleAnchorageConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageConcreteOffsetXLeft(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ concreteOffsetXLeft: value }));
  };

  const handleAnchorageConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageConcreteOffsetZBack(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ concreteOffsetZBack: value }));
  };

  const handleAnchorageConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageConcreteOffsetZFront(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ concreteOffsetZFront: value }));
  };

  const handleAnchorageConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageConcreteThickness(value);
    onEndAnchorageParamsChange(getEndAnchorageParams({ concreteThickness: value }));
  };

  // Helper function to build complete end anchorage slab params
  const getEndAnchorageSlabParams = (overrides?: Partial<EndAnchorageParams>): EndAnchorageParams => ({
    beamWidth: overrides?.beamWidth ?? anchorageSlabBeamWidth,
    beamDepth: overrides?.beamDepth ?? anchorageSlabBeamDepth,
    beamHeight: overrides?.beamHeight ?? anchorageSlabBeamHeight,
    postCountX: overrides?.postCountX ?? anchorageSlabPostCountX,
    postCountZ: overrides?.postCountZ ?? anchorageSlabPostCountZ,
    postDiameter: overrides?.postDiameter ?? anchorageSlabPostDiameter,
    postOffset: overrides?.postOffset ?? anchorageSlabPostOffset,
    concreteOffsetXRight: overrides?.concreteOffsetXRight ?? anchorageSlabConcreteOffsetXRight,
    concreteOffsetXLeft: overrides?.concreteOffsetXLeft ?? anchorageSlabConcreteOffsetXLeft,
    concreteOffsetZBack: overrides?.concreteOffsetZBack ?? anchorageSlabConcreteOffsetZBack,
    concreteOffsetZFront: overrides?.concreteOffsetZFront ?? anchorageSlabConcreteOffsetZFront,
    concreteThickness: overrides?.concreteThickness ?? anchorageSlabConcreteThickness,
  });

  const handleAnchorageSlabBeamWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabBeamWidth(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ beamWidth: value }));
  };

  const handleAnchorageSlabBeamDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabBeamDepth(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ beamDepth: value }));
  };

  const handleAnchorageSlabBeamHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabBeamHeight(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ beamHeight: value }));
  };

  const handleAnchorageSlabPostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchorageSlabPostCountX(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ postCountX: value }));
  };

  const handleAnchorageSlabPostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchorageSlabPostCountZ(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ postCountZ: value }));
  };

  const handleAnchorageSlabPostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabPostDiameter(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ postDiameter: value }));
  };

  const handleAnchorageSlabPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabPostOffset(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ postOffset: value }));
  };

  const handleAnchorageSlabConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabConcreteOffsetXRight(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ concreteOffsetXRight: value }));
  };

  const handleAnchorageSlabConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabConcreteOffsetXLeft(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ concreteOffsetXLeft: value }));
  };

  const handleAnchorageSlabConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabConcreteOffsetZBack(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ concreteOffsetZBack: value }));
  };

  const handleAnchorageSlabConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabConcreteOffsetZFront(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ concreteOffsetZFront: value }));
  };

  const handleAnchorageSlabConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageSlabConcreteThickness(value);
    onEndAnchorageSlabParamsChange(getEndAnchorageSlabParams({ concreteThickness: value }));
  };

  // Helper function to build complete end anchorage wall params
  const getEndAnchorageWallParams = (overrides?: Partial<EndAnchorageParams>): EndAnchorageParams => ({
    beamWidth: overrides?.beamWidth ?? anchorageWallBeamWidth,
    beamDepth: overrides?.beamDepth ?? anchorageWallBeamDepth,
    beamHeight: overrides?.beamHeight ?? anchorageWallBeamHeight,
    postCountX: overrides?.postCountX ?? anchorageWallPostCountX,
    postCountZ: overrides?.postCountZ ?? anchorageWallPostCountZ,
    postDiameter: overrides?.postDiameter ?? anchorageWallPostDiameter,
    postOffset: overrides?.postOffset ?? anchorageWallPostOffset,
    concreteOffsetXRight: overrides?.concreteOffsetXRight ?? anchorageWallConcreteOffsetXRight,
    concreteOffsetXLeft: overrides?.concreteOffsetXLeft ?? anchorageWallConcreteOffsetXLeft,
    concreteOffsetZBack: overrides?.concreteOffsetZBack ?? anchorageWallConcreteOffsetZBack,
    concreteOffsetZFront: overrides?.concreteOffsetZFront ?? anchorageWallConcreteOffsetZFront,
    concreteThickness: overrides?.concreteThickness ?? anchorageWallConcreteThickness,
  });

  const handleAnchorageWallBeamWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallBeamWidth(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ beamWidth: value }));
  };

  const handleAnchorageWallBeamDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallBeamDepth(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ beamDepth: value }));
  };

  const handleAnchorageWallBeamHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallBeamHeight(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ beamHeight: value }));
  };

  const handleAnchorageWallPostCountXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchorageWallPostCountX(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ postCountX: value }));
  };

  const handleAnchorageWallPostCountZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setAnchorageWallPostCountZ(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ postCountZ: value }));
  };

  const handleAnchorageWallPostDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallPostDiameter(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ postDiameter: value }));
  };

  const handleAnchorageWallPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallPostOffset(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ postOffset: value }));
  };

  const handleAnchorageWallConcreteOffsetXRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallConcreteOffsetXRight(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ concreteOffsetXRight: value }));
  };

  const handleAnchorageWallConcreteOffsetXLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallConcreteOffsetXLeft(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ concreteOffsetXLeft: value }));
  };

  const handleAnchorageWallConcreteOffsetZBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallConcreteOffsetZBack(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ concreteOffsetZBack: value }));
  };

  const handleAnchorageWallConcreteOffsetZFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallConcreteOffsetZFront(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ concreteOffsetZFront: value }));
  };

  const handleAnchorageWallConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnchorageWallConcreteThickness(value);
    onEndAnchorageWallParamsChange(getEndAnchorageWallParams({ concreteThickness: value }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as  'circularColumns' | 'complexColumn' | 'rectangleColumn' | 'lapspliceSlab' | 'lapspliceBeam' | 'endAnchorage' | 'endAnchorageSlab' | 'endAnchorageWall';
    setCurrentModel(model);
    onModelChange(model);
  };

  return (
    <div className="control-panel">
      <h2>Controls</h2>
      
      <div className="control-group">
        <label>Select Model</label>
        <select value={currentModel} onChange={handleModelChange}>
          <option value="circularColumns">Circular Columns</option>
          <option value="complexColumn">Complex Column</option>
          <option value="rectangleColumn">Rectangle Column</option>
          <option value="lapspliceSlab">Lapsplice Slab</option>
          <option value="lapspliceBeam">Lapsplice Beam</option>
          <option value="lapspliceWall">Lapsplice Wall</option>
          <option value="endAnchorage">End Anchorage</option>
          <option value="endAnchorageSlab">End Anchorage Slab</option>
          <option value="endAnchorageWall">End Anchorage Wall</option>
        </select>
      </div>
      {currentModel === 'circularColumns' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={towerIsFiniteConcrete}
                onChange={handleTowerIsFiniteConcreteChange}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={towerConcreteThickness}
              onChange={handleTowerConcreteThicknessChange}
              step="0.1"
              min="0.1"
              max="3"
              placeholder="Enter concrete thickness"
            />
          </div>

          <div className="control-group">
            <label>Cylinder Height</label>
            <input
              type="number"
              value={towerCylinderHeight}
              onChange={handleTowerCylinderHeightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter height"
            />
          </div>

          <div className="control-group">
            <label>Cylinder Radius</label>
            <input
              type="number"
              value={towerCylinderRadius}
              onChange={handleTowerCylinderRadiusChange}
              step="0.1"
              min="0.1"
              placeholder="Enter radius"
            />
          </div>

          <div className="control-group">
            <label>Post Radius</label>
            <input
              type="number"
              value={towerPostRadius}
              onChange={handleTowerPostRadiusChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post radius"
            />
          </div>

          <div className="control-group">
            <label>Post Count</label>
            <input
              type="number"
              value={towerPostCount}
              onChange={handleTowerPostCountChange}
              step="1"
              min="3"
              placeholder="Enter post count"
            />
          </div>

          <div className="control-group">
            <label>Circumference Offset</label>
            <input
              type="number"
              value={towerCircumferenceOffset}
              onChange={handleTowerCircumferenceOffsetChange}
              step="0.01"
              min="0"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={towerConcreteOffsetXRight}
              onChange={handleTowerConcreteOffsetXRightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={towerConcreteOffsetXLeft}
              onChange={handleTowerConcreteOffsetXLeftChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={towerConcreteOffsetZBack}
              onChange={handleTowerConcreteOffsetZBackChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={towerConcreteOffsetZFront}
              onChange={handleTowerConcreteOffsetZFrontChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>
        </>
      )}

      {currentModel === 'complexColumn' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={complexIsFiniteConcrete}
                onChange={(e) => {
                  const value = e.target.checked;
                  setComplexIsFiniteConcrete(value);
                  onComplexColumnParamsChange(getComplexColumnParams({ isFiniteConcrete: value }));
                }}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={complexConcreteThickness}
              onChange={handleComplexConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter thickness"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={complexConcreteOffsetXRight}
              onChange={handleComplexConcreteOffsetXRightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={complexConcreteOffsetXLeft}
              onChange={handleComplexConcreteOffsetXLeftChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={complexConcreteOffsetZBack}
              onChange={handleComplexConcreteOffsetZBackChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={complexConcreteOffsetZFront}
              onChange={handleComplexConcreteOffsetZFrontChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 1 Width (X)</label>
            <input
              type="number"
              value={cuboid1SizeX}
              onChange={handleCuboid1SizeXChange}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 1 Length (Z)</label>
            <input
              type="number"
              value={cuboid1SizeZ}
              onChange={handleCuboid1SizeZChange}
              step="0.1"
              min="0.1"
              placeholder="Enter length"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Width (X)</label>
            <input
              type="number"
              value={cuboid2SizeX}
              onChange={handleCuboid2SizeXChange}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Length (Z)</label>
            <input
              type="number"
              value={cuboid2SizeZ}
              onChange={handleCuboid2SizeZChange}
              step="0.1"
              min="0.1"
              placeholder="Enter length"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Translate X</label>
            <input
              type="number"
              value={cuboid2TranslateX}
              onChange={handleCuboid2TranslateXChange}
              step="0.1"
              placeholder="Enter X translation"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Translate Z</label>
            <input
              type="number"
              value={cuboid2TranslateZ}
              onChange={handleCuboid2TranslateZChange}
              step="0.1"
              placeholder="Enter Z translation"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 1 Post Count - Left Edge</label>
            <input
              type="number"
              value={cuboid1PostCountLeftEdge}
              onChange={handleCuboid1PostCountLeftEdgeChange}
              step="1"
              min="2"
              placeholder="Enter post count"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 1 Post Count - Top Edge</label>
            <input
              type="number"
              value={cuboid1PostCountTopEdge}
              onChange={handleCuboid1PostCountTopEdgeChange}
              step="1"
              min="2"
              placeholder="Enter post count"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Post Count - Left Edge</label>
            <input
              type="number"
              value={cuboid2PostCountLeftEdge}
              onChange={handleCuboid2PostCountLeftEdgeChange}
              step="1"
              min="2"
              placeholder="Enter post count"
            />
          </div>

          <div className="control-group">
            <label>Cuboid 2 Post Count - Top Edge</label>
            <input
              type="number"
              value={cuboid2PostCountTopEdge}
              onChange={handleCuboid2PostCountTopEdgeChange}
              step="1"
              min="2"
              placeholder="Enter post count"
            />
          </div>

          <div className="control-group">
            <label>Post Radius</label>
            <input
              type="number"
              value={complexColumnPostRadius}
              onChange={handleComplexColumnPostRadiusChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post radius"
            />
          </div>

          <div className="control-group">
            <label>Post Offset from Perimeter</label>
            <input
              type="number"
              value={complexColumnPostOffset}
              onChange={handleComplexColumnPostOffsetChange}
              step="0.01"
              min="0.01"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>
        </>
      )}

      {currentModel === 'rectangleColumn' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={rectangleIsFiniteConcrete}
                onChange={(e) => {
                  const value = e.target.checked;
                  setRectangleIsFiniteConcrete(value);
                  onRectangleColumnParamsChange({
                    isFiniteConcrete: value,
                    concreteThickness: concreteThickness,
                    columnWidth: columnWidth,
                    columnDepth: columnDepth,
                    postCountX: postCountX,
                    postCountZ: postCountZ,
                    postDiameter: postDiameter,
                    postOffset: postOffset,
                    concreteOffsetXRight: concreteOffsetXRight,
                    concreteOffsetXLeft: concreteOffsetXLeft,
                    concreteOffsetZBack: concreteOffsetZBack,
                    concreteOffsetZFront: concreteOffsetZFront,
                  });
                }}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness (Floor Height)</label>
            <input
              type="number"
              value={concreteThickness}
              onChange={handleConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter thickness"
            />
          </div>

          <div className="control-group">
            <label>Column Width (X)</label>
            <input
              type="number"
              value={columnWidth}
              onChange={handleColumnWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Column Depth (Z)</label>
            <input
              type="number"
              value={columnDepth}
              onChange={handleColumnDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter depth"
            />
          </div>

          <div className="control-group">
            <label>Post Count X (Width)</label>
            <input
              type="number"
              value={postCountX}
              onChange={handleRectanglePostCountXChange}
              step="1"
              min="1"
              placeholder="Enter post count in X"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z (Depth)</label>
            <input
              type="number"
              value={postCountZ}
              onChange={handleRectanglePostCountZChange}
              step="1"
              min="1"
              placeholder="Enter post count in Z"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={postDiameter}
              onChange={handlePostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset from Perimeter</label>
            <input
              type="number"
              value={postOffset}
              onChange={handleRectanglePostOffsetChange}
              step="0.01"
              min="0.01"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={concreteOffsetXRight}
              onChange={handleConcreteOffsetXRightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={concreteOffsetXLeft}
              onChange={handleConcreteOffsetXLeftChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={concreteOffsetZBack}
              onChange={handleConcreteOffsetZBackChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={concreteOffsetZFront}
              onChange={handleConcreteOffsetZFrontChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>
        </>
      )}

      {currentModel === 'lapspliceSlab' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={lapspliceSlabIsFiniteConcrete}
                onChange={handleLapspliceSlabIsFiniteConcreteChange}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness (Floor Height)</label>
            <input
              type="number"
              value={lapspliceSlabConcreteThickness}
              onChange={handleLapspliceSlabConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter thickness"
            />
          </div>

          <div className="control-group">
            <label>Slab Width (X)</label>
            <input
              type="number"
              value={lapspliceSlabWidth}
              onChange={handleLapspliceSlabWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Slab Depth (Z)</label>
            <input
              type="number"
              value={lapspliceSlabDepth}
              onChange={handleLapspliceSlabDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter depth"
            />
          </div>

          <div className="control-group">
            <label>Post Count X (Width)</label>
            <input
              type="number"
              value={lapspliceSlabPostCountX}
              onChange={handleLapspliceSlabPostCountXChange}
              step="1"
              min="1"
              placeholder="Enter post count in X"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z (Depth)</label>
            <input
              type="number"
              value={lapspliceSlabPostCountZ}
              onChange={handleLapspliceSlabPostCountZChange}
              step="1"
              min="1"
              placeholder="Enter post count in Z"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={lapspliceSlabPostDiameter}
              onChange={handleLapspliceSlabPostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset from Perimeter</label>
            <input
              type="number"
              value={lapspliceSlabPostOffset}
              onChange={handleLapspliceSlabPostOffsetChange}
              step="0.01"
              min="0.01"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={lapspliceSlabConcreteOffsetXRight}
              onChange={handleLapspliceSlabConcreteOffsetXRightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={lapspliceSlabConcreteOffsetXLeft}
              onChange={handleLapspliceSlabConcreteOffsetXLeftChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={lapspliceSlabConcreteOffsetZBack}
              onChange={handleLapspliceSlabConcreteOffsetZBackChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={lapspliceSlabConcreteOffsetZFront}
              onChange={handleLapspliceSlabConcreteOffsetZFrontChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>
        </>
      )}

      {currentModel === 'lapspliceBeam' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={beamIsFiniteConcrete}
                onChange={(e) => {
                  setBeamIsFiniteConcrete(e.target.checked);
                  onLapspliceBeamParamsChange({
                    isFiniteConcrete: e.target.checked,
                    concreteThickness: beamConcreteThickness,
                    slabWidth: beamWidth,
                    slabDepth: beamDepth,
                    postCountX: beamPostCountX,
                    postCountZ: beamPostCountZ,
                    postDiameter: beamPostDiameter,
                    postOffset: beamPostOffset,
                    concreteOffsetXRight: beamConcreteOffsetXRight,
                    concreteOffsetXLeft: beamConcreteOffsetXLeft,
                    concreteOffsetZBack: beamConcreteOffsetZBack,
                    concreteOffsetZFront: beamConcreteOffsetZFront,
                  });
                }}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={beamConcreteThickness}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamConcreteThickness(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: value,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter thickness"
            />
          </div>

          <div className="control-group">
            <label>Beam Width (X)</label>
            <input
              type="number"
              value={beamWidth}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamWidth(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: value,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Beam Depth (Z)</label>
            <input
              type="number"
              value={beamDepth}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamDepth(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: value,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter depth"
            />
          </div>

          <div className="control-group">
            <label>Post Count X</label>
            <input
              type="number"
              value={beamPostCountX}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setBeamPostCountX(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: value,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="1"
              min="1"
              placeholder="Enter post count in X"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z</label>
            <input
              type="number"
              value={beamPostCountZ}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setBeamPostCountZ(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: value,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="1"
              min="1"
              placeholder="Enter post count in Z"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={beamPostDiameter}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamPostDiameter(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: value,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset from Perimeter</label>
            <input
              type="number"
              value={beamPostOffset}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamPostOffset(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: value,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.01"
              min="0.01"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={beamConcreteOffsetXRight}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamConcreteOffsetXRight(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: value,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={beamConcreteOffsetXLeft}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamConcreteOffsetXLeft(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: value,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={beamConcreteOffsetZBack}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamConcreteOffsetZBack(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: value,
                  concreteOffsetZFront: beamConcreteOffsetZFront,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={beamConcreteOffsetZFront}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBeamConcreteOffsetZFront(value);
                onLapspliceBeamParamsChange({
                  isFiniteConcrete: beamIsFiniteConcrete,
                  concreteThickness: beamConcreteThickness,
                  slabWidth: beamWidth,
                  slabDepth: beamDepth,
                  postCountX: beamPostCountX,
                  postCountZ: beamPostCountZ,
                  postDiameter: beamPostDiameter,
                  postOffset: beamPostOffset,
                  concreteOffsetXRight: beamConcreteOffsetXRight,
                  concreteOffsetXLeft: beamConcreteOffsetXLeft,
                  concreteOffsetZBack: beamConcreteOffsetZBack,
                  concreteOffsetZFront: value,
                });
              }}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>
        </>
      )}

      {currentModel === 'lapspliceWall' && (
        <>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={wallIsFiniteConcrete}
                onChange={handleWallIsFiniteConcreteChange}
              />
              Finite Concrete
            </label>
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={wallConcreteThickness}
              onChange={handleWallConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter thickness"
            />
          </div>

          <div className="control-group">
            <label>Wall Width (X)</label>
            <input
              type="number"
              value={wallWidth}
              onChange={handleWallWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter width"
            />
          </div>

          <div className="control-group">
            <label>Wall Depth (Z)</label>
            <input
              type="number"
              value={wallDepth}
              onChange={handleWallDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter depth"
            />
          </div>

          <div className="control-group">
            <label>Post Count X</label>
            <input
              type="number"
              value={wallPostCountX}
              onChange={handleWallPostCountXChange}
              step="1"
              min="1"
              placeholder="Enter post count in X"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z</label>
            <input
              type="number"
              value={wallPostCountZ}
              onChange={handleWallPostCountZChange}
              step="1"
              min="1"
              placeholder="Enter post count in Z"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={wallPostDiameter}
              onChange={handleWallPostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset from Perimeter</label>
            <input
              type="number"
              value={wallPostOffset}
              onChange={handleWallPostOffsetChange}
              step="0.01"
              min="0.01"
              max="0.5"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X+ (Right)</label>
            <input
              type="number"
              value={wallConcreteOffsetXRight}
              onChange={handleWallConcreteOffsetXRightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={wallConcreteOffsetXLeft}
              onChange={handleWallConcreteOffsetXLeftChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={wallConcreteOffsetZBack}
              onChange={handleWallConcreteOffsetZBackChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={wallConcreteOffsetZFront}
              onChange={handleWallConcreteOffsetZFrontChange}
              step="0.1"
              min="0.1"
              placeholder="Enter Concrete Offset Z-"
            />
          </div>
        </>
      )}

      {currentModel === 'endAnchorage' && (
        <>
          <div className="control-group">
            <label>Beam Width (X)</label>
            <input
              type="number"
              value={anchorageBeamWidth}
              onChange={handleAnchorageBeamWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam width"
            />
          </div>

          <div className="control-group">
            <label>Beam Depth (Z)</label>
            <input
              type="number"
              value={anchorageBeamDepth}
              onChange={handleAnchorageBeamDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam depth"
            />
          </div>

          <div className="control-group">
            <label>Beam Height (Y)</label>
            <input
              type="number"
              value={anchorageBeamHeight}
              onChange={handleAnchorageBeamHeightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam height"
            />
          </div>

          <div className="control-group">
            <label>Post Count X</label>
            <input
              type="number"
              value={anchoragePostCountX}
              onChange={handleAnchoragePostCountXChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in X direction"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z</label>
            <input
              type="number"
              value={anchoragePostCountZ}
              onChange={handleAnchoragePostCountZChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in Z direction"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={anchoragePostDiameter}
              onChange={handleAnchoragePostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset</label>
            <input
              type="number"
              value={anchoragePostOffset}
              onChange={handleAnchoragePostOffsetChange}
              step="0.05"
              min="0"
              placeholder="Enter post offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Right</label>
            <input
              type="number"
              value={anchorageConcreteOffsetXRight}
              onChange={handleAnchorageConcreteOffsetXRightChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X right"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Left</label>
            <input
              type="number"
              value={anchorageConcreteOffsetXLeft}
              onChange={handleAnchorageConcreteOffsetXLeftChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X left"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Back</label>
            <input
              type="number"
              value={anchorageConcreteOffsetZBack}
              onChange={handleAnchorageConcreteOffsetZBackChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z back"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Front</label>
            <input
              type="number"
              value={anchorageConcreteOffsetZFront}
              onChange={handleAnchorageConcreteOffsetZFrontChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z front"
            />
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={anchorageConcreteThickness}
              onChange={handleAnchorageConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter concrete thickness"
            />
          </div>
        </>
      )}

      {currentModel === 'endAnchorageSlab' && (
        <>
          <div className="control-group">
            <label>Beam Width (X)</label>
            <input
              type="number"
              value={anchorageSlabBeamWidth}
              onChange={handleAnchorageSlabBeamWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam width"
            />
          </div>

          <div className="control-group">
            <label>Beam Depth (Z)</label>
            <input
              type="number"
              value={anchorageSlabBeamDepth}
              onChange={handleAnchorageSlabBeamDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam depth"
            />
          </div>

          <div className="control-group">
            <label>Beam Height (Y)</label>
            <input
              type="number"
              value={anchorageSlabBeamHeight}
              onChange={handleAnchorageSlabBeamHeightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam height"
            />
          </div>

          <div className="control-group">
            <label>Post Count X</label>
            <input
              type="number"
              value={anchorageSlabPostCountX}
              onChange={handleAnchorageSlabPostCountXChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in X direction"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z</label>
            <input
              type="number"
              value={anchorageSlabPostCountZ}
              onChange={handleAnchorageSlabPostCountZChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in Z direction"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={anchorageSlabPostDiameter}
              onChange={handleAnchorageSlabPostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset</label>
            <input
              type="number"
              value={anchorageSlabPostOffset}
              onChange={handleAnchorageSlabPostOffsetChange}
              step="0.05"
              min="0"
              placeholder="Enter post offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Right</label>
            <input
              type="number"
              value={anchorageSlabConcreteOffsetXRight}
              onChange={handleAnchorageSlabConcreteOffsetXRightChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X right"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Left</label>
            <input
              type="number"
              value={anchorageSlabConcreteOffsetXLeft}
              onChange={handleAnchorageSlabConcreteOffsetXLeftChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X left"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Back</label>
            <input
              type="number"
              value={anchorageSlabConcreteOffsetZBack}
              onChange={handleAnchorageSlabConcreteOffsetZBackChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z back"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Front</label>
            <input
              type="number"
              value={anchorageSlabConcreteOffsetZFront}
              onChange={handleAnchorageSlabConcreteOffsetZFrontChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z front"
            />
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={anchorageSlabConcreteThickness}
              onChange={handleAnchorageSlabConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter concrete thickness"
            />
          </div>
        </>
      )}

      {currentModel === 'endAnchorageWall' && (
        <>
          <div className="control-group">
            <label>Beam Width (X)</label>
            <input
              type="number"
              value={anchorageWallBeamWidth}
              onChange={handleAnchorageWallBeamWidthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam width"
            />
          </div>

          <div className="control-group">
            <label>Beam Depth (Z)</label>
            <input
              type="number"
              value={anchorageWallBeamDepth}
              onChange={handleAnchorageWallBeamDepthChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam depth"
            />
          </div>

          <div className="control-group">
            <label>Beam Height (Y)</label>
            <input
              type="number"
              value={anchorageWallBeamHeight}
              onChange={handleAnchorageWallBeamHeightChange}
              step="0.1"
              min="0.1"
              placeholder="Enter beam height"
            />
          </div>

          <div className="control-group">
            <label>Post Count X</label>
            <input
              type="number"
              value={anchorageWallPostCountX}
              onChange={handleAnchorageWallPostCountXChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in X direction"
            />
          </div>

          <div className="control-group">
            <label>Post Count Z</label>
            <input
              type="number"
              value={anchorageWallPostCountZ}
              onChange={handleAnchorageWallPostCountZChange}
              step="1"
              min="1"
              placeholder="Enter number of posts in Z direction"
            />
          </div>

          <div className="control-group">
            <label>Post Diameter</label>
            <input
              type="number"
              value={anchorageWallPostDiameter}
              onChange={handleAnchorageWallPostDiameterChange}
              step="0.01"
              min="0.01"
              placeholder="Enter post diameter"
            />
          </div>

          <div className="control-group">
            <label>Post Offset</label>
            <input
              type="number"
              value={anchorageWallPostOffset}
              onChange={handleAnchorageWallPostOffsetChange}
              step="0.05"
              min="0"
              placeholder="Enter post offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Right</label>
            <input
              type="number"
              value={anchorageWallConcreteOffsetXRight}
              onChange={handleAnchorageWallConcreteOffsetXRightChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X right"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X Left</label>
            <input
              type="number"
              value={anchorageWallConcreteOffsetXLeft}
              onChange={handleAnchorageWallConcreteOffsetXLeftChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset X left"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Back</label>
            <input
              type="number"
              value={anchorageWallConcreteOffsetZBack}
              onChange={handleAnchorageWallConcreteOffsetZBackChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z back"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z Front</label>
            <input
              type="number"
              value={anchorageWallConcreteOffsetZFront}
              onChange={handleAnchorageWallConcreteOffsetZFrontChange}
              step="0.05"
              min="0"
              placeholder="Enter concrete offset Z front"
            />
          </div>

          <div className="control-group">
            <label>Concrete Thickness</label>
            <input
              type="number"
              value={anchorageWallConcreteThickness}
              onChange={handleAnchorageWallConcreteThicknessChange}
              step="0.1"
              min="0.1"
              placeholder="Enter concrete thickness"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ControlPanel;
