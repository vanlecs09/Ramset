import React, { useState } from 'react';
import '../styles/ControlPanel.css';
import type { RectangleColumnParams } from '../App';
import { DEFAULT_TOWER_PARAMS, DEFAULT_COMPLEX_COLUMN_PARAMS, DEFAULT_RECTANGLE_COLUMN_PARAMS } from '../constants/defaultParams';

interface ComplexColumnParams {
  isFiniteConcrete: boolean;
  concreteThickness: number;
  offsetXPos: number;
  offsetXNeg: number;
  offsetZPos: number;
  offsetZNeg: number;
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
    offsetXPos: number;
    offsetXNeg: number;
    offsetZPos: number;
    offsetZNeg: number;
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
  const [currentModel, setCurrentModel] = useState<'circularColumns' | 'complexColumn' | 'rectangleColumn'>('rectangleColumn');

  // Tower parameters
  const [towerIsFiniteConcrete, setTowerIsFiniteConcrete] = useState(DEFAULT_TOWER_PARAMS.isFiniteConcrete);
  const [towerConcreteThickness, setTowerConcreteThickness] = useState(DEFAULT_TOWER_PARAMS.concreteThickness);
  const [towerCylinderHeight, setTowerCylinderHeight] = useState(DEFAULT_TOWER_PARAMS.cylinderHeight);
  const [towerCylinderRadius, setTowerCylinderRadius] = useState(DEFAULT_TOWER_PARAMS.cylinderRadius);
  const [towerPostRadius, setTowerPostRadius] = useState(DEFAULT_TOWER_PARAMS.postRadius);
  const [towerPostCount, setTowerPostCount] = useState(DEFAULT_TOWER_PARAMS.postCount);
  const [towerCircumferenceOffset, setTowerCircumferenceOffset] = useState(DEFAULT_TOWER_PARAMS.circumferenceToPostOffset);
  const [towerOffsetXPos, setTowerOffsetXPos] = useState(DEFAULT_TOWER_PARAMS.offsetXPos);
  const [towerOffsetXNeg, setTowerOffsetXNeg] = useState(DEFAULT_TOWER_PARAMS.offsetXNeg);
  const [towerOffsetZPos, setTowerOffsetZPos] = useState(DEFAULT_TOWER_PARAMS.offsetZPos);
  const [towerOffsetZNeg, setTowerOffsetZNeg] = useState(DEFAULT_TOWER_PARAMS.offsetZNeg);

