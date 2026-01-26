import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { createComplexColumn, updateComplexColumn } from '../utils/ComplexColumnNode';
import { createCircularColumns, updateCircularColumns } from '../utils/CircularColumnsNode';
import { createRectangleColumn, updateRectangleColumn } from '../utils/RectangleColumnNode';
import { createLapsplice } from '../utils/BaseLapSpliceNode';
import { createEndAnchorage } from '../utils/BaseEndAnchorageNode';
import { calculateCircularPostPositions } from '../utils/CircularPostPositionCalculator';
import { calculateRectanglePostPositions } from '../utils/RectanglePostPositionCalculator';
import type { CircularColumnsNode } from '../utils/CircularColumnsNode';
import type { ComplexColumnNode } from '../utils/ComplexColumnNode';
import type { RectangleColumnNode } from '../utils/RectangleColumnNode';
import type { BaseLapSpliceNode } from '../utils/BaseLapSpliceNode';
import { BaseEndAnchorageNode } from '../utils/BaseEndAnchorageNode';
import type { RectangleColumnParams, SlabParams } from '../App';
import type { EndAnchorageParams } from '../utils/BaseEndAnchorageNode';

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
  model?: 'circularColumns' | 'complexColumn' | 'rectangleColumn' | 'lapspliceSlab' | 'lapspliceBeam' | 'lapspliceWall' | 'endAnchorageBeam' | 'endAnchorageSlab' | 'endAnchorageWall';
  towerParams?: TowerParams;
  complexColumnParams?: ComplexColumnParams;
  rectangleColumnParams?: RectangleColumnParams;
  lapspliceSlabParams?: SlabParams;
  lapspliceBeamParams?: SlabParams;
  lapspliceWallParams?: SlabParams;
  endAnchorageBeamParams?: EndAnchorageParams;
  endAnchorageSlabParams?: EndAnchorageParams;
  endAnchorageWallParams?: EndAnchorageParams;
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
  lapspliceSlabParams = {
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
  lapspliceBeamParams = {
    isFiniteConcrete: true,
    concreteThickness: 1,
    slabWidth: 0.4,
    slabDepth: 0.6,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.03,
    postOffset: 0.02,
    concreteOffsetXRight: 0.2,
    concreteOffsetXLeft: 0.2,
    concreteOffsetZBack: 0.3,
    concreteOffsetZFront: 0.3,
  },
  lapspliceWallParams = {
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
    concreteOffsetZBack: 0.125,
    concreteOffsetZFront: 0.125,
  },
  endAnchorageBeamParams = {
    beamWidth: 0.3,
    beamDepth: 0.5,
    beamHeight: 0.4,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.03,
    postOffset: 0.05,
    concreteOffsetXRight: 0.5,
    concreteOffsetXLeft: 0.5,
    concreteOffsetZBack: 0.5,
    concreteOffsetZFront: 0.5,
    concreteThickness: 1,
  },
  endAnchorageSlabParams = {
    beamWidth: 0.3,
    beamDepth: 0.5,
    beamHeight: 0.4,
    postCountX: 3,
    postCountZ: 2,
    postDiameter: 0.03,
    postOffset: 0.05,
    concreteOffsetXRight: 0.5,
    concreteOffsetXLeft: 0.5,
    concreteOffsetZBack: 0.5,
    concreteOffsetZFront: 0.5,
    concreteThickness: 1,
  },
  endAnchorageWallParams = {
    beamWidth: 0.25,
    beamDepth: 1,
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
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const circularColumnsRef = useRef<CircularColumnsNode | null>(null);
  const complexColumnRef = useRef<ComplexColumnNode | null>(null);
  const rectangleColumnRef = useRef<RectangleColumnNode | null>(null);
  const lapspliceSlabRef = useRef<BaseLapSpliceNode | null>(null);
  const lapspliceBeamRef = useRef<BaseLapSpliceNode | null>(null);
  const lapspliceWallRef = useRef<BaseLapSpliceNode | null>(null);
  const endAnchorageBeamRef = useRef<BaseEndAnchorageNode | null>(null);
  const endAnchorageSlabRef = useRef<BaseEndAnchorageNode | null>(null);
  const endAnchorageWallRef = useRef<BaseEndAnchorageNode | null>(null);

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
      Math.PI / 2,     // alpha
      0,     // beta
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
      if (lapspliceSlabRef.current) {
        lapspliceSlabRef.current.dispose();
        lapspliceSlabRef.current = null;
      }
      if (lapspliceBeamRef.current) {
        lapspliceBeamRef.current.dispose();
        lapspliceBeamRef.current = null;
      }
      if (lapspliceWallRef.current) {
        lapspliceWallRef.current.dispose();
        lapspliceWallRef.current = null;
      }
      if (endAnchorageBeamRef.current) {
        endAnchorageBeamRef.current.dispose();
        endAnchorageBeamRef.current = null;
      }
      if (endAnchorageSlabRef.current) {
        endAnchorageSlabRef.current.dispose();
        endAnchorageSlabRef.current = null;
      }
      if (endAnchorageWallRef.current) {
        endAnchorageWallRef.current.dispose();
        endAnchorageWallRef.current = null;
      }
    };

    /**
 * Rotate the upVector via the camera's forward direction.  This will then update
 * the camera's perspective to appear as though it rotated.
 */
    const rotateCamera = (camera: BABYLON.ArcRotateCamera, localAxis: BABYLON.Vector3, angle: BABYLON.float) => {
      const upVector = camera.upVector.clone();
      const axis = BABYLON.Quaternion.RotationAxis(localAxis, angle);
      upVector.applyRotationQuaternionInPlace(axis);
      camera.upVector = upVector;

      // Note about this function: If you want to keep the same position, you'll
      // need to call this function.  This will take the current camera position
      // and recalculate the alpha and beta values.  Not calling this function will
      // instead force the position to be changed on the next camera update.
      camera.rebuildAnglesAndRadius();

      // Since alpha has no limits, we want to try and keep it between 0 and 2 * PI
      if (camera.alpha > Math.PI * 2) {
        camera.alpha -= Math.PI * 2;
      }
      else if (camera.alpha < 0) {
        camera.alpha += Math.PI * 2;
      }
    }

    const rollCamera = (camera: BABYLON.ArcRotateCamera, angle: BABYLON.float) => {
      const localZ = camera.getDirection(BABYLON.Axis.Z);
      rotateCamera(camera, localZ, angle);

      // camUp.rotate(localZ, angle, BABYLON.Space.WORLD);
    }

    const resetScene = (camera: BABYLON.ArcRotateCamera) => {
      camera.upVector = BABYLON.Axis.Y;
      // camUp.rotation.copyFromFloats(0, 0, 0);
      // camUp.rotationQuaternion = null;
      // Like in the rotateCamera function, we're calling this so that the position remains
      // the same and the angles are rotated instead.
      camera.rebuildAnglesAndRadius();
    }


    // Helper function to adjust camera based on model type
    const adjustCameraForModel = (modelType: string) => {
      const camera = scene.activeCamera as BABYLON.ArcRotateCamera;
      if (!camera) return;
      resetScene(camera);
      switch (modelType) {
        // case 'circularColumns':
        //   camera.target = BABYLON.Vector3.Zero();
        //   camera.radius = 6;
        //   camera.alpha = Math.PI / 2;
        //   camera.beta = Math.PI / 4;
        //   break;
        // case 'complexColumn':
        //   camera.target = BABYLON.Vector3.Zero();
        //   camera.radius = 5;
        //   camera.alpha = Math.PI / 3;
        //   camera.beta = Math.PI / 3.5;
        //   break;
        // case 'rectangleColumn':
        //   camera.target = BABYLON.Vector3.Zero();
        //   camera.radius = 4;
        //   camera.alpha = Math.PI / 2.5;
        //   camera.beta = Math.PI / 3;
        //   break;
  
        // case 'lapspliceSlab':
        // case 'lapspliceBeam':

        //   camera.target = BABYLON.Vector3.Zero();
        //   camera.radius = 3.0;
        //   camera.alpha = Math.PI * (-20 / 180);
        //   camera.beta = Math.PI / 2 + Math.PI * (-20 / 180);
        //   rollCamera(camera, Math.PI / 2 + Math.PI * (10 / 180));
        //   break;
        // // case 'lapspliceWall':
        // case 'endAnchorage':
        // // case 'endAnchorageSlab':
        // case 'endAnchorageWall':
        //   camera.target = BABYLON.Vector3.Zero();
        //   camera.radius = 3.0;
        //   camera.alpha = Math.PI * (-45 / 180);
        //   camera.beta = Math.PI / 2 + Math.PI * (-45 / 180); 
        //   rollCamera(camera, Math.PI / 2 + Math.PI * ((45/2) / 180));
        //   // rollCamera(camera, Math.PI / 2);
        //   break;
        default:
          camera.target = BABYLON.Vector3.Zero();
          camera.radius = 3;
          camera.alpha = Math.PI * (20 / 180);
          camera.beta = Math.PI / 2 + Math.PI * (-20 / 180);
          camera.upVector = new BABYLON.Vector3(0, 1, 0);
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
        adjustCameraForModel('circularColumns');
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
        adjustCameraForModel('complexColumn');
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
        adjustCameraForModel('rectangleColumn');
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


    } else if (model === 'lapspliceSlab') {

      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: lapspliceSlabParams.concreteOffsetXRight,
        concreteOffsetXLeft: lapspliceSlabParams.concreteOffsetXLeft,
        concreteOffsetZBack: lapspliceSlabParams.concreteOffsetZBack,
        concreteOffsetZFront: lapspliceSlabParams.concreteOffsetZFront,
        concreteThickness: lapspliceSlabParams.concreteThickness,
      });

      // Calculate post positions first
      let halfConcreteDepth = concreteDepth / 2;
      const slabCenterZ = halfConcreteDepth;
      const postPositions = calculateRectanglePostPositions(
        lapspliceSlabParams.slabWidth,
        lapspliceSlabParams.slabDepth,
        lapspliceSlabParams.postCountX,
        lapspliceSlabParams.postCountZ,
        lapspliceSlabParams.postOffset,
        slabCenterZ
      );

      let concreteParam = {
        thickness: lapspliceSlabParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let slabParam = {
        slabWidth: lapspliceSlabParams.slabWidth,
        slabDepth: lapspliceSlabParams.slabDepth,
        postDiameter: lapspliceSlabParams.postDiameter,
        isFiniteConcrete: lapspliceSlabParams.isFiniteConcrete
      };

      if (!lapspliceSlabRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('lapspliceSlab');

      }
      lapspliceSlabRef.current?.dispose();
      lapspliceSlabRef.current = createLapsplice(
        scene,
        postPositions,
        concreteParam,
        slabParam
      );
      // Rotate the group by 90 degrees on X-axis
      lapspliceSlabRef.current.group.rotation.x = Math.PI / 2;

    } else if (model === 'lapspliceBeam') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: lapspliceBeamParams.concreteOffsetXRight,
        concreteOffsetXLeft: lapspliceBeamParams.concreteOffsetXLeft,
        concreteOffsetZBack: lapspliceBeamParams.concreteOffsetZBack,
        concreteOffsetZFront: lapspliceBeamParams.concreteOffsetZFront,
        concreteThickness: lapspliceBeamParams.concreteThickness,
      });

      // Calculate post positions first
      let halfConcreteDepth = concreteDepth / 2;
      const beamCenterZ = halfConcreteDepth;
      const postPositions = calculateRectanglePostPositions(
        lapspliceBeamParams.slabWidth,
        lapspliceBeamParams.slabDepth,
        lapspliceBeamParams.postCountX,
        lapspliceBeamParams.postCountZ,
        lapspliceBeamParams.postOffset,
        beamCenterZ
      );

      let concreteParam = {
        thickness: lapspliceBeamParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let beamParam = {
        slabWidth: lapspliceBeamParams.slabWidth,
        slabDepth: lapspliceBeamParams.slabDepth,
        postDiameter: lapspliceBeamParams.postDiameter,
        isFiniteConcrete: lapspliceBeamParams.isFiniteConcrete
      };

      if (!lapspliceBeamRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('lapspliceBeam');
      }
      lapspliceBeamRef.current?.dispose();
      lapspliceBeamRef.current = createLapsplice(
        scene,
        postPositions,
        concreteParam,
        beamParam
      );
      // Rotate the group by 90 degrees on X-axis
      lapspliceBeamRef.current.group.rotation.x = Math.PI / 2;

    } else if (model === 'lapspliceWall') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: lapspliceWallParams.concreteOffsetXRight,
        concreteOffsetXLeft: lapspliceWallParams.concreteOffsetXLeft,
        concreteOffsetZBack: lapspliceWallParams.concreteOffsetZBack,
        concreteOffsetZFront: lapspliceWallParams.concreteOffsetZFront,
        concreteThickness: lapspliceWallParams.concreteThickness,
      });

      // Calculate post positions first
      let halfConcreteDepth = concreteDepth / 2;
      const wallCenterZ = halfConcreteDepth;
      const postPositions = calculateRectanglePostPositions(
        lapspliceWallParams.slabWidth,
        lapspliceWallParams.slabDepth,
        lapspliceWallParams.postCountX,
        lapspliceWallParams.postCountZ,
        lapspliceWallParams.postOffset,
        wallCenterZ
      );

      let concreteParam = {
        thickness: lapspliceWallParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let wallParam = {
        slabWidth: lapspliceWallParams.slabWidth,
        slabDepth: lapspliceWallParams.slabDepth,
        postDiameter: lapspliceWallParams.postDiameter,
        isFiniteConcrete: lapspliceWallParams.isFiniteConcrete
      };

      if (!lapspliceWallRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('lapspliceWall');
      }
      lapspliceWallRef.current?.dispose();
      lapspliceWallRef.current = createLapsplice(
        scene,
        postPositions,
        concreteParam,
        wallParam
      );

    } else if (model === 'endAnchorageBeam') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: endAnchorageBeamParams.concreteOffsetXRight,
        concreteOffsetXLeft: endAnchorageBeamParams.concreteOffsetXLeft,
        concreteOffsetZBack: endAnchorageBeamParams.concreteOffsetZBack,
        concreteOffsetZFront: endAnchorageBeamParams.concreteOffsetZFront,
        concreteThickness: endAnchorageBeamParams.concreteThickness,
      });

      const postPositions = calculateRectanglePostPositions(
        endAnchorageBeamParams.beamWidth,
        endAnchorageBeamParams.beamDepth,
        endAnchorageBeamParams.postCountX,
        endAnchorageBeamParams.postCountZ,
        endAnchorageBeamParams.postOffset,
        0
      );
      let postPos = postPositions.map(pos => pos.position);

      if (!endAnchorageBeamRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('endAnchorageBeam');
        // endAnchorageBeamRef.current = new EndAnchorageBeamNode('endAnchorageBeam', scene);
      }
      endAnchorageBeamRef.current?.dispose();
      let concreteParam = {
        thickness: endAnchorageBeamParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let secondaryParams = {
        beamWidth: endAnchorageBeamParams.beamWidth,
        beamDepth: endAnchorageBeamParams.beamDepth,
        beamHeight: endAnchorageBeamParams.beamHeight,
      };
      // updateEndAnchorage(endAnchorageBeamRef.current!,
      endAnchorageBeamRef.current = createEndAnchorage(scene, postPos, endAnchorageBeamParams, concreteParam, secondaryParams);
      // Rotate the group by 90 degrees on X-axis
      endAnchorageBeamRef.current.group.rotation.x = Math.PI / 2;

    } else if (model === 'endAnchorageSlab') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: endAnchorageSlabParams.concreteOffsetXRight,
        concreteOffsetXLeft: endAnchorageSlabParams.concreteOffsetXLeft,
        concreteOffsetZBack: endAnchorageSlabParams.concreteOffsetZBack,
        concreteOffsetZFront: endAnchorageSlabParams.concreteOffsetZFront,
        concreteThickness: endAnchorageSlabParams.concreteThickness,
      });

      const postPositions = calculateRectanglePostPositions(
        endAnchorageSlabParams.beamWidth,
        endAnchorageSlabParams.beamDepth,
        endAnchorageSlabParams.postCountX,
        endAnchorageSlabParams.postCountZ,
        endAnchorageSlabParams.postOffset,
        0
      );
      let postPos = postPositions.map(pos => pos.position);

      if (!endAnchorageSlabRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('endAnchorageSlab');
      }
      endAnchorageSlabRef.current?.dispose();
      let concreteParam = {
        thickness: endAnchorageSlabParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let secondaryParams = {
        beamWidth: endAnchorageSlabParams.beamWidth,
        beamDepth: endAnchorageSlabParams.beamDepth,
        beamHeight: endAnchorageSlabParams.beamHeight,
      };
      endAnchorageSlabRef.current = createEndAnchorage(scene, postPos, endAnchorageSlabParams, concreteParam, secondaryParams);
      // Rotate the group by 90 degrees on X-axis
      endAnchorageSlabRef.current.group.rotation.x = Math.PI / 2;
    } else if (model === 'endAnchorageWall') {
      // Calculate concrete dimensions and positions
      const { concreteWidth, concreteDepth, concretePosition } = calculateConcreteLayout({
        concreteOffsetXRight: endAnchorageWallParams.concreteOffsetXRight,
        concreteOffsetXLeft: endAnchorageWallParams.concreteOffsetXLeft,
        concreteOffsetZBack: endAnchorageWallParams.concreteOffsetZBack,
        concreteOffsetZFront: endAnchorageWallParams.concreteOffsetZFront,
        concreteThickness: endAnchorageWallParams.concreteThickness,
      });

      const postPositions = calculateRectanglePostPositions(
        endAnchorageWallParams.beamWidth,
        endAnchorageWallParams.beamDepth,
        endAnchorageWallParams.postCountX,
        endAnchorageWallParams.postCountZ,
        endAnchorageWallParams.postOffset,
        0
      );
      let postPos = postPositions.map(pos => pos.position);

      if (!endAnchorageWallRef.current) {
        disposePreviousStructure();
        adjustCameraForModel('endAnchorageWall');
      }
      endAnchorageWallRef.current?.dispose();
      let concreteParam = {
        thickness: endAnchorageWallParams.concreteThickness,
        width: concreteWidth,
        depth: concreteDepth,
        position: concretePosition
      };

      let secondaryParams = {
        beamWidth: endAnchorageWallParams.beamWidth,
        beamDepth: endAnchorageWallParams.beamDepth,
        beamHeight: endAnchorageWallParams.beamHeight,
      };
      endAnchorageWallRef.current = createEndAnchorage(scene, postPos, endAnchorageWallParams, concreteParam, secondaryParams);
      // Rotate the group by 90 degrees on X-axis
      endAnchorageWallRef.current.group.rotation.x = Math.PI / 2;
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

    lapspliceSlabParams.isFiniteConcrete,
    lapspliceSlabParams.concreteThickness,
    lapspliceSlabParams.slabWidth,
    lapspliceSlabParams.slabDepth,
    lapspliceSlabParams.postCountX,
    lapspliceSlabParams.postCountZ,
    lapspliceSlabParams.postDiameter,
    lapspliceSlabParams.postOffset,
    lapspliceSlabParams.concreteOffsetXRight,
    lapspliceSlabParams.concreteOffsetXLeft,
    lapspliceSlabParams.concreteOffsetZBack,
    lapspliceSlabParams.concreteOffsetZFront,

    lapspliceBeamParams.isFiniteConcrete,
    lapspliceBeamParams.concreteThickness,
    lapspliceBeamParams.slabWidth,
    lapspliceBeamParams.slabDepth,
    lapspliceBeamParams.postCountX,
    lapspliceBeamParams.postCountZ,
    lapspliceBeamParams.postDiameter,
    lapspliceBeamParams.postOffset,
    lapspliceBeamParams.concreteOffsetXRight,
    lapspliceBeamParams.concreteOffsetXLeft,
    lapspliceBeamParams.concreteOffsetZBack,
    lapspliceBeamParams.concreteOffsetZFront,

    lapspliceWallParams.isFiniteConcrete,
    lapspliceWallParams.concreteThickness,
    lapspliceWallParams.slabWidth,
    lapspliceWallParams.slabDepth,
    lapspliceWallParams.postCountX,
    lapspliceWallParams.postCountZ,
    lapspliceWallParams.postDiameter,
    lapspliceWallParams.postOffset,
    lapspliceWallParams.concreteOffsetXRight,
    lapspliceWallParams.concreteOffsetXLeft,
    lapspliceWallParams.concreteOffsetZBack,
    lapspliceWallParams.concreteOffsetZFront,

    endAnchorageBeamParams.beamWidth,
    endAnchorageBeamParams.beamDepth,
    endAnchorageBeamParams.beamHeight,
    endAnchorageBeamParams.postCountX,
    endAnchorageBeamParams.postCountZ,
    endAnchorageBeamParams.postDiameter,
    endAnchorageBeamParams.postOffset,
    endAnchorageBeamParams.concreteOffsetXRight,
    endAnchorageBeamParams.concreteOffsetXLeft,
    endAnchorageBeamParams.concreteOffsetZBack,
    endAnchorageBeamParams.concreteOffsetZFront,
    endAnchorageBeamParams.concreteThickness,

    endAnchorageSlabParams.beamWidth,
    endAnchorageSlabParams.beamDepth,
    endAnchorageSlabParams.beamHeight,
    endAnchorageSlabParams.postCountX,
    endAnchorageSlabParams.postCountZ,
    endAnchorageSlabParams.postDiameter,
    endAnchorageSlabParams.postOffset,
    endAnchorageSlabParams.concreteOffsetXRight,
    endAnchorageSlabParams.concreteOffsetXLeft,
    endAnchorageSlabParams.concreteOffsetZBack,
    endAnchorageSlabParams.concreteOffsetZFront,
    endAnchorageSlabParams.concreteThickness,

    endAnchorageWallParams.beamWidth,
    endAnchorageWallParams.beamDepth,
    endAnchorageWallParams.beamHeight,
    endAnchorageWallParams.postCountX,
    endAnchorageWallParams.postCountZ,
    endAnchorageWallParams.postDiameter,
    endAnchorageWallParams.postOffset,
    endAnchorageWallParams.concreteOffsetXRight,
    endAnchorageWallParams.concreteOffsetXLeft,
    endAnchorageWallParams.concreteOffsetZBack,
    endAnchorageWallParams.concreteOffsetZFront,
    endAnchorageWallParams.concreteThickness,
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
