import * as THREE from "three";
import { COIN_RADIUS, COIN_HALF_THICKNESS } from "../physics/world";
import { createEdgeTexture, createFaceTexture } from "./textures";

/**
 * Builds the coin mesh. Geometry group order for a closed CylinderGeometry is
 * [side, topCap, bottomCap] — top (+Y) carries the "cara" face, bottom (-Y)
 * carries "cruz", matching the physics module's local +Y = cara convention.
 */
export function createCoinMesh(): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(
    COIN_RADIUS,
    COIN_RADIUS,
    COIN_HALF_THICKNESS * 2,
    96,
    1,
    false
  );

  const edgeTexture = createEdgeTexture();
  const caraTexture = createFaceTexture("cara");
  const cruzTexture = createFaceTexture("cruz");

  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    map: edgeTexture,
    metalness: 1,
    roughness: 0.38,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
  });

  const caraMaterial = new THREE.MeshPhysicalMaterial({
    map: caraTexture,
    metalness: 0.88,
    roughness: 0.38,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
  });

  const cruzMaterial = new THREE.MeshPhysicalMaterial({
    map: cruzTexture,
    metalness: 0.88,
    roughness: 0.38,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
  });

  const mesh = new THREE.Mesh(geometry, [edgeMaterial, caraMaterial, cruzMaterial]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