  // Complex Column parameters
  const [complexIsFiniteConcrete, setComplexIsFiniteConcrete] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.isFiniteConcrete);
  const [complexConcreteThickness, setComplexConcreteThickness] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.concreteThickness);
  const [complexOffsetXPos, setComplexOffsetXPos] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.offsetXPos);
  const [complexOffsetXNeg, setComplexOffsetXNeg] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.offsetXNeg);
  const [complexOffsetZPos, setComplexOffsetZPos] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.offsetZPos);
  const [complexOffsetZNeg, setComplexOffsetZNeg] = useState(DEFAULT_COMPLEX_COLUMN_PARAMS.offsetZNeg);
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
  const [offsetXPos, setOffsetXPos] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.offsetXPos);
  const [offsetXNeg, setOffsetXNeg] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.offsetXNeg);
  const [offsetZPos, setOffsetZPos] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.offsetZPos);
  const [offsetZNeg, setOffsetZNeg] = useState(DEFAULT_RECTANGLE_COLUMN_PARAMS.offsetZNeg);

  // Helper function to build complete complex column params
  const getComplexColumnParams = (overrides?: Partial<ComplexColumnParams>): ComplexColumnParams => ({
    isFiniteConcrete: overrides?.isFiniteConcrete ?? complexIsFiniteConcrete,
    concreteThickness: overrides?.concreteThickness ?? complexConcreteThickness,
    offsetXPos: overrides?.offsetXPos ?? complexOffsetXPos,
    offsetXNeg: overrides?.offsetXNeg ?? complexOffsetXNeg,
    offsetZPos: overrides?.offsetZPos ?? complexOffsetZPos,
    offsetZNeg: overrides?.offsetZNeg ?? complexOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
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
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
    });
  };

  const handleTowerOffsetXPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerOffsetXPos(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      offsetXPos: value,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
    });
  };

  const handleTowerOffsetXNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerOffsetXNeg(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      offsetXPos: towerOffsetXPos,
      offsetXNeg: value,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: towerOffsetZNeg,
    });
  };

  const handleTowerOffsetZPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerOffsetZPos(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: value,
      offsetZNeg: towerOffsetZNeg,
    });
  };

  const handleTowerOffsetZNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTowerOffsetZNeg(value);
    onTowerParamsChange({
      isFiniteConcrete: towerIsFiniteConcrete,
      concreteThickness: towerConcreteThickness,
      cylinderHeight: towerCylinderHeight,
      cylinderRadius: towerCylinderRadius,
      postRadius: towerPostRadius,
      postCount: towerPostCount,
      circumferenceToPostOffset: towerCircumferenceOffset,
      offsetXPos: towerOffsetXPos,
      offsetXNeg: towerOffsetXNeg,
      offsetZPos: towerOffsetZPos,
      offsetZNeg: value,
    });
  };

  const handleComplexConcreteThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexConcreteThickness(value);
    onComplexColumnParamsChange(getComplexColumnParams({ concreteThickness: value }));
  };

  const handleComplexOffsetXPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexOffsetXPos(value);
    onComplexColumnParamsChange(getComplexColumnParams({ offsetXPos: value }));
  };

  const handleComplexOffsetXNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexOffsetXNeg(value);
    onComplexColumnParamsChange(getComplexColumnParams({ offsetXNeg: value }));
  };

  const handleComplexOffsetZPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexOffsetZPos(value);
    onComplexColumnParamsChange(getComplexColumnParams({ offsetZPos: value }));
  };

  const handleComplexOffsetZNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexOffsetZNeg(value);
    onComplexColumnParamsChange(getComplexColumnParams({ offsetZNeg: value }));
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
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
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
    });
  };

  const handleOffsetXPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setOffsetXPos(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      offsetXPos: value,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
    });
  };

  const handleOffsetXNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setOffsetXNeg(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      offsetXPos: offsetXPos,
      offsetXNeg: value,
      offsetZPos: offsetZPos,
      offsetZNeg: offsetZNeg,
    });
  };

  const handleOffsetZPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setOffsetZPos(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: value,
      offsetZNeg: offsetZNeg,
    });
  };

  const handleOffsetZNegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setOffsetZNeg(value);
    onRectangleColumnParamsChange({
      isFiniteConcrete: rectangleIsFiniteConcrete,
      concreteThickness: concreteThickness,
      columnWidth: columnWidth,
      columnDepth: columnDepth,
      postCountX: postCountX,
      postCountZ: postCountZ,
      postDiameter: postDiameter,
      postOffset: postOffset,
      offsetXPos: offsetXPos,
      offsetXNeg: offsetXNeg,
      offsetZPos: offsetZPos,
      offsetZNeg: value,
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
              value={towerOffsetXPos}
              onChange={handleTowerOffsetXPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={towerOffsetXNeg}
              onChange={handleTowerOffsetXNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={towerOffsetZPos}
              onChange={handleTowerOffsetZPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={towerOffsetZNeg}
              onChange={handleTowerOffsetZNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
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
              value={complexOffsetXPos}
              onChange={handleComplexOffsetXPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={complexOffsetXNeg}
              onChange={handleComplexOffsetXNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={complexOffsetZPos}
              onChange={handleComplexOffsetZPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={complexOffsetZNeg}
              onChange={handleComplexOffsetZNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset"
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
                    offsetXPos: offsetXPos,
                    offsetXNeg: offsetXNeg,
                    offsetZPos: offsetZPos,
                    offsetZNeg: offsetZNeg,
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
              value={offsetXPos}
              onChange={handleOffsetXPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset X+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset X- (Left)</label>
            <input
              type="number"
              value={offsetXNeg}
              onChange={handleOffsetXNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset X-"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z+ (Back)</label>
            <input
              type="number"
              value={offsetZPos}
              onChange={handleOffsetZPosChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset Z+"
            />
          </div>

          <div className="control-group">
            <label>Concrete Offset Z- (Front)</label>
            <input
              type="number"
              value={offsetZNeg}
              onChange={handleOffsetZNegChange}
              step="0.1"
              min="0.1"
              placeholder="Enter offset Z-"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ControlPanel;
