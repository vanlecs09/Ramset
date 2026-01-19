import { useState } from 'react';
import './App.css';
import ConstructionViewer from './components/ConstructionViewer';
import { ControlPanel } from './components/ControlPanel';
import { DEFAULT_TOWER_PARAMS, DEFAULT_COMPLEX_COLUMN_PARAMS, DEFAULT_RECTANGLE_COLUMN_PARAMS } from './constants/defaultParams';

export interface CircularColumnParams {
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

export interface ComplexColumnParams {
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

export interface RectangleColumnParams {
  isFiniteConcrete: boolean;
  concreteThickness: number;
  columnWidth: number;
  columnDepth: number;
  postCountX: number;
  postCountZ: number;
  postDiameter: number;
  postOffset: number;
  concreteOffsetXRight: number;
  concreteOffsetXLeft: number;
  concreteOffsetZBack: number;
  concreteOffsetZFront: number;
}

function App() {
  const [currentModel, setCurrentModel] = useState< 'circularColumns' | 'complexColumn' | 'rectangleColumn'>('complexColumn');
  const [towerParams, setTowerParams] = useState<CircularColumnParams>(DEFAULT_TOWER_PARAMS);
  const [complexColumnParams, setComplexColumnParams] = useState<ComplexColumnParams>(DEFAULT_COMPLEX_COLUMN_PARAMS);
  const [rectangleColumnParams, setRectangleColumnParams] = useState<RectangleColumnParams>(DEFAULT_RECTANGLE_COLUMN_PARAMS);

  return (
    <div className="app-container">
      <ControlPanel
        onModelChange={setCurrentModel}
        onTowerParamsChange={setTowerParams}
        onComplexColumnParamsChange={setComplexColumnParams}
        onRectangleColumnParamsChange={setRectangleColumnParams}
      />
      <div className="viewer-container">
        <ConstructionViewer
          model={currentModel}
          towerParams={towerParams}
          complexColumnParams={complexColumnParams}
          rectangleColumnParams={rectangleColumnParams}
        />
      </div>
      <footer className="app-footer">
        <p>Built with React, Vite, and Three.js</p>
      </footer>
    </div>
  );
}

export default App;
