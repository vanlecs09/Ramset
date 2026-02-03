import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

/**
 * Centralized material management for all 3D models
 * All materials are cached per-scene and reused to optimize memory usage
 */

// ============================================================================
// Global Material Cache per Scene
// ============================================================================

const materialCache = new WeakMap<BABYLON.Scene, MaterialSet>();

interface MaterialSet {
  concreteMaterial?: BABYLON.StandardMaterial;
  boundlessMaterial?: BABYLON.StandardMaterial;
  dimensionMaterial?: BABYLON.StandardMaterial;
  beamMaterial?: BABYLON.StandardMaterial;
  waveBlockMaterial?: BABYLON.StandardMaterial;
  secondaryPostMaterial?: BABYLON.StandardMaterial;
  torsionMaterial?: BABYLON.StandardMaterial;
  circularStandingWaveMaterial?: BABYLON.StandardMaterial;
  dimensionLabelTexture?: GUI.AdvancedDynamicTexture;
}

// ============================================================================
// Material Factory Functions
// ============================================================================

/**
 * Get or create concrete material for a scene
 */
export const getConcreteMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.concreteMaterial) {
    cache.concreteMaterial = new BABYLON.StandardMaterial(
      'concreteMaterial',
      scene,
    );
    cache.concreteMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // light gray tint
    cache.concreteMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    cache.concreteMaterial.alpha = 0.4; // transparency (0 = invisible, 1 = opaque)
    cache.concreteMaterial.backFaceCulling = false;
  }

  return cache.concreteMaterial;
};

/**
 * Get or create sin block (infinite concrete) material for a scene
 */
export const getBoundlessMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.boundlessMaterial) {
    cache.boundlessMaterial = new BABYLON.StandardMaterial(
      'sinBlockMaterial',
      scene,
    );
    cache.boundlessMaterial.diffuseColor = new BABYLON.Color3(
      214 / 255,
      217 / 255,
      200 / 255,
    ); // tan/beige color
    // cache.boundlessMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    cache.boundlessMaterial.alpha = 0.1; // semi-transparent
    cache.boundlessMaterial.transparencyMode =
      BABYLON.Material.MATERIAL_ALPHABLEND;
    cache.boundlessMaterial.backFaceCulling = false;
    cache.boundlessMaterial.cullBackFaces = false;
    cache.boundlessMaterial.disableLighting = true;
  }

  return cache.boundlessMaterial;
};

/**
 * Get or create concrete dimension material for a scene
 */
export const getConcreteDimensionMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.dimensionMaterial) {
    cache.dimensionMaterial = new BABYLON.StandardMaterial(
      'dimensionMaterial',
      scene,
    );
    cache.dimensionMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0); // black
    cache.dimensionMaterial.disableLighting = true;
  }

  return cache.dimensionMaterial;
};

/**
 * Get or create beam material for a scene
 */
export const getBeamMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.beamMaterial) {
    cache.beamMaterial = new BABYLON.StandardMaterial('beamMaterial', scene);
    cache.beamMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7); // medium gray
    cache.beamMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    cache.beamMaterial.alpha = 0.85;
  }

  return cache.beamMaterial;
};

/**
 * Get or create wave block material for a scene
 */
export const getWaveBlockMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.waveBlockMaterial) {
    cache.waveBlockMaterial = new BABYLON.StandardMaterial(
      'waveBlockMaterial',
      scene,
    );
    cache.waveBlockMaterial.diffuseColor = new BABYLON.Color3(
      214 / 255,
      217 / 255,
      200 / 255,
    ); // tan/beige
    cache.waveBlockMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    cache.waveBlockMaterial.alpha = 0.7;
    cache.waveBlockMaterial.transparencyMode =
      BABYLON.Material.MATERIAL_ALPHABLEND;
  }

  return cache.waveBlockMaterial;
};

/**
 * Get or create secondary post material for a scene
 */
export const getSecondaryPostMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.secondaryPostMaterial) {
    cache.secondaryPostMaterial = new BABYLON.StandardMaterial(
      'secondaryPostMaterial',
      scene,
    );
    cache.secondaryPostMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // black
    cache.secondaryPostMaterial.specularColor = new BABYLON.Color3(
      0.1,
      0.1,
      0.1,
    );
  }

  return cache.secondaryPostMaterial;
};

/**
 * Get or create torsion moment material for a scene
 */
export const getTorsionMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.torsionMaterial) {
    cache.torsionMaterial = new BABYLON.StandardMaterial('torsionMat', scene);
    cache.torsionMaterial.diffuseColor = BABYLON.Color3.Black();
  }

  return cache.torsionMaterial;
};

/**
 * Get or create circular standing wave material for a scene
 */
export const getCircularStandingWaveMaterial = (
  scene: BABYLON.Scene,
): BABYLON.StandardMaterial => {
  let cache = materialCache.get(scene);
  if (!cache) {
    cache = {};
    materialCache.set(scene, cache);
  }

  if (!cache.circularStandingWaveMaterial) {
    cache.circularStandingWaveMaterial = new BABYLON.StandardMaterial(
      'circularStandingWaveMaterial',
      scene,
    );
    cache.circularStandingWaveMaterial.diffuseColor = new BABYLON.Color3(
      214 / 255,
      217 / 255,
      200 / 255,
    ); // tan/beige color
    cache.circularStandingWaveMaterial.specularColor = new BABYLON.Color3(
      1,
      1,
      1,
    );
    cache.circularStandingWaveMaterial.alpha = 0.4;
    cache.circularStandingWaveMaterial.backFaceCulling = false;
  }

  return cache.circularStandingWaveMaterial;
};

// ============================================================================
// Dimension Label Texture Management
// ============================================================================

/**
 * Get or create dimension label texture
 * This texture is global and shared across all dimension labels
 */
export const getDimensionLabelTexture = (): GUI.AdvancedDynamicTexture => {
  // Create a dummy scene to use as cache key
  // Since the texture is global, we use a static approach
  if (!globalDimensionLabelTexture) {
    globalDimensionLabelTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI('DimensionLabelUI');
  }
  return globalDimensionLabelTexture;
};

/**
 * Dispose the global dimension label texture
 */
export const disposeDimensionLabelTexture = () => {
  if (globalDimensionLabelTexture) {
    globalDimensionLabelTexture.dispose();
    globalDimensionLabelTexture = null;
  }
};

// Global dimension label texture - shared across all scenes
let globalDimensionLabelTexture: GUI.AdvancedDynamicTexture | null = null;

// ============================================================================
// Batch Material Getters for Convenience
// ============================================================================

/**
 * Get all materials needed for concrete nodes
 */
export const getConcreteMaterials = (scene: BABYLON.Scene) => {
  return {
    concrete: getConcreteMaterial(scene),
    sinBlock: getBoundlessMaterial(scene),
    dimension: getConcreteDimensionMaterial(scene),
  };
};

/**
 * Get all materials needed for lap splice nodes
 */
export const getLapSpliceMaterials = (scene: BABYLON.Scene) => {
  return {
    slab: getConcreteMaterial(scene),
    waveBlock: getWaveBlockMaterial(scene),
    dimension: getConcreteDimensionMaterial(scene),
    secondaryPost: getSecondaryPostMaterial(scene),
  };
};

/**
 * Get all materials needed for end anchorage nodes
 */
export const getEndAnchorageMaterials = (scene: BABYLON.Scene) => {
  return {
    beam: getBeamMaterial(scene),
    waveBlock: getWaveBlockMaterial(scene),
    dimension: getConcreteDimensionMaterial(scene),
    torsion: getTorsionMaterial(scene),
  };
};
