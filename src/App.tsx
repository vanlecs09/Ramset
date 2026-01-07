import { useState } from 'react';
import './App.css';
import ConstructionViewer from './components/ConstructionViewer';
import ControlPanel from './components/ControlPanel';

export interface CircularColumnParams {
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
}

export interface ComplexColumnParams {
  isFiniteConcrete: boolean;
  cuboid1SizeX: number;
  cuboid1SizeZ: number;
  cuboid2SizeX: number;
  cuboid2SizeZ: number;
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
  offsetXPos: number;
  offsetXNeg: number;
  offsetZPos: number;
  offsetZNeg: number;
}

function App() {
  const [currentModel, setCurrentModel] = useState< 'circularColumns' | 'complexColumn' | 'rectangleColumn'>('circularColumns');
  const [towerParams, setTowerParams] = useState<CircularColumnParams>({
    isFiniteConcrete: true,
    concreteThickness: 3,
    cylinderHeight: 1,
    cylinderRadius: 1.5,
    postRadius: 0.05,
    postCount: 10,
    circumferenceToPostOffset: 0.06,
    offsetXPos: 1.5,
    offsetXNeg: 1.5,
    offsetZPos: 1.5,
    offsetZNeg: 1.5,
  });
  const [complexColumnParams, setComplexColumnParams] = useState<ComplexColumnParams>({
    isFiniteConcrete: true,
    cuboid1SizeX: 2,
    cuboid1SizeZ: 2,
    cuboid2SizeX: 2,
    cuboid2SizeZ: 2,
    postRadius: 0.05,
    postOffset: 0.1,
  });
  const [rectangleColumnParams, setRectangleColumnParams] = useState<RectangleColumnParams>({
    isFiniteConcrete: true,
    concreteThickness: 3,
    columnWidth: 1,
    columnDepth: 1.5,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.1,
    postOffset: 0.1,
    offsetXPos: 1.5,
    offsetXNeg: 1.5,
    offsetZPos: 1.5,
    offsetZNeg: 1.5,
  });

  return (
    <div className="app-container">
      <ControlPanel
        onModelChange={setCurrentModel}
        onTowerParamsChange={setTowerParams}
        onComplexColumnParamsChange={setComplexColumnParams}
        onRectangleColumnParamsChange={setRectangleColumnParams}
      />
      <header className="app-header">
        <h1>3D Construction Model Viewer</h1>
        <p>Drag to rotate | Scroll to zoom</p>
      </header>
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
