import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { createComplexColumn, updateComplexColumn } from '../utils/ComplexColumnsBuilder';
import { createCircularColumns, updateCircularColumns } from '../utils/CircularColumnsBuilder';
import { createRectangleColumn, updateRectangleColumn } from '../utils/RectangleColumnBuilder';
import { calculateCircularPostPositions } from '../utils/CircularPostPositionCalculator';
import { calculateRectanglePostPositions } from '../utils/RectanglePostPositionCalculator'; \nimport { createConcrete, updateConcrete } from '../utils/ConcreteBuilder';
import type { CircularColumnsGroup } from '../utils/CircularColumnsBuilder';
import type { ComplexColumnGroup } from '../utils/ComplexColumnsBuilder';
import type { RectangleColumnGroup } from '../utils/RectangleColumnBuilder';
import type { RectangleColumnParams } from '../App';

interface TowerParams {
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

interface ConstructionViewerProps {
  onSceneReady?: (scene: BABYLON.Scene) => void;
  model?: 'circularColumns' | 'complexColumn' | 'rectangleColumn';
  towerParams?: TowerParams;
  complexColumnParams?: ComplexColumnParams;
  rectangleColumnParams?: RectangleColumnParams;
}

export const ConstructionViewer: React.FC<ConstructionViewerProps> = ({
  onSceneReady,
  model = 'circularColumns',
  towerParams = {
    isFiniteConcrete: false,
    concreteThickness: 3,
    cylinderHeight: 1,
    cylinderRadius: 1.5,
    postRadius: 0.05,
    postCount: 10,
    circumferenceToPostOffset: 0.06,
    concreteOffsetXRight: 1.5,
    concreteOffsetXLeft: 1.5,
    concreteOffsetZBack: 1.5,
    concreteOffsetZFront: 1.5,
  },
  complexColumnParams = {
    isFiniteConcrete: false,
    concreteThickness: 1,
    concreteOffsetXRight: 1.5,
    concreteOffsetXLeft: 1.5,
    concreteOffsetZBack: 1.5,
    concreteOffsetZFront: 1.5,
    cuboid1SizeX: 2,
    cuboid1SizeZ: 2,
    cuboid1PostCountLeftEdge: 2,
    cuboid1PostCountTopEdge: 2,
    cuboid2SizeX: 2,
    cuboid2SizeZ: 2,
    cuboid2TranslateX: 0,
    cuboid2TranslateZ: 0,
    cuboid2PostCountLeftEdge: 2,
    cuboid2PostCountTopEdge: 2,
    postRadius: 0.05,
    postOffset: 0.1,
  },
  rectangleColumnParams = {
    isFiniteConcrete: false,
    concreteThickness: 3,
    columnWidth: 3,
    columnDepth: 2,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.2,
    postOffset: 0.1,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const circularColumnsRef = useRef<CircularColumnsGroup | null>(null);
  const complexColumnRef = useRef<ComplexColumnGroup | null>(null);
  const rectangleColumnRef = useRef<RectangleColumnGroup | null>(null);

  // Initialize scene and engine (once on mount)
  useEffect(() => {
    if (!containerRef.current) return;

    // Create canvas for Babylon.js with proper sizing
    const canvas = document.createElement('canvas');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    containerRef.current.appendChild(canvas);

    // Create Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true });
    engineRef.current = engine;

    // Create scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
    sceneRef.current = scene;

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 4,     // alpha
      Math.PI / 3,     // beta
      10,               // radius
      BABYLON.Vector3.Zero(), // target
      scene
    );
    camera.attachControl(canvas, true); // mouse drag to rotate, wheel to zoom

    // Light
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.9;

    // Axes helper (visual representation)
    const createAxesHelper = () => {
      const axisLength = 0.5;
      const lines = [];

      // X axis (red)
      const redLine = BABYLON.MeshBuilder.CreateTube('xAxis', {
        path: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(axisLength, 0, 0),
        ],
        radius: 0.02,
      }, scene);
      const redMaterial = new BABYLON.StandardMaterial('redMaterial', scene);
      redMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
      redLine.material = redMaterial;
      lines.push(redLine);

      // Y axis (green)
      const greenLine = BABYLON.MeshBuilder.CreateTube('yAxis', {
        path: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, axisLength, 0),
        ],
        radius: 0.02,
      }, scene);
      const greenMaterial = new BABYLON.StandardMaterial('greenMaterial', scene);
      greenMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
      greenLine.material = greenMaterial;
      lines.push(greenLine);

      // Z axis (blue)
      const blueLine = BABYLON.MeshBuilder.CreateTube('zAxis', {
        path: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, 0, axisLength),
        ],
        radius: 0.02,
      }, scene);
      const blueMaterial = new BABYLON.StandardMaterial('blueMaterial', scene);
      blueMaterial.emissiveColor = new BABYLON.Color3(0, 0, 1);
      blueLine.material = blueMaterial;
      lines.push(blueLine);

