import * as BABYLON from '@babylonjs/core';
import { getWaveBlockMaterial } from './Material';


/**
 * Debug helper: Visualizes all vertices in a mesh as small spheres
 * @param mesh - The mesh to debug
 * @param scene - Babylon.js scene
 * @param pointSize - Size of the debug point spheres (default 0.02)
 * @param color - Color of the debug points (default red)
 * @returns Array of debug sphere meshes
 */
export const debugMeshVertices = (
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
  pointSize: number = 0.02,
  color: BABYLON.Color3 = new BABYLON.Color3(1, 0, 0),
): BABYLON.Mesh[] => {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const debugSpheres: BABYLON.Mesh[] = [];

  if (!positions) {
    console.warn('No positions found in mesh');
    return debugSpheres;
  }

  // Create material for debug points
  const debugMaterial = new BABYLON.StandardMaterial('debugPointMaterial', scene);
  debugMaterial.diffuseColor = color;
  debugMaterial.emissiveColor = color.scale(0.5);

  // Create a sphere for each vertex
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    const sphere = BABYLON.MeshBuilder.CreateSphere(
      `debugPoint_${i / 3}`,
      { diameter: pointSize, segments: 8 },
      scene,
    );
    sphere.position = new BABYLON.Vector3(x, y, z);
    sphere.material = debugMaterial;
    debugSpheres.push(sphere);
  }

  console.log(`Created ${debugSpheres.length} debug points for mesh vertices`);
  return debugSpheres;
};

/**
 * Debug helper: Remove all debug visualization spheres
 * @param debugSpheres - Array of debug sphere meshes to remove
 */
export const removeDebugVertices = (debugSpheres: BABYLON.Mesh[]): void => {
  debugSpheres.forEach(sphere => sphere.dispose());
  console.log(`Removed ${debugSpheres.length} debug points`);
};

/**
 * Debug helper: Log mesh vertex information to console
 * @param mesh - The mesh to analyze
 */
export const logMeshInfo = (mesh: BABYLON.Mesh): void => {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const indices = mesh.getIndices();
  
  console.log('=== Mesh Debug Info ===');
  console.log(`Mesh name: ${mesh.name}`);
  console.log(`Total vertices: ${positions ? positions.length / 3 : 0}`);
  console.log(`Total indices: ${indices ? indices.length : 0}`);
  console.log(`Total triangles: ${indices ? indices.length / 3 : 0}`);
  
  if (positions) {
    console.log('First 5 vertices:');
    for (let i = 0; i < Math.min(5, positions.length / 3); i++) {
      console.log(`  Vertex ${i}: (${positions[i * 3]}, ${positions[i * 3 + 1]}, ${positions[i * 3 + 2]})`);
    }
  }
};

export const createWaveBlock = (
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  blockWidth: number,
  blockHeight: number,
  blockDepth: number,
  waveAxis: 'x' | 'y' | 'z' | '-x' | '-y' | '-z',
): BABYLON.Mesh => {
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  addBlockVertices(
    blockWidth,
    blockHeight,
    blockDepth,
    waveAxis,
    position,
    positions,
    indices,
    0,
    uvs,
  );

  const mesh = new BABYLON.Mesh(name, scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

  const normalsArray: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normalsArray);
  mesh.setIndices(indices);

  mesh.material = getWaveBlockMaterial(scene);
  // mesh.position = position;

  return mesh;
};

