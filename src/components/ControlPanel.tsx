import React, { useState } from 'react';
import '../styles/ControlPanel.css';
import type { RectangleColumnParams } from '../App';
import { DEFAULT_TOWER_PARAMS, DEFAULT_COMPLEX_COLUMN_PARAMS, DEFAULT_RECTANGLE_COLUMN_PARAMS } from '../constants/defaultParams';

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
  onModelChange: (model:  'circularColumns' | 'complexColumn' | 'rectangleColumn') => void;
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
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onModelChange,
  onTowerParamsChange,
  onComplexColumnParamsChange,
  onRectangleColumnParamsChange,
}) => {
  const [currentModel, setCurrentModel] = useState<'circularColumns' | 'complexColumn' | 'rectangleColumn'>('circularColumns');

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

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as  'circularColumns' | 'complexColumn' | 'rectangleColumn';
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
    </div>
  );
};

export default ControlPanel;
