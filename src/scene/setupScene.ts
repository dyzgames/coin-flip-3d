import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface SceneRig {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  resize: () => void;
}

export function setupScene(canvas: HTMLCanvasElement): SceneRig {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 6.2, 8.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearAlpha(0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // A neutral procedural room gives the metal coin material something to
  // reflect — without an environment map, metalness:1 surfaces render
  // almost black except for direct specular highlights.
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.background = null;
  scene.fog = new THREE.Fog(0x0b0c10, 16, 34);

  const hemi = new THREE.HemisphereLight(0x9fb2c9, 0x14151c, 0.7);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2d0, 1.8);
  key.position.set(4.5, 8, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0015;
  key.shadow.radius = 3;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6fb7ff, 0.6);
  rim.position.set(-5, 4, -4);
  scene.add(rim);

  const fill = new THREE.PointLight(0xffe6a8, 0.5, 20, 2);
  fill.position.set(-2, 2.4, 4);
  scene.add(fill);

  const groundGeo = new THREE.CircleGeometry(9, 96);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x101218,
    metalness: 0.35,
    roughness: 0.75,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.PolarGridHelper(9, 16, 8, 64, 0x2a2d38, 0x1a1c24);
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.5;
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4.5;
  controls.maxDistance = 13;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.42;
  controls.enablePan = false;
  controls.update();

  function resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", resize);

  return { scene, camera, renderer, controls, resize };
}