const addBlockVertices = (
  blockWidth: number,
  blockHeight: number,
  blockDepth: number,
  direction: 'x' | 'y' | 'z' | '-x' | '-y' | '-z',
  concretePosition: BABYLON.Vector3,
  positions: number[],
  indices: number[],
  vertexCount: number,
  uvs: number[],
) => {
  const startVertex = vertexCount;
  const divU = 50;
  const divV = 50;
  const amp = 0.04;
  const freq = blockWidth * 10; // blockDepth 1 = freq 5

  // Helper function to apply rotation and scaling
  const transformVertex = (
    vertex: [number, number, number],
  ): [number, number, number] => {
    let [x, y, z] = vertex;

    // Scale the unit block
    x *= blockWidth;
    y *= blockHeight;
    z *= blockDepth;

    // Apply rotation based on direction
    let rotatedX = x,
      rotatedY = y,
      rotatedZ = z;

    switch (direction) {
      case 'x':
        // Rotate 90° around Z axis
        [rotatedX, rotatedY] = [y, -x];
        break;
      case '-x':
        // Rotate -90° around Z axis to point head to (-1, 0, 0)
        [rotatedX, rotatedY] = [-y, x];
        break;
      case 'z':
        // Rotate 90° around X axis to point head to (0, 0, 1)
        [rotatedY, rotatedZ] = [-z, y];
        break;
      case '-z':
        // Rotate -90° around X axis to point head to (0, 0, -1)
        [rotatedY, rotatedZ] = [z, -y];
        break;
      case '-y':
        // Rotate 180° around Z axis to point head to (0, -1, 0)
        rotatedX = -x;
        rotatedY = -y;
        break;
    }

    // Translate by concrete position
    rotatedX += concretePosition.x;
    rotatedY += concretePosition.y;
    rotatedZ += concretePosition.z;

    return [rotatedX, rotatedY, rotatedZ];
  };

  // Outer face vertices (wavy surface)
  for (let iv = 0; iv <= divV; iv++) {
    const z = iv / divV - 0.5; // Normalized depth (-0.5 to 0.5)
    for (let iu = 0; iu <= divU; iu++) {
      const x = iu / divU - 0.5; // Normalized width (-0.5 to 0.5)
      const waveDisplacement = Math.sin((iu / divU) * Math.PI * freq) * amp;

      // Build unit block with wave in local coordinates
      const posLocalX = x;
      const posLocalY = 0.5 + waveDisplacement;
      const posLocalZ = z;

      const [posX, posY, posZ] = transformVertex([
        posLocalX,
        posLocalY,
        posLocalZ,
      ]);
      positions.push(posX, posY, posZ);
      uvs.push(iu / divU, iv / divV);
    }
  }

  // Inner face vertices (flat surface)
  const offset = divV + 1;
  for (let iv = 0; iv <= divV; iv++) {
    const z = iv / divV - 0.5; // Normalized depth (-0.5 to 0.5)
    for (let iu = 0; iu <= divU; iu++) {
      const x = iu / divU - 0.5; // Normalized width (-0.5 to 0.5)

      // Build unit block without wave in local coordinates
      const posLocalX = x;
      const posLocalY = -0.5;
      const posLocalZ = z;

      const [posX, posY, posZ] = transformVertex([
        posLocalX,
        posLocalY,
        posLocalZ,
      ]);
      positions.push(posX, posY, posZ);
      uvs.push(iu / divU, iv / divV);
    }
  }

  const ring = divU + 1;

  // Outer face triangles
  for (let iv = 0; iv < divV; iv++) {
    for (let iu = 0; iu < divU; iu++) {
      const a = startVertex + iv * ring + iu;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // Inner face triangles
  for (let iv = 0; iv < divV; iv++) {
    for (let iu = 0; iu < divU; iu++) {
      const a = startVertex + offset * ring + iv * ring + iu;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Side walls
  const backCol = divU;
  for (let iv = 0; iv < divV; iv++) {
    const outerA = startVertex + iv * ring;
    const outerB = startVertex + (iv + 1) * ring;
    const innerA = startVertex + offset * ring + iv * ring;
    const innerB = startVertex + offset * ring + (iv + 1) * ring;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  for (let iv = 0; iv < divV; iv++) {
    const outerA = startVertex + iv * ring + backCol;
    const outerB = startVertex + (iv + 1) * ring + backCol;
    const innerA = startVertex + offset * ring + iv * ring + backCol;
    const innerB = startVertex + offset * ring + (iv + 1) * ring + backCol;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // Bottom wall
  for (let iu = 0; iu < divU; iu++) {
    const outerA = startVertex + iu;
    const outerB = startVertex + iu + 1;
    const innerA = startVertex + offset * ring + iu;
    const innerB = startVertex + offset * ring + iu + 1;

    indices.push(outerA, innerA, outerB);
    indices.push(innerA, innerB, outerB);
  }

  // Top wall
  const topRow = startVertex + divV * ring;
  for (let iu = 0; iu < divU; iu++) {
    const outerA = topRow + iu;
    const outerB = topRow + iu + 1;
    const innerA = startVertex + offset * ring + divV * ring + iu;
    const innerB = startVertex + offset * ring + divV * ring + iu + 1;

    indices.push(outerA, outerB, innerA);
    indices.push(innerA, outerB, innerB);
  }

  vertexCount += (divV + 1) * (divU + 1) * 2;
};

/**
 * Create a 3D standing wave on top of a circular column
 * @param scene - Babylon.js scene
 * @param position - Center position of the wave
 * @param radius - Radius of the circular wave pattern
 * @param height - Height of the wave oscillation
 * @param material - Material to apply to the wave
 * @param amplitude - Amplitude of the wave (default 0.05)
 * @param frequency - Frequency of the wave pattern (default 5)
 * @returns Babylon.js Mesh representing the 3D standing wave
 */
export const createCircularStandingWave = (
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  radius: number,
  height: number,
  material: BABYLON.StandardMaterial,
  amplitude: number = 0.025,
  frequency: number = 20,
): BABYLON.Mesh => {
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];  const normals: number[] = []; // Pre-allocate normals array for manual control
  const divTheta = 128; // Angular divisions (circumference segments)
  const divRadius = 256; // Radial divisions

  // Outer face vertices (wavy surface)
  for (let ir = 0; ir <= divRadius; ir++) {
    const r = (ir / divRadius) * radius;

    for (let itheta = 0; itheta <= divTheta; itheta++) {
      const theta = (itheta / divTheta) * Math.PI * 2; // Full circle

         const radialWave = Math.sin((ir / divRadius) * Math.PI) * amplitude;
      const angularWave = Math.cos(theta * frequency) * amplitude;
      const waviness = (radialWave + angularWave) / 2;

      // const waviness = amplitude * Math.sin( 2.0 * Math.PI * ( 1/frequency - r/(radius/2)));
      // Calculate position
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = position.y + height/2 + waviness;

      positions.push(position.x + x, position.y + y, position.z + z);

      // UV coordinates
      uvs.push(ir / divRadius, itheta / divTheta);
    }
  }

  // Inner face vertices (flat surface below the wave)
  const offset = (divRadius + 1) * (divTheta + 1);
  for (let ir = 0; ir <= divRadius; ir++) {
    const r = (ir / divRadius) * radius;

    for (let itheta = 0; itheta <= divTheta; itheta++) {
      const theta = (itheta / divTheta) * Math.PI * 2; // Full circle

      // Calculate position - flat surface at the bottom
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = position.y - height / 2; // Flat bottom surface

      positions.push(position.x + x, y, position.z + z);

      // UV coordinates
      uvs.push(ir / divRadius, itheta / divTheta);
    }
  }

  // Generate indices (triangles)
  const ring = divTheta + 1;

  // Outer face triangles (wavy surface)
  for (let ir = 0; ir < divRadius; ir++) {
    for (let itheta = 0; itheta < divTheta; itheta++) {
      const current = ir * ring + itheta;
      const next = current + 1;
      const nextRing = (ir + 1) * ring + itheta;
      const nextRingNext = nextRing + 1;

      // First triangle
      indices.push(current, nextRing, next);
      // Second triangle
      indices.push(next, nextRing, nextRingNext);
    }
  }

  // Inner face triangles (flat bottom surface - reversed winding for backface)
  for (let ir = 0; ir < divRadius; ir++) {
    for (let itheta = 0; itheta < divTheta; itheta++) {
      const current = offset + ir * ring + itheta;
      const next = current + 1;
      const nextRing = offset + (ir + 1) * ring + itheta;
      const nextRingNext = nextRing + 1;

      // Reversed winding for inner face
      indices.push(current, next, nextRing);
      indices.push(next, nextRingNext, nextRing);
    }
  }

  // Side wall - circular perimeter connecting top and bottom surfaces
  // Generate NEW vertex positions for the wall instead of reusing via indices
  for (let itheta = 0; itheta < divTheta; itheta++) {
    // Get indices of outermost ring vertices (at radius = divRadius)
    const topA = divRadius * ring + itheta;
    const topB = divRadius * ring + itheta + 1;
    const bottomA = offset + divRadius * ring + itheta;
    const bottomB = offset + divRadius * ring + itheta + 1;

    // Get original positions from existing vertices
    const topAX = positions[topA * 3];
    const topAY = positions[topA * 3 + 1];
    const topAZ = positions[topA * 3 + 2];

    const topBX = positions[topB * 3];
    const topBY = positions[topB * 3 + 1];
    const topBZ = positions[topB * 3 + 2];

    const bottomAX = positions[bottomA * 3];
    const bottomAY = positions[bottomA * 3 + 1];
    const bottomAZ = positions[bottomA * 3 + 2];

    const bottomBX = positions[bottomB * 3];
    const bottomBY = positions[bottomB * 3 + 1];
    const bottomBZ = positions[bottomB * 3 + 2];

    // Calculate normal vectors pointing radially outward (cylindrical normals)
    const thetaA = (itheta / divTheta) * Math.PI * 2;
    const thetaB = ((itheta + 1) / divTheta) * Math.PI * 2;
    
    const normalAX = Math.cos(thetaA);
    const normalAZ = Math.sin(thetaA);
    
    const normalBX = Math.cos(thetaB);
    const normalBZ = Math.sin(thetaB);

    // Create NEW vertices for this wall segment (4 new vertices per segment)
    const newTopA = positions.length / 3;
    positions.push(topAX, topAY, topAZ);
    normals.push(normalAX, 0, normalAZ); // Cylindrical normal (no Y component)
    uvs.push(itheta / divTheta, 0);

    const newTopB = positions.length / 3;
    positions.push(topBX, topBY, topBZ);
    normals.push(normalBX, 0, normalBZ); // Cylindrical normal (no Y component)
    uvs.push((itheta + 1) / divTheta, 0);

    const newBottomA = positions.length / 3;
    positions.push(bottomAX, bottomAY, bottomAZ);
    normals.push(normalAX, 0, normalAZ); // Cylindrical normal (no Y component)
    uvs.push(itheta / divTheta, 1);

    const newBottomB = positions.length / 3;
    positions.push(bottomBX, bottomBY, bottomBZ);
    normals.push(normalBX, 0, normalBZ); // Cylindrical normal (no Y component)
    uvs.push((itheta + 1) / divTheta, 1);

    // Create two triangles using the NEW vertices
    indices.push(newTopA, newBottomA, newTopB);
    indices.push(newTopB, newBottomA, newBottomB);
  }

  console.log('Created circular perimeter wall with new geometry and cylindrical normals');

  // Create mesh
  const mesh = new BABYLON.Mesh('circularStandingWave', scene);
  mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
  mesh.setIndices(indices);

  // Compute normals for all vertices first
  const finalNormals: number[] = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, finalNormals);
  
  // Now overwrite normals for wall vertices with our manually calculated cylindrical normals
  // Wall vertices start after all top and bottom surface vertices
  const topBottomVertexCount = (divRadius + 1) * (divTheta + 1) * 2;
  const wallNormalStartIndex = topBottomVertexCount * 3;
  
  // Copy manually calculated wall normals from our normals array
  for (let i = 0; i < normals.length; i++) {
    finalNormals[wallNormalStartIndex + i] = normals[i];
  }
  
  mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, finalNormals);

  mesh.material = material;

  return mesh;
};
