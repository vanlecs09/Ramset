import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { createComplexColumn, updateComplexColumn } from '../utils/ComplexColumnNode';
import { createCircularColumns, updateCircularColumns } from '../utils/CircularColumnsNode';
import { createRectangleColumn, updateRectangleColumn } from '../utils/RectangleColumnNode';
import { createSlab, updateSlab } from '../utils/SlabNode';
import { createEndAnchorage, updateEndAnchorage } from '../utils/EndAnchorageBeamNode';
import { calculateCircularPostPositions } from '../utils/CircularPostPositionCalculator';
import { calculateRectanglePostPositions, calculateYSurfacePostPositions } from '../utils/RectanglePostPositionCalculator';
import type { CircularColumnsNode } from '../utils/CircularColumnsNode';
import type { ComplexColumnNode } from '../utils/ComplexColumnNode';
import type { RectangleColumnNode } from '../utils/RectangleColumnNode';
import type { SlabNode } from '../utils/SlabNode';
import type { EndAnchorageBeamNode } from '../utils/EndAnchorageBeamNode';
import type { RectangleColumnParams, SlabParams } from '../App';
import type { EndAnchorageParams } from '../utils/EndAnchorageBeamNode';

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
  model?: 'circularColumns' | 'complexColumn' | 'rectangleColumn' | 'slab' | 'endAnchorage';
  towerParams?: TowerParams;
  complexColumnParams?: ComplexColumnParams;
  rectangleColumnParams?: RectangleColumnParams;
  slabParams?: SlabParams;
  endAnchorageParams?: EndAnchorageParams;
}

interface ConcreteLayout {
  concreteWidth: number;
  concreteDepth: number;
  centerXPos: number;
  centerZPos: number;
  concretePosition: BABYLON.Vector3;
  finiteBlockPositions: BABYLON.Vector3[];
}

interface ConcreteOffsets {
  concreteOffsetXRight: number;
  concreteOffsetXLeft: number;
  concreteOffsetZBack: number;
  concreteOffsetZFront: number;
  concreteThickness: number;
}

const calculateConcreteLayout = (offsets: ConcreteOffsets): ConcreteLayout => {
  const concreteWidth = offsets.concreteOffsetXRight + offsets.concreteOffsetXLeft;
  const concreteDepth = offsets.concreteOffsetZBack + offsets.concreteOffsetZFront;
  const centerXPos = (offsets.concreteOffsetXRight - offsets.concreteOffsetXLeft) / 2;
  const centerZPos = (offsets.concreteOffsetZBack - offsets.concreteOffsetZFront) / 2;
  // Top face of concrete is at Y = 2, so center position is 2 - (thickness/2)
  const concreteTopY = 0;
  const concreteCenterY = concreteTopY - (offsets.concreteThickness / 2);
  const concretePosition = new BABYLON.Vector3(centerXPos, concreteCenterY, centerZPos);

  const blockThickness = 0.5;
  const blockBottomY = concreteCenterY - (offsets.concreteThickness / 2);
  const frontWavePos = new BABYLON.Vector3(centerXPos, blockBottomY, offsets.concreteOffsetZBack + blockThickness / 2);
  const backWavePos = new BABYLON.Vector3(centerXPos, blockBottomY, -offsets.concreteOffsetZFront - blockThickness / 2);
  const leftWavePos = new BABYLON.Vector3(-offsets.concreteOffsetXLeft - blockThickness / 2, blockBottomY, centerZPos);
  const rightWavePos = new BABYLON.Vector3(offsets.concreteOffsetXRight + blockThickness / 2, blockBottomY, centerZPos);
  const finiteBlockPositions = [frontWavePos, backWavePos, leftWavePos, rightWavePos];

  return {
    concreteWidth,
    concreteDepth,
    centerXPos,
    centerZPos,
    concretePosition,
    finiteBlockPositions,
  };
};

