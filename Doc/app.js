// Grab canvas
const canvas = document.getElementById("renderCanvas");

// Create engine (antialias true for smoother edges)
const engine = new BABYLON.Engine(canvas, true);


function createScene() {
  const scene = new BABYLON.Scene(engine);

  // Camera
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 4,     // alpha
    Math.PI / 3,     // beta
    6,               // radius
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

  return scene;
}

// const scene = createScene();


// // Primitive: Box (1x1x1 by default)
// const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

// // Give it a simple red-ish material
// const mat = new BABYLON.StandardMaterial("boxMat", scene);
// mat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
// box.material = mat;


// const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1.5 }, scene);

// const cyl = BABYLON.MeshBuilder.CreateCylinder("cyl", { height: 2, diameter: 0.5 }, scene);

function createScene() {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

  // Camera
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    -Math.PI / 4,
    Math.PI / 3,
    1.6,
    new BABYLON.Vector3(0, 0.25, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.wheelPrecision = 50; // Higher value = slower zoom (default is 3)

  // Light
  const light = new BABYLON.HemisphericLight(
    "hemi",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1.0;
  // We'll add the polygon here
  // createProfilePolygon(scene);

  createAxis(scene, camera);
  createConcreteBlock(scene);
  createRebars(scene);
  createCenterAxis(scene);
  createIncompleteTorus(scene);
  createIncompleteTorusZ(scene);
  createSineWaveBlock(scene);
  createLeftWaveBlock(scene);
  createRightWaveBlock(scene);
  // createTransparentCut(scene);

  return scene;
}

const scene = createScene();


engine.runRenderLoop(() => {
  //  scene.getMeshByName("box").rotation.y += 0.01;
  scene.render();
});

// Handle browser resize
window.addEventListener("resize", () => {
  engine.resize();
});

// createProfilePolygon(scene);


/**
 * Creates a dimension line with arrows and connectors to model corners
 * @param {string} name - Base name for the meshes
 * @param {BABYLON.Scene} scene - The Babylon scene
 * @param {number} length - Length of the dimension line
 * @param {BABYLON.Vector3} linePosition - Position of the dimension line
 * @param {BABYLON.Vector3} lineRotation - Rotation of the dimension line (Euler angles)
 * @param {BABYLON.Vector3} arrow1Position - Position of first arrow
 * @param {BABYLON.Vector3} arrow2Position - Position of second arrow
 * @param {BABYLON.Vector3} arrow1Rotation - Rotation of first arrow (Euler angles)
 * @param {BABYLON.Vector3} arrow2Rotation - Rotation of second arrow (Euler angles)
 * @param {BABYLON.Vector3} corner1Position - Corner position for first connector
 * @param {BABYLON.Vector3} corner2Position - Corner position for second connector
 * @param {BABYLON.Material} lineMat - Material for all dimension elements
 * @returns {BABYLON.Mesh} The dimension line mesh
 */
function createDimensionLine(name, scene, length, linePosition, lineRotation, 
                            arrow1Position, arrow2Position, arrow1Rotation, arrow2Rotation,
                            corner1Position, corner2Position, lineMat) {
  const lineThickness = 0.0015;
  const arrowSize = 0.015;
  const arrowDiameter = 0.008;
  const connectorThickness = 0.001;
  const yAxis = new BABYLON.Vector3(0, 1, 0);

  // Create dimension line
  const line = BABYLON.MeshBuilder.CreateCylinder(name + "Line", {
    diameter: lineThickness,
    height: length
  }, scene);
  line.position = linePosition;
  line.rotation = lineRotation;
  line.material = lineMat;

  // Create arrow 1
  const arrow1 = BABYLON.MeshBuilder.CreateCylinder(name + "Arrow1", {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize
  }, scene);
  arrow1.position = arrow1Position;
  arrow1.rotation = arrow1Rotation;
  arrow1.material = lineMat;

  // Create arrow 2
  const arrow2 = BABYLON.MeshBuilder.CreateCylinder(name + "Arrow2", {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize
  }, scene);
  arrow2.position = arrow2Position;
  arrow2.rotation = arrow2Rotation;
  arrow2.material = lineMat;

  // Create connector 1
  const distance1 = BABYLON.Vector3.Distance(arrow1Position, corner1Position);
  const connector1 = BABYLON.MeshBuilder.CreateCylinder(name + "Connector1", {
    diameter: connectorThickness,
    height: distance1
  }, scene);
  connector1.position = BABYLON.Vector3.Lerp(arrow1Position, corner1Position, 0.5);
  const direction1 = corner1Position.subtract(arrow1Position).normalize();
  connector1.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxis, direction1, new BABYLON.Quaternion());
  connector1.material = lineMat;

  // Create connector 2
  const distance2 = BABYLON.Vector3.Distance(arrow2Position, corner2Position);
  const connector2 = BABYLON.MeshBuilder.CreateCylinder(name + "Connector2", {
    diameter: connectorThickness,
    height: distance2
  }, scene);
  connector2.position = BABYLON.Vector3.Lerp(arrow2Position, corner2Position, 0.5);
  const direction2 = corner2Position.subtract(arrow2Position).normalize();
  connector2.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxis, direction2, new BABYLON.Quaternion());
  connector2.material = lineMat;

  return line;
}