      return lines;
    };
    createAxesHelper();

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        engine.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Callback when scene is ready
    if (onSceneReady) {
      onSceneReady(scene);
    }

    return () => {
      // window.removeEventListener('resize', handleResize);
      // engine.dispose();
    };
  }, [onSceneReady]);

  // Update 3D model when parameters change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Helper function to dispose current structure
    const disposePreviousStructure = () => {
      // return;
      if (circularColumnsRef.current) {
        circularColumnsRef.current.dispose();
        circularColumnsRef.current = null;
      }
      if (complexColumnRef.current) {
        complexColumnRef.current.dispose();
        complexColumnRef.current = null;
      }
      if (rectangleColumnRef.current) {
        rectangleColumnRef.current.dispose();
        rectangleColumnRef.current = null;
      }
    };

    if (model === 'circularColumns') {

      // Calculate post positions first
      const gapDistance = 0.5;
      const baseY = 1.5 + gapDistance / 2;
      const postPositions = calculateCircularPostPositions(
        towerParams.cylinderRadius,
        towerParams.circumferenceToPostOffset,
        towerParams.postCount,
        baseY
      );

      if (!circularColumnsRef.current) {
        disposePreviousStructure();
        // circularColumnsRef.current = concreteGroup = createConcrete(scene, towerParams.concreteThickness, towerParams.concreteOffsetXRight, towerParams.concreteOffsetXLeft, towerParams.concreteOffsetZBack, towerParams.concreteOffsetZFront, undefined, towerParams.isFiniteConcrete);
        createCircularColumns(
          scene,
          postPositions,
          towerParams.concreteThickness,
          towerParams.cylinderHeight,
          towerParams.cylinderRadius,
          towerParams.postRadius,
          towerParams.concreteOffsetXRight,
          towerParams.concreteOffsetXLeft,
          towerParams.concreteOffsetZBack,
          towerParams.concreteOffsetZFront,
          towerParams.isFiniteConcrete
        );
      } else {
        updateCircularColumns(
          circularColumnsRef.current,
          postPositions,
          towerParams.concreteThickness,
          towerParams.cylinderHeight,
          towerParams.cylinderRadius,
          towerParams.postRadius,
          towerParams.concreteOffsetXRight,
          towerParams.concreteOffsetXLeft,
          towerParams.concreteOffsetZBack,
          towerParams.concreteOffsetZFront,
          towerParams.isFiniteConcrete
        );
      }

    } else if (model === 'complexColumn') {


      if (!complexColumnRef.current) {
        disposePreviousStructure();
        complexColumnRef.current = createComplexColumn(
          scene,
          complexColumnParams.concreteThickness,
          complexColumnParams.concreteOffsetXRight,
          complexColumnParams.concreteOffsetXLeft,
          complexColumnParams.concreteOffsetZBack,
          complexColumnParams.concreteOffsetZFront,
          complexColumnParams.cuboid1SizeX,
          complexColumnParams.cuboid1SizeZ,
          complexColumnParams.cuboid1PostCountLeftEdge,
          complexColumnParams.cuboid1PostCountTopEdge,
          complexColumnParams.cuboid2SizeX,
          complexColumnParams.cuboid2SizeZ,
          complexColumnParams.cuboid2TranslateX,
          complexColumnParams.cuboid2TranslateZ,
          complexColumnParams.cuboid2PostCountLeftEdge,
          complexColumnParams.cuboid2PostCountTopEdge,
          complexColumnParams.postRadius,
          complexColumnParams.postOffset,
          complexColumnParams.isFiniteConcrete
        );
      } else {
        updateComplexColumn(
          complexColumnRef.current,
          complexColumnParams.concreteThickness,
          complexColumnParams.concreteOffsetXRight,
          complexColumnParams.concreteOffsetXLeft,
          complexColumnParams.concreteOffsetZBack,
          complexColumnParams.concreteOffsetZFront,
          complexColumnParams.cuboid1SizeX,
          complexColumnParams.cuboid1SizeZ,
          complexColumnParams.cuboid1PostCountLeftEdge,
          complexColumnParams.cuboid1PostCountTopEdge,
          complexColumnParams.cuboid2SizeX,
          complexColumnParams.cuboid2SizeZ,
          complexColumnParams.cuboid2TranslateX,
          complexColumnParams.cuboid2TranslateZ,
          complexColumnParams.cuboid2PostCountLeftEdge,
          complexColumnParams.cuboid2PostCountTopEdge,
          complexColumnParams.postRadius,
          complexColumnParams.postOffset,
          complexColumnParams.isFiniteConcrete
        );
      }
    } else if (model === 'rectangleColumn') {

      if (!rectangleColumnRef.current) {
        disposePreviousStructure();

        // Calculate post positions first
        const columnCenterY = rectangleColumnParams.concreteThickness + 0.75;
        const postPositions = calculateRectanglePostPositions(
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postCountX,
          rectangleColumnParams.postCountZ,
          rectangleColumnParams.postOffset,
          columnCenterY
        );

        rectangleColumnRef.current = createRectangleColumn(
          scene,
          postPositions,
          rectangleColumnParams.concreteThickness,
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postDiameter,
          rectangleColumnParams.concreteOffsetXRight,
          rectangleColumnParams.concreteOffsetXLeft,
          rectangleColumnParams.concreteOffsetZBack,
          rectangleColumnParams.concreteOffsetZFront,
          rectangleColumnParams.isFiniteConcrete
        );
      } else {
        // Calculate post positions first
        const columnCenterY = rectangleColumnParams.concreteThickness + 0.75;
        const postPositions = calculateRectanglePostPositions(
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postCountX,
          rectangleColumnParams.postCountZ,
          rectangleColumnParams.postOffset,
          columnCenterY
        );

        updateRectangleColumn(
          rectangleColumnRef.current,
          postPositions,
          rectangleColumnParams.concreteThickness,
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postDiameter,
          rectangleColumnParams.concreteOffsetXRight,
          rectangleColumnParams.concreteOffsetXLeft,
          rectangleColumnParams.concreteOffsetZBack,
          rectangleColumnParams.concreteOffsetZFront,
          rectangleColumnParams.isFiniteConcrete
        );
      }
    }
  }, [
    model,
    towerParams.isFiniteConcrete,
    towerParams.concreteThickness,
    towerParams.cylinderHeight,
    towerParams.cylinderRadius,
    towerParams.postRadius,
    towerParams.postCount,
    towerParams.circumferenceToPostOffset,
    towerParams.concreteOffsetXRight,
    towerParams.concreteOffsetXLeft,
    towerParams.concreteOffsetZBack,
    towerParams.concreteOffsetZFront,

    complexColumnParams.isFiniteConcrete,
    complexColumnParams.concreteThickness,
    complexColumnParams.concreteOffsetXRight,
    complexColumnParams.concreteOffsetXLeft,
    complexColumnParams.concreteOffsetZBack,
    complexColumnParams.concreteOffsetZFront,
    complexColumnParams.cuboid1SizeX,
    complexColumnParams.cuboid1SizeZ,
    complexColumnParams.cuboid2SizeX,
    complexColumnParams.cuboid2SizeZ,
    complexColumnParams.cuboid2TranslateX,
    complexColumnParams.cuboid2TranslateZ,
    complexColumnParams.postRadius,
    complexColumnParams.postOffset,

    rectangleColumnParams.isFiniteConcrete,
    rectangleColumnParams.concreteThickness,
    rectangleColumnParams.columnWidth,
    rectangleColumnParams.columnDepth,
    rectangleColumnParams.postCountX,
    rectangleColumnParams.postCountZ,
    rectangleColumnParams.postDiameter,
    rectangleColumnParams.postOffset,
    rectangleColumnParams.concreteOffsetXRight,
    rectangleColumnParams.concreteOffsetXLeft,
    rectangleColumnParams.concreteOffsetZBack,
    rectangleColumnParams.concreteOffsetZFront,

  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
};

export default ConstructionViewer;
