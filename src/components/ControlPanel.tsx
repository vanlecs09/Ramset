import React, { useState } from 'react';
import '../styles/ControlPanel.css';
import type { RectangleColumnParams } from '../App';

interface ComplexColumnParams {
  isFiniteConcrete: boolean;
  cuboid1SizeX: number;
  cuboid1SizeZ: number;
  cuboid2SizeX: number;
  cuboid2SizeZ: number;
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
  const [currentModel, setCurrentModel] = useState<'circularColumns' | 'complexColumn' | 'rectangleColumn'>('circularColumns');

  // Tower parameters
  const [towerIsFiniteConcrete, setTowerIsFiniteConcrete] = useState(true);
  
  const [towerConcreteThickness, setTowerConcreteThickness] = useState(1.5);
  const [towerCylinderHeight, setTowerCylinderHeight] = useState(1);
  const [towerCylinderRadius, setTowerCylinderRadius] = useState(1.5);
  const [towerPostRadius, setTowerPostRadius] = useState(0.05);
  const [towerPostCount, setTowerPostCount] = useState(10);
  const [towerCircumferenceOffset, setTowerCircumferenceOffset] = useState(0.06);
  const [towerOffsetXPos, setTowerOffsetXPos] = useState(1.5);
  const [towerOffsetXNeg, setTowerOffsetXNeg] = useState(1.5);
  const [towerOffsetZPos, setTowerOffsetZPos] = useState(1.5);
  const [towerOffsetZNeg, setTowerOffsetZNeg] = useState(1.5);

  // Complex Column parameters
  const [complexIsFiniteConcrete, setComplexIsFiniteConcrete] = useState(true);
  const [cuboid1SizeX, setCuboid1SizeX] = useState(2);
  const [cuboid1SizeZ, setCuboid1SizeZ] = useState(2);
  const [cuboid2SizeX, setCuboid2SizeX] = useState(2);
  const [cuboid2SizeZ, setCuboid2SizeZ] = useState(2);
  const [complexColumnPostRadius, setComplexColumnPostRadius] = useState(0.05);
  const [complexColumnPostOffset, setComplexColumnPostOffset] = useState(0.1);

  // Rectangle Column parameters
  const [rectangleIsFiniteConcrete, setRectangleIsFiniteConcrete] = useState(true);

  // Rectangle Column parameters
  const [concreteThickness, setConcreteThickness] = useState(3);
  const [columnWidth, setColumnWidth] = useState(1);
  const [columnDepth, setColumnDepth] = useState(1.5);
  const [postCountX, setPostCountX] = useState(3);
  const [postCountZ, setPostCountZ] = useState(2);
  const [postDiameter, setPostDiameter] = useState(0.1);
  const [postOffset, setPostOffset] = useState(0.1);
  const [offsetXPos, setOffsetXPos] = useState(1.5);
  const [offsetXNeg, setOffsetXNeg] = useState(1.5);
  const [offsetZPos, setOffsetZPos] = useState(1.5);
  const [offsetZNeg, setOffsetZNeg] = useState(1.5);

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

  const handleCuboid1SizeXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid1SizeX(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: value,
      cuboid1SizeZ: cuboid1SizeZ,
      cuboid2SizeX: cuboid2SizeX,
      cuboid2SizeZ: cuboid2SizeZ,
      postRadius: complexColumnPostRadius,
      postOffset: complexColumnPostOffset,
    });
  };

  const handleCuboid1SizeZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid1SizeZ(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: cuboid1SizeX,
      cuboid1SizeZ: value,
      cuboid2SizeX: cuboid2SizeX,
      cuboid2SizeZ: cuboid2SizeZ,
      postRadius: complexColumnPostRadius,
      postOffset: complexColumnPostOffset,
    });
  };

  const handleCuboid2SizeXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2SizeX(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: cuboid1SizeX,
      cuboid1SizeZ: cuboid1SizeZ,
      cuboid2SizeX: value,
      cuboid2SizeZ: cuboid2SizeZ,
      postRadius: complexColumnPostRadius,
      postOffset: complexColumnPostOffset,
    });
  };

  const handleCuboid2SizeZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCuboid2SizeZ(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: cuboid1SizeX,
      cuboid1SizeZ: cuboid1SizeZ,
      cuboid2SizeX: cuboid2SizeX,
      cuboid2SizeZ: value,
      postRadius: complexColumnPostRadius,
      postOffset: complexColumnPostOffset,
    });
  };

  const handleComplexColumnPostRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexColumnPostRadius(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: cuboid1SizeX,
      cuboid1SizeZ: cuboid1SizeZ,
      cuboid2SizeX: cuboid2SizeX,
      cuboid2SizeZ: cuboid2SizeZ,
      postRadius: value,
      postOffset: complexColumnPostOffset,
    });
  };

  const handleComplexColumnPostOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setComplexColumnPostOffset(value);
    onComplexColumnParamsChange({
      isFiniteConcrete: complexIsFiniteConcrete,
      cuboid1SizeX: cuboid1SizeX,
      cuboid1SizeZ: cuboid1SizeZ,
      cuboid2SizeX: cuboid2SizeX,
      cuboid2SizeZ: cuboid2SizeZ,
      postRadius: complexColumnPostRadius,
      postOffset: value,
    });
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
                  onComplexColumnParamsChange({
                    isFiniteConcrete: value,
                    cuboid1SizeX: cuboid1SizeX,
                    cuboid1SizeZ: cuboid1SizeZ,
                    cuboid2SizeX: cuboid2SizeX,
                    cuboid2SizeZ: cuboid2SizeZ,
                    postRadius: complexColumnPostRadius,
                    postOffset: complexColumnPostOffset,
                  });
                }}
              />
              Finite Concrete
            </label>
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