function createAxis(scene, mainCamera) {
  const axisSize = 0.05;
  const axisThickness = 0.002;

  // X-axis (Red)
  const xAxis = BABYLON.MeshBuilder.CreateCylinder("xAxis", {
    diameter: axisThickness,
    height: axisSize
  }, scene);
  xAxis.rotation.z = Math.PI / 2;
  xAxis.position.x = axisSize / 2;
  const xMat = new BABYLON.StandardMaterial("xMat", scene);
  xMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  xMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
  xMat.disableLighting = true;
  xAxis.material = xMat;

  // Y-axis (Green)
  const yAxis = BABYLON.MeshBuilder.CreateCylinder("yAxis", {
    diameter: axisThickness,
    height: axisSize
  }, scene);
  yAxis.position.y = axisSize / 2;
  const yMat = new BABYLON.StandardMaterial("yMat", scene);
  yMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
  yMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
  yMat.disableLighting = true;
  yAxis.material = yMat;

  // Z-axis (Blue)
  const zAxis = BABYLON.MeshBuilder.CreateCylinder("zAxis", {
    diameter: axisThickness,
    height: axisSize
  }, scene);
  zAxis.rotation.x = Math.PI / 2;
  zAxis.position.z = axisSize / 2;
  const zMat = new BABYLON.StandardMaterial("zMat", scene);
  zMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
  zMat.emissiveColor = new BABYLON.Color3(0, 0, 1);
  zMat.disableLighting = true;
  zAxis.material = zMat;

  // Add arrow cones
  const coneHeight = 0.01;
  const coneDiameter = 0.005;

  // X cone
  const xCone = BABYLON.MeshBuilder.CreateCylinder("xCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  xCone.rotation.z = -Math.PI / 2;
  xCone.position.x = axisSize + coneHeight / 2;
  xCone.material = xMat;

  // Y cone
  const yCone = BABYLON.MeshBuilder.CreateCylinder("yCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  yCone.position.y = axisSize + coneHeight / 2;
  yCone.material = yMat;

  // Z cone
  const zCone = BABYLON.MeshBuilder.CreateCylinder("zCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  zCone.rotation.x = Math.PI / 2;
  zCone.position.z = axisSize + coneHeight / 2;
  zCone.material = zMat;

  // Create a parent node for all axis meshes
  const axisRoot = new BABYLON.TransformNode("axisRoot", scene);
  xAxis.parent = axisRoot;
  yAxis.parent = axisRoot;
  zAxis.parent = axisRoot;
  xCone.parent = axisRoot;
  yCone.parent = axisRoot;
  zCone.parent = axisRoot;

  // Add text labels
  const axisTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("AxisLabelsUI");

  // X label
  const xLabel = new BABYLON.GUI.TextBlock();
  xLabel.text = "X";
  xLabel.color = "red";
  xLabel.fontSize = 20;
  xLabel.fontWeight = "bold";
  axisTexture.addControl(xLabel);
  xLabel.linkWithMesh(xCone);
  xLabel.linkOffsetX = 20;

  // Y label
  const yLabel = new BABYLON.GUI.TextBlock();
  yLabel.text = "Y";
  yLabel.color = "green";
  yLabel.fontSize = 20;
  yLabel.fontWeight = "bold";
  axisTexture.addControl(yLabel);
  yLabel.linkWithMesh(yCone);
  yLabel.linkOffsetY = -20;

  // Z label
  const zLabel = new BABYLON.GUI.TextBlock();
  zLabel.text = "Z";
  zLabel.color = "blue";
  zLabel.fontSize = 20;
  zLabel.fontWeight = "bold";
  axisTexture.addControl(zLabel);
  zLabel.linkWithMesh(zCone);
  zLabel.linkOffsetX = 20;

  // Update axis position and rotation every frame
  scene.registerBeforeRender(() => {
    // Get camera vectors
    const forward = mainCamera.getForwardRay(1).direction;
    const right = BABYLON.Vector3.Cross(mainCamera.upVector, forward).normalize();
    const up = BABYLON.Vector3.Cross(forward, right).normalize();

    // Position in bottom-left corner relative to camera
    const distance = 1.2; // distance from camera
    const offsetRight = -0.8; // left
    const offsetUp = -0.4; // bottom

    // Calculate position
    const newPos = mainCamera.position
      .add(forward.scale(distance))
      .add(right.scale(offsetRight))
      .add(up.scale(offsetUp));

    axisRoot.position = newPos;

    // Keep axis aligned to world space (don't rotate with camera)
    // This shows the world orientation - X, Y, Z always point in world directions
    axisRoot.rotation = BABYLON.Vector3.Zero();
    axisRoot.scale = new BABYLON.Vector3(0.5, 0.5, 0.5);
  });
}


function createConcreteBlock(scene) {
  // Main rectangular body: 0.4m x 0.6m x 1.0m
  const width = 0.6;
  const height = 0.6;
  const depth = 1.0;

  const body = BABYLON.MeshBuilder.CreateBox("body", {
    width: width,
    height: height,
    depth: depth
  }, scene);
  body.position.y = height / 2;

  const mat = new BABYLON.StandardMaterial("concreteMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);   // light gray tint
  mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);  // slight shine
  mat.alpha = 0.4;                                        // transparency (0 = invisible, 1 = opaque)
  mat.backFaceCulling = false;                            // see through from both sides
  body.material = mat;

  // Create dimension lines
  const lineMat = new BABYLON.StandardMaterial("lineMat", scene);
  lineMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  lineMat.disableLighting = true;

  const offset = 0.05; // offset from the block edges

  // Width line (X-axis) - bottom front edge
  const widthLine = createDimensionLine(
    "width",
    scene,
    width,
    new BABYLON.Vector3(0, -offset, -depth / 2 - offset),
    new BABYLON.Vector3(0, 0, Math.PI / 2),
    new BABYLON.Vector3(-width / 2, -offset, -depth / 2 - offset),
    new BABYLON.Vector3(width / 2, -offset, -depth / 2 - offset),
    new BABYLON.Vector3(0, 0, Math.PI / 2),
    new BABYLON.Vector3(0, 0, -Math.PI / 2),
    new BABYLON.Vector3(-width / 2, 0, -depth / 2),
    new BABYLON.Vector3(width / 2, 0, -depth / 2),
    lineMat
  );

  // Height line (Y-axis) - front left edge
  const heightLine = createDimensionLine(
    "height",
    scene,
    height,
    new BABYLON.Vector3(-width / 2 - offset, height / 2, -depth / 2 - offset),
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(-width / 2 - offset, 0, -depth / 2 - offset),
    new BABYLON.Vector3(-width / 2 - offset, height, -depth / 2 - offset),
    new BABYLON.Vector3(Math.PI, 0, 0),
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(-width / 2, 0, -depth / 2),
    new BABYLON.Vector3(-width / 2, height, -depth / 2),
    lineMat
  );

  // Depth line (Z-axis) - bottom left edge
  const depthLine = createDimensionLine(
    "depth",
    scene,
    depth,
    new BABYLON.Vector3(-width / 2 - offset, -offset, 0),
    new BABYLON.Vector3(Math.PI / 2, 0, 0),
    new BABYLON.Vector3(-width / 2 - offset, -offset, -depth / 2),
    new BABYLON.Vector3(-width / 2 - offset, -offset, depth / 2),
    new BABYLON.Vector3(-Math.PI / 2, 0, 0),
    new BABYLON.Vector3(Math.PI / 2, 0, 0),
    new BABYLON.Vector3(-width / 2, 0, -depth / 2),
    new BABYLON.Vector3(-width / 2, 0, depth / 2),
    lineMat
  );

  // Add dimension labels
  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("DimensionUI");

  // Width label
  const widthLabel = new BABYLON.GUI.TextBlock();
  widthLabel.text = width.toFixed(2) + "m";
  widthLabel.color = "black";
  widthLabel.fontSize = 20;
  widthLabel.fontWeight = "bold";
  advancedTexture.addControl(widthLabel);
  widthLabel.linkWithMesh(widthLine);
  widthLabel.linkOffsetY = 30;

  // Height label
  const heightLabel = new BABYLON.GUI.TextBlock();
  heightLabel.text = height.toFixed(2) + "m";
  heightLabel.color = "black";
  heightLabel.fontSize = 20;
  heightLabel.fontWeight = "bold";
  advancedTexture.addControl(heightLabel);
  heightLabel.linkWithMesh(heightLine);
  heightLabel.linkOffsetX = -30;

  // Depth label
  const depthLabel = new BABYLON.GUI.TextBlock();
  depthLabel.text = depth.toFixed(2) + "m";
  depthLabel.color = "black";
  depthLabel.fontSize = 20;
  depthLabel.fontWeight = "bold";
  advancedTexture.addControl(depthLabel);
  depthLabel.linkWithMesh(depthLine);
  depthLabel.linkOffsetX = -30;
}


function createCenterAxis(scene) {
  const axisLength = 0.05; // 1 unit length for each axis
  const axisThickness = 0.003;

  // X-axis (Red) - horizontal
  const xAxis = BABYLON.MeshBuilder.CreateCylinder("centerXAxis", {
    diameter: axisThickness,
    height: axisLength
  }, scene);
  xAxis.rotation.z = Math.PI / 2;
  xAxis.position = new BABYLON.Vector3(axisLength / 2, 0.6, 0); // y=0.6 is between blocks
  const xMat = new BABYLON.StandardMaterial("centerXMat", scene);
  xMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
  xMat.disableLighting = true;
  xAxis.material = xMat;

  // Y-axis (Green) - vertical
  const yAxis = BABYLON.MeshBuilder.CreateCylinder("centerYAxis", {
    diameter: axisThickness,
    height: axisLength
  }, scene);
  yAxis.position = new BABYLON.Vector3(0, 0.6 + axisLength / 2, 0);
  const yMat = new BABYLON.StandardMaterial("centerYMat", scene);
  yMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
  yMat.disableLighting = true;
  yAxis.material = yMat;

  // Z-axis (Blue) - depth
  const zAxis = BABYLON.MeshBuilder.CreateCylinder("centerZAxis", {
    diameter: axisThickness,
    height: axisLength
  }, scene);
  zAxis.rotation.x = Math.PI / 2;
  zAxis.position = new BABYLON.Vector3(0, 0.6, axisLength / 2);
  const zMat = new BABYLON.StandardMaterial("centerZMat", scene);
  zMat.emissiveColor = new BABYLON.Color3(0, 0, 1);
  zMat.disableLighting = true;
  zAxis.material = zMat;

  // Add arrow cones
  const coneHeight = 0.02;
  const coneDiameter = 0.01;

  // X cone (right end)
  const xCone = BABYLON.MeshBuilder.CreateCylinder("centerXCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  xCone.rotation.z = -Math.PI / 2;
  xCone.position = new BABYLON.Vector3(axisLength + coneHeight / 2, 0.6, 0);
  xCone.material = xMat;

  // Y cone (top end)
  const yCone = BABYLON.MeshBuilder.CreateCylinder("centerYCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  yCone.position = new BABYLON.Vector3(0, 0.6 + axisLength + coneHeight / 2, 0);
  yCone.material = yMat;

  // Z cone (front end)
  const zCone = BABYLON.MeshBuilder.CreateCylinder("centerZCone", {
    diameterTop: 0,
    diameterBottom: coneDiameter,
    height: coneHeight
  }, scene);
  zCone.rotation.x = Math.PI / 2;
  zCone.position = new BABYLON.Vector3(0, 0.6, axisLength + coneHeight / 2);
  zCone.material = zMat;

  // Add text labels
  const centerAxisTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("CenterAxisLabelsUI");

  // X label
  const xLabel = new BABYLON.GUI.TextBlock();
  xLabel.text = "X";
  xLabel.color = "red";
  xLabel.fontSize = 24;
  xLabel.fontWeight = "bold";
  centerAxisTexture.addControl(xLabel);
  xLabel.linkWithMesh(xCone);
  xLabel.linkOffsetX = 25;

  // Y label
  const yLabel = new BABYLON.GUI.TextBlock();
  yLabel.text = "Y";
  yLabel.color = "green";
  yLabel.fontSize = 24;
  yLabel.fontWeight = "bold";
  centerAxisTexture.addControl(yLabel);
  yLabel.linkWithMesh(yCone);
  yLabel.linkOffsetY = -25;

  // Z label
  const zLabel = new BABYLON.GUI.TextBlock();
  zLabel.text = "Z";
  zLabel.color = "blue";
  zLabel.fontSize = 24;
  zLabel.fontWeight = "bold";
  centerAxisTexture.addControl(zLabel);
  zLabel.linkWithMesh(zCone);
  zLabel.linkOffsetX = 25;
}


function createIncompleteTorus(scene) {
  const torusRadius = 0.06; // main radius of the torus
  const tubeRadius = 0.003; // thickness of the tube
  const arcAngle = (270 / 180) * Math.PI; // 270 degrees in radians
  const segments = 60; // smoothness of the arc
  const distanceFromCenter = 0.4; // distance along x-axis from center

  // Create the arc path in YZ plane (to face X axis)
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * arcAngle;
    const y = torusRadius * Math.cos(angle);
    const z = torusRadius * Math.sin(angle);
    path.push(new BABYLON.Vector3(distanceFromCenter, 0.6 + y, z));
  }

  // Create tube along the path
  const torus = BABYLON.MeshBuilder.CreateTube("incompleteTorus", {
    path: path,
    radius: tubeRadius,
    tessellation: 16,
    cap: BABYLON.Mesh.CAP_ALL
  }, scene);

  // Material for torus
  const torusMat = new BABYLON.StandardMaterial("torusMat", scene);
  torusMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  torusMat.disableLighting = true;
  torus.material = torusMat;

  // Add arrow at the end of the torus
  const endAngle = arcAngle;
  const endY = torusRadius * Math.cos(endAngle);
  const endZ = torusRadius * Math.sin(endAngle);
  
  // Calculate tangent direction for arrow orientation
  const tangentAngle = endAngle + Math.PI / 2; // perpendicular to radius
  
  const arrowSize = 0.01;
  const arrowDiameter = 0.015;
  
  const arrow = BABYLON.MeshBuilder.CreateCylinder("torusArrow", {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize
  }, scene);
  
  arrow.position = new BABYLON.Vector3(distanceFromCenter, 0.6 + endY, endZ);
  
  // Rotate arrow to point in the tangent direction (in YZ plane)
  arrow.rotation.x = -tangentAngle;
  
  arrow.material = torusMat;

  // Create dotted line from center (0, 0.6, 0) to torus center (distanceFromCenter, 0.6, 0)
  const dottedLineMat = new BABYLON.StandardMaterial("dottedLineMat", scene);
  dottedLineMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  dottedLineMat.disableLighting = true;

  const centerPoint = new BABYLON.Vector3(0, 0.6, 0);
  const torusCenter = new BABYLON.Vector3(distanceFromCenter, 0.6, 0);
  
  // Create dotted line using multiple small cylinders
  const dotCount = 10;
  const dotLength = 0.01;
  const gapLength = 0.015;
  const totalDistance = BABYLON.Vector3.Distance(centerPoint, torusCenter);
  const direction = torusCenter.subtract(centerPoint).normalize();
  
  let currentDistance = 0;
  let dotIndex = 0;
  
  while (currentDistance < totalDistance) {
    if (dotIndex % 2 === 0) { // Create dot
      const remainingDistance = totalDistance - currentDistance;
      const actualDotLength = Math.min(dotLength, remainingDistance);
      
      const dot = BABYLON.MeshBuilder.CreateCylinder("dottedLine" + dotIndex, {
        diameter: 0.001,
        height: actualDotLength
      }, scene);
      dot.rotation.z = Math.PI / 2;
      dot.position = centerPoint.add(direction.scale(currentDistance + actualDotLength / 2));
      dot.material = dottedLineMat;
      
      currentDistance += actualDotLength;
    } else { // Gap
      currentDistance += gapLength;
    }
    dotIndex++;
  }

  // Create normal line extending from torus (perpendicular to X-axis, in positive X direction)
  const normalOffset = 0.1;
  const normalStartPoint = new BABYLON.Vector3(distanceFromCenter, 0.6, 0);
  const normalEndPoint = new BABYLON.Vector3(distanceFromCenter + normalOffset, 0.6, 0);
  
  const normalLine = BABYLON.MeshBuilder.CreateCylinder("normalLine", {
    diameter: 0.0015,
    height: normalOffset
  }, scene);
  normalLine.rotation.z = Math.PI / 2;
  normalLine.position = BABYLON.Vector3.Lerp(normalStartPoint, normalEndPoint, 0.5);
  normalLine.material = torusMat;

  // Add arrow at the end of normal line
  const normalArrow = BABYLON.MeshBuilder.CreateCylinder("normalArrow", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  normalArrow.rotation.z = -Math.PI / 2;
  normalArrow.position = normalEndPoint;
  normalArrow.material = torusMat;

  // Add rotation label
  const torusTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("TorusLabelUI");
  
  const rotationLabel = new BABYLON.GUI.TextBlock();
  rotationLabel.text = "0";
  rotationLabel.color = "black";
  rotationLabel.fontSize = 20;
  rotationLabel.fontWeight = "bold";
  torusTexture.addControl(rotationLabel);
  rotationLabel.linkWithMesh(torus);
  rotationLabel.linkOffsetY = -30;
}


function createIncompleteTorusZ(scene) {
  const torusRadius = 0.06; // main radius of the torus
  const tubeRadius = 0.003; // thickness of the tube
  const arcAngle = (270 / 180) * Math.PI; // 270 degrees in radians
  const segments = 60; // smoothness of the arc
  const distanceFromCenter = 0.6; // distance along z-axis from center

  // Create the arc path in XY plane (to face Z axis)
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * arcAngle;
    const x = torusRadius * Math.cos(angle);
    const y = torusRadius * Math.sin(angle);
    path.push(new BABYLON.Vector3(x, 0.6 + y, distanceFromCenter));
  }

  // Create tube along the path
  const torus = BABYLON.MeshBuilder.CreateTube("incompleteTorusZ", {
    path: path,
    radius: tubeRadius,
    tessellation: 16,
    cap: BABYLON.Mesh.CAP_ALL
  }, scene);

  // Material for torus
  const torusMat = new BABYLON.StandardMaterial("torusZMat", scene);
  torusMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  torusMat.disableLighting = true;
  torus.material = torusMat;

  // Add arrow at the end of the torus
  const endAngle = arcAngle;
  const endX = torusRadius * Math.cos(endAngle);
  const endY = torusRadius * Math.sin(endAngle);
  
  // Calculate tangent direction for arrow orientation
  const tangentAngle = endAngle + Math.PI / 2; // perpendicular to radius
  
  const arrowSize = 0.01;
  const arrowDiameter = 0.015;
  
  const arrow = BABYLON.MeshBuilder.CreateCylinder("torusZArrow", {
    diameterTop: 0,
    diameterBottom: arrowDiameter,
    height: arrowSize
  }, scene);
  
  arrow.position = new BABYLON.Vector3(endX, 0.6 + endY, distanceFromCenter);
  
  // Rotate arrow to point in the tangent direction (in XY plane)
  arrow.rotation.z = tangentAngle;
  
  arrow.material = torusMat;

  // Create dotted line from center (0, 0.6, 0) to torus center (0, 0.6, distanceFromCenter)
  const dottedLineMat = new BABYLON.StandardMaterial("dottedLineZMat", scene);
  dottedLineMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  dottedLineMat.disableLighting = true;

  const centerPoint = new BABYLON.Vector3(0, 0.6, 0);
  const torusCenter = new BABYLON.Vector3(0, 0.6, distanceFromCenter);
  
  // Create dotted line using multiple small cylinders
  const dotLength = 0.01;
  const gapLength = 0.015;
  const totalDistance = BABYLON.Vector3.Distance(centerPoint, torusCenter);
  const direction = torusCenter.subtract(centerPoint).normalize();
  
  let currentDistance = 0;
  let dotIndex = 0;
  
  while (currentDistance < totalDistance) {
    if (dotIndex % 2 === 0) { // Create dot
      const remainingDistance = totalDistance - currentDistance;
      const actualDotLength = Math.min(dotLength, remainingDistance);
      
      const dot = BABYLON.MeshBuilder.CreateCylinder("dottedLineZ" + dotIndex, {
        diameter: 0.001,
        height: actualDotLength
      }, scene);
      dot.rotation.x = Math.PI / 2;
      dot.position = centerPoint.add(direction.scale(currentDistance + actualDotLength / 2));
      dot.material = dottedLineMat;
      
      currentDistance += actualDotLength;
    } else { // Gap
      currentDistance += gapLength;
    }
    dotIndex++;
  }

  // Create normal line extending from torus (perpendicular to Z-axis, in positive Z direction)
  const normalOffset = 0.1;
  const normalStartPoint = new BABYLON.Vector3(0, 0.6, distanceFromCenter);
  const normalEndPoint = new BABYLON.Vector3(0, 0.6, distanceFromCenter + normalOffset);
  
  const normalLine = BABYLON.MeshBuilder.CreateCylinder("normalLineZ", {
    diameter: 0.0015,
    height: normalOffset
  }, scene);
  normalLine.rotation.x = Math.PI / 2;
  normalLine.position = BABYLON.Vector3.Lerp(normalStartPoint, normalEndPoint, 0.5);
  normalLine.material = torusMat;

  // Add arrow at the end of normal line
  const normalArrow = BABYLON.MeshBuilder.CreateCylinder("normalArrowZ", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  normalArrow.rotation.x = Math.PI / 2;
  normalArrow.position = normalEndPoint;
  normalArrow.material = torusMat;

  // Add rotation label
  const torusTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("TorusZLabelUI");
  
  const rotationLabel = new BABYLON.GUI.TextBlock();
  rotationLabel.text = "0";
  rotationLabel.color = "black";
  rotationLabel.fontSize = 20;
  rotationLabel.fontWeight = "bold";
  torusTexture.addControl(rotationLabel);
  rotationLabel.linkWithMesh(torus);
  rotationLabel.linkOffsetY = -30;
}


function createRebars(scene) {
  const mat = new BABYLON.StandardMaterial("rebarMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);

  const countX = 4;
  const countZ = 2;                     // 2 rows along Z axis
  const spacingX = 0.08;                // spacing between rebars on X axis
  const spacingZ = 0.15;                // spacing between rows on Z axis
  const startX = -((countX - 1) * spacingX) / 2;
  const startZ = -((countZ - 1) * spacingZ) / 2;
  const y = 0.6;                        // embed in block
  const depth = 0.2;                    // height of each rebar

  for (let iz = 0; iz < countZ; iz++) {
    for (let ix = 0; ix < countX; ix++) {
      const x = startX + ix * spacingX;
      const z = startZ + iz * spacingZ;
      const cyl = BABYLON.MeshBuilder.CreateCylinder("rebar" + iz + "_" + ix, {
        diameter: 0.01,
        height: depth
      }, scene);

      cyl.position = new BABYLON.Vector3(x, y, z);
      cyl.material = mat;
    }
  }
}


function createTransparentCut(scene) {
  const cut = BABYLON.MeshBuilder.CreateBox("cut", {
    width: 0.6,
    height: 0.9,
    depth: 0.45
  }, scene);

  cut.position.y = 0.6 / 2;
  cut.position.z = 0.1; // shift so it shows like a sliced part
  const mat = new BABYLON.StandardMaterial("cutMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
  mat.alpha = 0.25;
  cut.material = mat;
}

function createSineWaveBlock(scene) {
  // Dimensions
  const width = 0.3;    // X
  const depth = 0.3;    // Z
  const height = 0.2;   // base height
  const amp = 0.01;     // sine amplitude
  const freq = 5;       // waves along width

  const divX = 50;      // subdivisions along X
  const divZ = 10;      // subdivisions along Z

  const positions = [];
  const indices = [];
  const normals = [];
  const uvs = [];

  // ---------- TOP VERTICES ----------
  for (let iz = 0; iz <= divZ; iz++) {
    const z = (iz / divZ - 0.5) * depth;
    for (let ix = 0; ix <= divX; ix++) {
      const x = (ix / divX - 0.5) * width;
      const yTop = height + Math.sin(ix / divX * Math.PI * freq) * amp;
      positions.push(x, yTop, z);
      uvs.push(ix / divX, iz / divZ);
    }
  }

  // ---------- BOTTOM VERTICES ----------
  const offset = positions.length / 3;
  for (let iz = 0; iz <= divZ; iz++) {
    const z = (iz / divZ - 0.5) * depth;
    for (let ix = 0; ix <= divX; ix++) {
      const x = (ix / divX - 0.5) * width;
      const yBottom = 0;
      positions.push(x, yBottom, z);
      uvs.push(ix / divX, iz / divZ);
    }
  }

  const ring = divX + 1;

  // ---------- TOP FACES ----------
  for (let iz = 0; iz < divZ; iz++) {
    for (let ix = 0; ix < divX; ix++) {
      const a = iz * ring + ix;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // ---------- BOTTOM FACES ----------
  for (let iz = 0; iz < divZ; iz++) {
    for (let ix = 0; ix < divX; ix++) {
      const a = offset + iz * ring + ix;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      // note reversed winding so normals point outward
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // ---------- SIDE WALLS ----------

  // Front (z = -depth/2)  (iz = 0)
  for (let ix = 0; ix < divX; ix++) {
    const topA = ix;
    const topB = ix + 1;
    const botA = topA + offset;
    const botB = topB + offset;

    indices.push(topA, botA, topB);
    indices.push(botA, botB, topB);
  }

  // Back (z = +depth/2)  (iz = divZ)
  const backRow = divZ * ring;
  for (let ix = 0; ix < divX; ix++) {
    const topA = backRow + ix;
    const topB = backRow + ix + 1;
    const botA = topA + offset;
    const botB = topB + offset;

    // flip winding
    indices.push(topA, topB, botA);
    indices.push(botA, topB, botB);
  }

  // Left (x = -width/2) (ix = 0)
  for (let iz = 0; iz < divZ; iz++) {
    const topA = iz * ring;
    const topB = (iz + 1) * ring;
    const botA = topA + offset;
    const botB = topB + offset;

    indices.push(topA, topB, botA);
    indices.push(botA, topB, botB);
  }

  // Right (x = +width/2) (ix = divX)
  for (let iz = 0; iz < divZ; iz++) {
    const topA = iz * ring + divX;
    const topB = (iz + 1) * ring + divX;
    const botA = topA + offset;
    const botB = topB + offset;

    indices.push(topA, botA, topB);
    indices.push(botA, botB, topB);
  }

  // ---------- BUILD MESH ----------
  const mesh = new BABYLON.Mesh("sineBlock", scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  mesh.setIndices(indices);

  // Position on top of concrete block
  mesh.position.y = 0.6;  // height of concrete block
  // mesh.position.z = -0.3; // align front

  // ---------- TRANSPARENT MATERIAL ----------
  const mat = new BABYLON.StandardMaterial("sineMat", scene);
  mat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);
  mat.specularColor = new BABYLON.Color3(1, 1, 1);
  mat.alpha = 0.5;                                // transparency
  mat.backFaceCulling = false;                    // show both sides
  mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  mesh.material = mat;

  // Create dimension lines for sine wave block
  const lineMat = new BABYLON.StandardMaterial("sineLineMat", scene);
  lineMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  lineMat.disableLighting = true;

  const lineOffset = 0.03; // offset from the block edges

  // Width line (X-axis) - top front edge
  const sineWidthLine = createDimensionLine(
    "sineWidth",
    scene,
    width,
    new BABYLON.Vector3(0, mesh.position.y + height + lineOffset, -depth / 2 - lineOffset),
    new BABYLON.Vector3(0, 0, Math.PI / 2),
    new BABYLON.Vector3(-width / 2, mesh.position.y + height + lineOffset, -depth / 2 - lineOffset),
    new BABYLON.Vector3(width / 2, mesh.position.y + height + lineOffset, -depth / 2 - lineOffset),
    new BABYLON.Vector3(0, 0, Math.PI / 2),
    new BABYLON.Vector3(0, 0, -Math.PI / 2),
    new BABYLON.Vector3(-width / 2, mesh.position.y + height, -depth / 2),
    new BABYLON.Vector3(width / 2, mesh.position.y + height, -depth / 2),
    lineMat
  );

  // Height line (Y-axis) - front left edge
  const sineHeightLine = createDimensionLine(
    "sineHeight",
    scene,
    height,
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y + height / 2, -depth / 2 - lineOffset),
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y, -depth / 2 - lineOffset),
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y + height, -depth / 2 - lineOffset),
    new BABYLON.Vector3(Math.PI, 0, 0),
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(-width / 2, mesh.position.y, -depth / 2),
    new BABYLON.Vector3(-width / 2, mesh.position.y + height, -depth / 2),
    lineMat
  );

  // Depth line (Z-axis) - top left edge
  const sineDepthLine = createDimensionLine(
    "sineDepth",
    scene,
    depth,
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y + height + lineOffset, 0),
    new BABYLON.Vector3(Math.PI / 2, 0, 0),
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y + height + lineOffset, -depth / 2),
    new BABYLON.Vector3(-width / 2 - lineOffset, mesh.position.y + height + lineOffset, depth / 2),
    new BABYLON.Vector3(-Math.PI / 2, 0, 0),
    new BABYLON.Vector3(Math.PI / 2, 0, 0),
    new BABYLON.Vector3(-width / 2, mesh.position.y + height, -depth / 2),
    new BABYLON.Vector3(-width / 2, mesh.position.y + height, depth / 2),
    lineMat
  );

  // Add dimension labels for sine wave block
  const sineTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("SineDimensionUI");

  // Width label
  const sineWidthLabel = new BABYLON.GUI.TextBlock();
  sineWidthLabel.text = width.toFixed(2) + "m";
  sineWidthLabel.color = "black";
  sineWidthLabel.fontSize = 18;
  sineWidthLabel.fontWeight = "bold";
  sineTexture.addControl(sineWidthLabel);
  sineWidthLabel.linkWithMesh(sineWidthLine);
  sineWidthLabel.linkOffsetY = 25;

  // Height label
  const sineHeightLabel = new BABYLON.GUI.TextBlock();
  sineHeightLabel.text = height.toFixed(2) + "m";
  sineHeightLabel.color = "black";
  sineHeightLabel.fontSize = 18;
  sineHeightLabel.fontWeight = "bold";
  sineTexture.addControl(sineHeightLabel);
  sineHeightLabel.linkWithMesh(sineHeightLine);
  sineHeightLabel.linkOffsetX = -25;

  // Depth label
  const sineDepthLabel = new BABYLON.GUI.TextBlock();
  sineDepthLabel.text = depth.toFixed(2) + "m";
  sineDepthLabel.color = "black";
  sineDepthLabel.fontSize = 18;
  sineDepthLabel.fontWeight = "bold";
  sineTexture.addControl(sineDepthLabel);
  sineDepthLabel.linkWithMesh(sineDepthLine);
  sineDepthLabel.linkOffsetX = -25;

  // Create perpendicular dimension line from bottom left corner of wave block to top left edge of concrete block
  // Bottom left corner of wave block: (-width/2, mesh.position.y, -depth/2) = (-0.15, 0.6, -0.15)
  // Top left edge of concrete block runs along Z-axis at x=-0.3, y=0.6, from z=-0.5 to z=0.5
  const concreteWidth = 0.6;
  const concreteDepth = 1.0;
  
  const waveBottomLeft = new BABYLON.Vector3(-width / 2, mesh.position.y, -depth / 2);
  
  // Find the closest point on the top left edge (line along Z-axis)
  // Edge runs from (-concreteWidth/2, 0.6, -concreteDepth/2) to (-concreteWidth/2, 0.6, concreteDepth/2)
  const edgeX = -concreteWidth / 2;
  const edgeY = 0.6;
  const edgeZMin = -concreteDepth / 2;
  const edgeZMax = concreteDepth / 2;
  
  // Clamp the Z coordinate of wave corner to the edge range
  const closestZ = Math.max(edgeZMin, Math.min(edgeZMax, waveBottomLeft.z));
  const closestPointOnEdge = new BABYLON.Vector3(edgeX, edgeY, closestZ);
  
  const perpDistance = BABYLON.Vector3.Distance(waveBottomLeft, closestPointOnEdge);
  const perpDirection = closestPointOnEdge.subtract(waveBottomLeft).normalize();
  const yAxisRef = new BABYLON.Vector3(0, 1, 0);
  
  // Create the connecting line
  const connectingLine = BABYLON.MeshBuilder.CreateCylinder("connectingLine", {
    diameter: 0.0015,
    height: perpDistance
  }, scene);
  connectingLine.position = BABYLON.Vector3.Lerp(waveBottomLeft, closestPointOnEdge, 0.5);
  connectingLine.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirection, new BABYLON.Quaternion());
  connectingLine.material = lineMat;
  
  // Add arrows at both ends
  const connectionArrow1 = BABYLON.MeshBuilder.CreateCylinder("connectionArrow1", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow1.position = waveBottomLeft;
  connectionArrow1.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirection.negate(), new BABYLON.Quaternion());
  connectionArrow1.material = lineMat;
  
  const connectionArrow2 = BABYLON.MeshBuilder.CreateCylinder("connectionArrow2", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow2.position = closestPointOnEdge;
  connectionArrow2.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirection, new BABYLON.Quaternion());
  connectionArrow2.material = lineMat;
  
  // Add label showing the distance
  const connectionLabel = new BABYLON.GUI.TextBlock();
  connectionLabel.text = perpDistance.toFixed(3) + "m";
  connectionLabel.color = "black";
  connectionLabel.fontSize = 18;
  connectionLabel.fontWeight = "bold";
  sineTexture.addControl(connectionLabel);
  connectionLabel.linkWithMesh(connectingLine);
  connectionLabel.linkOffsetX = -35;

  // Create perpendicular dimension line from bottom right corner of wave block to top right edge of concrete block
  // Bottom right corner of wave block: (width/2, mesh.position.y, -depth/2) = (0.15, 0.6, -0.15)
  // Top right edge of concrete block runs along Z-axis at x=+concreteWidth/2, y=0.6, from z=-0.5 to z=0.5
  const waveBottomRight = new BABYLON.Vector3(width / 2, mesh.position.y, -depth / 2);
  
  const edgeXRight = concreteWidth / 2;
  const edgeYRight = 0.6;
  const edgeZMinRight = -concreteDepth / 2;
  const edgeZMaxRight = concreteDepth / 2;
  
  // Clamp the Z coordinate of wave corner to the edge range
  const closestZRight = Math.max(edgeZMinRight, Math.min(edgeZMaxRight, waveBottomRight.z));
  const closestPointOnEdgeRight = new BABYLON.Vector3(edgeXRight, edgeYRight, closestZRight);
  
  const perpDistanceRight = BABYLON.Vector3.Distance(waveBottomRight, closestPointOnEdgeRight);
  const perpDirectionRight = closestPointOnEdgeRight.subtract(waveBottomRight).normalize();
  
  // Create the connecting line
  const connectingLineRight = BABYLON.MeshBuilder.CreateCylinder("connectingLineRight", {
    diameter: 0.0015,
    height: perpDistanceRight
  }, scene);
  connectingLineRight.position = BABYLON.Vector3.Lerp(waveBottomRight, closestPointOnEdgeRight, 0.5);
  connectingLineRight.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionRight, new BABYLON.Quaternion());
  connectingLineRight.material = lineMat;
  
  // Add arrows at both ends
  const connectionArrow1Right = BABYLON.MeshBuilder.CreateCylinder("connectionArrow1Right", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow1Right.position = waveBottomRight;
  connectionArrow1Right.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionRight.negate(), new BABYLON.Quaternion());
  connectionArrow1Right.material = lineMat;
  
  const connectionArrow2Right = BABYLON.MeshBuilder.CreateCylinder("connectionArrow2Right", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow2Right.position = closestPointOnEdgeRight;
  connectionArrow2Right.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionRight, new BABYLON.Quaternion());
  connectionArrow2Right.material = lineMat;
  
  // Add label showing the distance
  const connectionLabelRight = new BABYLON.GUI.TextBlock();
  connectionLabelRight.text = perpDistanceRight.toFixed(3) + "m";
  connectionLabelRight.color = "black";
  connectionLabelRight.fontSize = 18;
  connectionLabelRight.fontWeight = "bold";
  sineTexture.addControl(connectionLabelRight);
  connectionLabelRight.linkWithMesh(connectingLineRight);
  connectionLabelRight.linkOffsetX = 35;

  // Create perpendicular dimension line from bottom right corner of wave block to top front edge of concrete block
  // Top front edge of concrete block runs along X-axis at z=-concreteDepth/2, y=0.6, from x=-0.3 to x=0.3
  const edgeZFront = -concreteDepth / 2;
  const edgeYFront = 0.6;
  const edgeXMinFront = -concreteWidth / 2;
  const edgeXMaxFront = concreteWidth / 2;
  
  // Clamp the X coordinate of wave corner to the edge range
  const closestXFront = Math.max(edgeXMinFront, Math.min(edgeXMaxFront, waveBottomRight.x));
  const closestPointOnEdgeFront = new BABYLON.Vector3(closestXFront, edgeYFront, edgeZFront);
  
  const perpDistanceFront = BABYLON.Vector3.Distance(waveBottomRight, closestPointOnEdgeFront);
  const perpDirectionFront = closestPointOnEdgeFront.subtract(waveBottomRight).normalize();
  
  // Create the connecting line
  const connectingLineFront = BABYLON.MeshBuilder.CreateCylinder("connectingLineFront", {
    diameter: 0.0015,
    height: perpDistanceFront
  }, scene);
  connectingLineFront.position = BABYLON.Vector3.Lerp(waveBottomRight, closestPointOnEdgeFront, 0.5);
  connectingLineFront.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionFront, new BABYLON.Quaternion());
  connectingLineFront.material = lineMat;
  
  // Add arrows at both ends
  const connectionArrow1Front = BABYLON.MeshBuilder.CreateCylinder("connectionArrow1Front", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow1Front.position = waveBottomRight;
  connectionArrow1Front.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionFront.negate(), new BABYLON.Quaternion());
  connectionArrow1Front.material = lineMat;
  
  const connectionArrow2Front = BABYLON.MeshBuilder.CreateCylinder("connectionArrow2Front", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow2Front.position = closestPointOnEdgeFront;
  connectionArrow2Front.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionFront, new BABYLON.Quaternion());
  connectionArrow2Front.material = lineMat;
  
  // Add label showing the distance
  const connectionLabelFront = new BABYLON.GUI.TextBlock();
  connectionLabelFront.text = perpDistanceFront.toFixed(3) + "m";
  connectionLabelFront.color = "black";
  connectionLabelFront.fontSize = 18;
  connectionLabelFront.fontWeight = "bold";
  sineTexture.addControl(connectionLabelFront);
  connectionLabelFront.linkWithMesh(connectingLineFront);
  connectionLabelFront.linkOffsetY = -35;

  // Create perpendicular dimension line from bottom right back corner of wave block to top back edge of concrete block
  // Bottom right back corner of wave block: (width/2, mesh.position.y, depth/2)
  const waveBottomRightBack = new BABYLON.Vector3(width / 2, mesh.position.y, depth / 2);
  
  // Top back edge of concrete block runs along X-axis at z=+concreteDepth/2, y=0.6, from x=-0.3 to x=0.3
  const edgeZBack = concreteDepth / 2;
  const edgeYBack = 0.6;
  const edgeXMinBack = -concreteWidth / 2;
  const edgeXMaxBack = concreteWidth / 2;
  
  // Clamp the X coordinate of wave corner to the edge range
  const closestXBack = Math.max(edgeXMinBack, Math.min(edgeXMaxBack, waveBottomRightBack.x));
  const closestPointOnEdgeBack = new BABYLON.Vector3(closestXBack, edgeYBack, edgeZBack);
  
  const perpDistanceBack = BABYLON.Vector3.Distance(waveBottomRightBack, closestPointOnEdgeBack);
  const perpDirectionBack = closestPointOnEdgeBack.subtract(waveBottomRightBack).normalize();
  
  // Create the connecting line
  const connectingLineBack = BABYLON.MeshBuilder.CreateCylinder("connectingLineBack", {
    diameter: 0.0015,
    height: perpDistanceBack
  }, scene);
  connectingLineBack.position = BABYLON.Vector3.Lerp(waveBottomRightBack, closestPointOnEdgeBack, 0.5);
  connectingLineBack.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionBack, new BABYLON.Quaternion());
  connectingLineBack.material = lineMat;
  
  // Add arrows at both ends
  const connectionArrow1Back = BABYLON.MeshBuilder.CreateCylinder("connectionArrow1Back", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow1Back.position = waveBottomRightBack;
  connectionArrow1Back.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionBack.negate(), new BABYLON.Quaternion());
  connectionArrow1Back.material = lineMat;
  
  const connectionArrow2Back = BABYLON.MeshBuilder.CreateCylinder("connectionArrow2Back", {
    diameterTop: 0,
    diameterBottom: 0.008,
    height: 0.015
  }, scene);
  connectionArrow2Back.position = closestPointOnEdgeBack;
  connectionArrow2Back.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(yAxisRef, perpDirectionBack, new BABYLON.Quaternion());
  connectionArrow2Back.material = lineMat;
  
  // Add label showing the distance
  const connectionLabelBack = new BABYLON.GUI.TextBlock();
  connectionLabelBack.text = perpDistanceBack.toFixed(3) + "m";
  connectionLabelBack.color = "black";
  connectionLabelBack.fontSize = 18;
  connectionLabelBack.fontWeight = "bold";
  sineTexture.addControl(connectionLabelBack);
  connectionLabelBack.linkWithMesh(connectingLineBack);
  connectionLabelBack.linkOffsetY = 35;

  return mesh;
}

function createLeftWaveBlock(scene) {
  // Dimensions - wave block on left face of concrete block
  const width = 1;    // Z direction
  const depth = 0.6 ;    // Y direction (height of concrete block)
  const height = 0.1;   // X direction (extending outward)
  const amp = 0.01;     // sine amplitude
  const freq = 5;       // waves along width

  const divZ = 50;      // subdivisions along Z
  const divY = 10;      // subdivisions along Y

  const positions = [];
  const indices = [];
  const normals = [];
  const uvs = [];

  // ---------- OUTER FACE VERTICES (wavy surface) ----------
  for (let iy = 0; iy <= divY; iy++) {
    const y = (iy / divY) * depth; // 0 to 0.6
    for (let iz = 0; iz <= divZ; iz++) {
      const z = (iz / divZ - 0.5) * width; // -0.15 to 0.15
      const xOuter = -0.3 - height - Math.sin(iz / divZ * Math.PI * freq) * amp;
      positions.push(xOuter, y, z);
      uvs.push(iz / divZ, iy / divY);
    }
  }

  // ---------- INNER FACE VERTICES (flat surface) ----------
  const offset = positions.length / 3;
  for (let iy = 0; iy <= divY; iy++) {
    const y = (iy / divY) * depth;
    for (let iz = 0; iz <= divZ; iz++) {
      const z = (iz / divZ - 0.5) * width;
      const xInner = -0.3;
      positions.push(xInner, y, z);
      uvs.push(iz / divZ, iy / divY);
    }
  }

  const ring = divZ + 1;

  // ---------- OUTER FACES ----------
  for (let iy = 0; iy < divY; iy++) {
    for (let iz = 0; iz < divZ; iz++) {
      const a = iy * ring + iz;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // ---------- INNER FACES ----------
  for (let iy = 0; iy < divY; iy++) {
    for (let iz = 0; iz < divZ; iz++) {
      const a = offset + iy * ring + iz;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // ---------- SIDE WALLS ----------

  // Front (z = -width/2)  (iz = 0)
  for (let iy = 0; iy < divY; iy++) {
    const outerA = iy * ring;
    const outerB = (iy + 1) * ring;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  // Back (z = +width/2)  (iz = divZ)
  const backCol = divZ;
  for (let iy = 0; iy < divY; iy++) {
    const outerA = iy * ring + backCol;
    const outerB = (iy + 1) * ring + backCol;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // Bottom (y = 0) (iy = 0)
  for (let iz = 0; iz < divZ; iz++) {
    const outerA = iz;
    const outerB = iz + 1;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // Top (y = depth) (iy = divY)
  const topRow = divY * ring;
  for (let iz = 0; iz < divZ; iz++) {
    const outerA = topRow + iz;
    const outerB = topRow + iz + 1;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  // ---------- BUILD MESH ----------
  const mesh = new BABYLON.Mesh("leftWaveBlock", scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  mesh.setIndices(indices);

  // ---------- TRANSPARENT MATERIAL ----------
  const mat = new BABYLON.StandardMaterial("leftWaveMat", scene);
  mat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);
  mat.specularColor = new BABYLON.Color3(1, 1, 1);
  mat.alpha = 0.2;
  mat.backFaceCulling = false;
  mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  mesh.material = mat;

  return mesh;
}

function createRightWaveBlock(scene) {
  // Dimensions - wave block on right face of concrete block
  const width = 1;    // Z direction
  const depth = 0.6;    // Y direction (height of concrete block)
  const height = 0.1;   // X direction (extending outward)
  const amp = 0.01;     // sine amplitude
  const freq = 5;       // waves along width

  const divZ = 50;      // subdivisions along Z
  const divY = 10;      // subdivisions along Y

  const positions = [];
  const indices = [];
  const normals = [];
  const uvs = [];

  // ---------- OUTER FACE VERTICES (wavy surface) ----------
  for (let iy = 0; iy <= divY; iy++) {
    const y = (iy / divY) * depth; // 0 to 0.6
    for (let iz = 0; iz <= divZ; iz++) {
      const z = (iz / divZ - 0.5) * width; // -0.15 to 0.15
      const xOuter = 0.3 + height + Math.sin(iz / divZ * Math.PI * freq) * amp;
      positions.push(xOuter, y, z);
      uvs.push(iz / divZ, iy / divY);
    }
  }

  // ---------- INNER FACE VERTICES (flat surface) ----------
  const offset = positions.length / 3;
  for (let iy = 0; iy <= divY; iy++) {
    const y = (iy / divY) * depth;
    for (let iz = 0; iz <= divZ; iz++) {
      const z = (iz / divZ - 0.5) * width;
      const xInner = 0.3;
      positions.push(xInner, y, z);
      uvs.push(iz / divZ, iy / divY);
    }
  }

  const ring = divZ + 1;

  // ---------- OUTER FACES ----------
  for (let iy = 0; iy < divY; iy++) {
    for (let iz = 0; iz < divZ; iz++) {
      const a = iy * ring + iz;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // ---------- INNER FACES ----------
  for (let iy = 0; iy < divY; iy++) {
    for (let iz = 0; iz < divZ; iz++) {
      const a = offset + iy * ring + iz;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // ---------- SIDE WALLS ----------

  // Front (z = -width/2)  (iz = 0)
  for (let iy = 0; iy < divY; iy++) {
    const outerA = iy * ring;
    const outerB = (iy + 1) * ring;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // Back (z = +width/2)  (iz = divZ)
  const backCol = divZ;
  for (let iy = 0; iy < divY; iy++) {
    const outerA = iy * ring + backCol;
    const outerB = (iy + 1) * ring + backCol;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  // Bottom (y = 0) (iy = 0)
  for (let iz = 0; iz < divZ; iz++) {
    const outerA = iz;
    const outerB = iz + 1;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  // Top (y = depth) (iy = divY)
  const topRow = divY * ring;
  for (let iz = 0; iz < divZ; iz++) {
    const outerA = topRow + iz;
    const outerB = topRow + iz + 1;
    const innerA = outerA + offset;
    const innerB = outerB + offset;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // ---------- BUILD MESH ----------
  const mesh = new BABYLON.Mesh("rightWaveBlock", scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  mesh.setIndices(indices);

  // ---------- TRANSPARENT MATERIAL ----------
  const mat = new BABYLON.StandardMaterial("rightWaveMat", scene);
  mat.diffuseColor = new BABYLON.Color3(214 / 255, 217 / 255, 200 / 255);
  mat.specularColor = new BABYLON.Color3(1, 1, 1);
  mat.alpha = 0.2;
  mat.backFaceCulling = false;
  mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  mesh.material = mat;

  return mesh;
}