export const ConstructionViewer: React.FC<ConstructionViewerProps> = ({
  onSceneReady,
  model = 'circularColumns',
  towerParams: circleColumns = {
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
    concreteOffsetXRight: 0.5,
    concreteOffsetXLeft: 0.5,
    concreteOffsetZBack: 0.5,
    concreteOffsetZFront: 0.5,
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
    concreteOffsetXRight: 1.5,
    concreteOffsetXLeft: 1.5,
    concreteOffsetZBack: 1.5,
    concreteOffsetZFront: 1.5,
  },
  slabParams = {
    isFiniteConcrete: true,
    concreteThickness: 1,
    slabWidth: 0.1,
    slabDepth: 1,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.03,
    postOffset: 0.02,
    concreteOffsetXRight: 0.1,
    concreteOffsetXLeft: 0.1,
    concreteOffsetZBack: 0.5,
    concreteOffsetZFront: 0.5,
  },
  endAnchorageParams = {
    beamWidth: 0.3,
    beamDepth: 0.5,
    beamHeight: 0.4,
    beamOffsetX: 0.5,
    pinDiameter: 0.02,
    pinRows: 2,
    pinColumns: 3,
    pinSpacingX: 0.15,
    pinSpacingY: 0.15,
    concreteOffsetXRight: 0.5,
    concreteOffsetXLeft: 0.5,
    concreteOffsetZBack: 0.5,
    concreteOffsetZFront: 0.5,
    concreteThickness: 1,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const circularColumnsRef = useRef<CircularColumnsNode | null>(null);
  const complexColumnRef = useRef<ComplexColumnNode | null>(null);
  const rectangleColumnRef = useRef<RectangleColumnNode | null>(null);
  const slabRef = useRef<SlabNode | null>(null);
  const endAnchorageRef = useRef<EndAnchorageBeamNode | null>(null);

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
      5,               // radius
      BABYLON.Vector3.Zero(), // target
      scene
    );
    camera.attachControl(canvas, true); // mouse drag to rotate, wheel to zoom
    camera.wheelPrecision = 50; // Slow down zoom speed (higher value = slower zoom)

    // Light
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.9;

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
      if (slabRef.current) {
        slabRef.current.dispose();
        slabRef.current = null;
      }
      if (endAnchorageRef.current) {
        endAnchorageRef.current.dispose();
        endAnchorageRef.current = null;
      }
    };

    if (model === 'circularColumns') {

      // Calculate post positions first
      const gapDistance = 0.5;
      const baseY = 0 + gapDistance / 2;
      const postPositions = calculateCircularPostPositions(
        circleColumns.cylinderRadius,
        circleColumns.circumferenceToPostOffset,
        circleColumns.postCount,
        baseY
      );

      const { concreteWidth, concreteDepth, concretePosition, finiteBlockPositions } = calculateConcreteLayout({
        concreteOffsetXRight: circleColumns.concreteOffsetXRight,
        concreteOffsetXLeft: circleColumns.concreteOffsetXLeft,
        concreteOffsetZBack: circleColumns.concreteOffsetZBack,
        concreteOffsetZFront: circleColumns.concreteOffsetZFront,
        concreteThickness: circleColumns.concreteThickness,
      });


      if (!circularColumnsRef.current) {
        disposePreviousStructure();
        circularColumnsRef.current = createCircularColumns(
          scene,
          circleColumns.concreteThickness,
          concreteWidth,
          concreteDepth,
          concretePosition,
          finiteBlockPositions,
          circleColumns.isFiniteConcrete,
          circleColumns.cylinderHeight,
          circleColumns.cylinderRadius,
          circleColumns.postRadius,
          postPositions,

        );
      } else {
        updateCircularColumns(
          circularColumnsRef.current,
          circleColumns.concreteThickness,
          concreteWidth,
          concreteDepth,
          concretePosition,
          circleColumns.isFiniteConcrete,
          circleColumns.cylinderHeight,
          circleColumns.cylinderRadius,
          circleColumns.postRadius,
          postPositions,
        );
      }

    } else if (model === 'complexColumn') {

      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition, finiteBlockPositions } = calculateConcreteLayout({
        concreteOffsetXRight: complexColumnParams.concreteOffsetXRight,
        concreteOffsetXLeft: complexColumnParams.concreteOffsetXLeft,
        concreteOffsetZBack: complexColumnParams.concreteOffsetZBack,
        concreteOffsetZFront: complexColumnParams.concreteOffsetZFront,
        concreteThickness: complexColumnParams.concreteThickness,
      });

      if (!complexColumnRef.current) {
        disposePreviousStructure();
        complexColumnRef.current = createComplexColumn(
          scene,
          complexColumnParams.concreteThickness,
          concreteWidth,
          concreteDepth,
          concretePosition,
          finiteBlockPositions,
          complexColumnParams.isFiniteConcrete,
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
          complexColumnParams.postOffset
        );
      } else {
        updateComplexColumn(
          complexColumnRef.current,
          complexColumnParams.concreteThickness,
          concreteWidth,
          concreteDepth,
          concretePosition,
          finiteBlockPositions,
          complexColumnParams.isFiniteConcrete,
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
          complexColumnParams.postOffset
        );
      }
    } else if (model === 'rectangleColumn') {

      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: rectangleColumnParams.concreteOffsetXRight,
        concreteOffsetXLeft: rectangleColumnParams.concreteOffsetXLeft,
        concreteOffsetZBack: rectangleColumnParams.concreteOffsetZBack,
        concreteOffsetZFront: rectangleColumnParams.concreteOffsetZFront,
        concreteThickness: rectangleColumnParams.concreteThickness,
      });

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

      if (!rectangleColumnRef.current) {
        disposePreviousStructure();

        rectangleColumnRef.current = createRectangleColumn(
          scene,
          postPositions,
          rectangleColumnParams.concreteThickness,
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postDiameter,
          concreteWidth,
          concreteDepth,
          concretePosition,
          rectangleColumnParams.isFiniteConcrete
        );
      } else {
        updateRectangleColumn(
          rectangleColumnRef.current,
          postPositions,
          rectangleColumnParams.concreteThickness,
          rectangleColumnParams.columnWidth,
          rectangleColumnParams.columnDepth,
          rectangleColumnParams.postDiameter,
          concreteWidth,
          concreteDepth,
          concretePosition,
          rectangleColumnParams.isFiniteConcrete
        );
      }
    } else if (model === 'slab') {

      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: slabParams.concreteOffsetXRight,
        concreteOffsetXLeft: slabParams.concreteOffsetXLeft,
        concreteOffsetZBack: slabParams.concreteOffsetZBack,
        concreteOffsetZFront: slabParams.concreteOffsetZFront,
        concreteThickness: slabParams.concreteThickness,
      });

      // Calculate post positions first
      let halfConcreteDepth = concreteDepth / 2;
      const slabCenterZ = halfConcreteDepth;
      const postPositions = calculateYSurfacePostPositions(
        slabParams.slabWidth,
        slabParams.slabDepth,
        slabParams.postCountX,
        slabParams.postCountZ,
        slabParams.postOffset,
        slabCenterZ
      );

      if (!slabRef.current) {
        disposePreviousStructure();

        slabRef.current = createSlab(
          scene,
          postPositions,
          slabParams.concreteThickness,
          slabParams.slabWidth,
          slabParams.slabDepth,
          slabParams.postDiameter,
          concreteWidth,
          concreteDepth,
          concretePosition,
          slabParams.isFiniteConcrete
        );
      } else {
        updateSlab(
          slabRef.current,
          postPositions,
          slabParams.concreteThickness,
          slabParams.slabWidth,
          slabParams.slabDepth,
          slabParams.postDiameter,
          concreteWidth,
          concreteDepth,
          concretePosition,
          slabParams.isFiniteConcrete
        );
      }
    } else if (model === 'endAnchorage') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: endAnchorageParams.concreteOffsetXRight,
        concreteOffsetXLeft: endAnchorageParams.concreteOffsetXLeft,
        concreteOffsetZBack: endAnchorageParams.concreteOffsetZBack,
        concreteOffsetZFront: endAnchorageParams.concreteOffsetZFront,
        concreteThickness: endAnchorageParams.concreteThickness,
      });

      // Calculate post positions based on pin rows, columns, and spacing
      let halfConcreteDepth = concreteDepth / 2;
      const postPositions: BABYLON.Vector3[] = [];
      const startX = -(endAnchorageParams.pinColumns - 1) * endAnchorageParams.pinSpacingX / 2;
      const startZ = -(endAnchorageParams.pinRows - 1) * endAnchorageParams.pinSpacingY / 2;
      
      for (let row = 0; row < endAnchorageParams.pinRows; row++) {
        for (let col = 0; col < endAnchorageParams.pinColumns; col++) {
          const x = startX + col * endAnchorageParams.pinSpacingX;
          const z = startZ + row * endAnchorageParams.pinSpacingY;
          postPositions.push(new BABYLON.Vector3(x, 0, z + halfConcreteDepth));
        }
      }

      if (!endAnchorageRef.current) {
        disposePreviousStructure();
        endAnchorageRef.current = createEndAnchorage(scene, postPositions, endAnchorageParams, concreteWidth, concreteDepth, concretePosition);
      } else {
        updateEndAnchorage(endAnchorageRef.current, postPositions, endAnchorageParams, concreteWidth, concreteDepth, concretePosition);
      }
    }
  }, [
    model,
    circleColumns.isFiniteConcrete,
    circleColumns.concreteThickness,
    circleColumns.cylinderHeight,
    circleColumns.cylinderRadius,
    circleColumns.postRadius,
    circleColumns.postCount,
    circleColumns.concreteOffsetXRight,
    circleColumns.concreteOffsetXLeft,
    circleColumns.concreteOffsetZBack,
    circleColumns.concreteOffsetZFront,
    circleColumns.circumferenceToPostOffset,

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

    slabParams.isFiniteConcrete,
    slabParams.concreteThickness,
    slabParams.slabWidth,
    slabParams.slabDepth,
    slabParams.postCountX,
    slabParams.postCountZ,
    slabParams.postDiameter,
    slabParams.postOffset,
    slabParams.concreteOffsetXRight,
    slabParams.concreteOffsetXLeft,
    slabParams.concreteOffsetZBack,
    slabParams.concreteOffsetZFront,

    endAnchorageParams.beamWidth,
    endAnchorageParams.beamDepth,
    endAnchorageParams.beamHeight,
    endAnchorageParams.beamOffsetX,
    endAnchorageParams.pinDiameter,
    endAnchorageParams.pinRows,
    endAnchorageParams.pinColumns,
    endAnchorageParams.pinSpacingX,
    endAnchorageParams.pinSpacingY,
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
