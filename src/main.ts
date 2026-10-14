import "./style.css";
import * as THREE from "three";
import { setupScene } from "./scene/setupScene";
import { createCoinMesh } from "./coin/createCoin";
import { createPhysicsWorld, COIN_HALF_THICKNESS } from "./physics/world";
import { launchCoin, readCoinResult, isCoinQuiet, type CoinResult } from "./physics/flip";
import { Hud } from "./ui/ui";
import { SoundKit } from "./audio/sound";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const rig = setupScene(canvas);
const hud = new Hud();
const sound = new SoundKit();

const coinMesh = createCoinMesh();
rig.scene.add(coinMesh);

const { world, coinBody } = createPhysicsWorld();
coinBody.position.set(0, COIN_HALF_THICKNESS, 0);
coinBody.quaternion.set(0, 0, 0, 1);
coinBody.allowSleep = true;

let lastBounceSound = 0;
coinBody.addEventListener("collide", (event: any) => {
  const impact = Math.abs(event.contact.getImpactVelocityAlongNormal());
  const now = performance.now();
  if (impact > 1.2 && now - lastBounceSound > 70) {
    lastBounceSound = now;
    sound.bounce(Math.min(1, impact / 12));
  }
});

type FlipState = "idle" | "flipping" | "settled";
let state: FlipState = "idle";
let simFlightSeconds = 0;
let quietStreak = 0;

// Measured in simulated physics seconds, not wall-clock time: under a slow or
// throttled renderer the physics can fall behind real time, and a wall-clock
// cutoff would force a result while the coin is still mid-tumble.
const MIN_FLIGHT_SEC = 0.5;
const QUIET_STEPS_NEEDED = 30;
const MAX_FLIGHT_SEC = 7.5;

function beginFlip(): void {
  if (state === "flipping") return;
  state = "flipping";
  quietStreak = 0;
  simFlightSeconds = 0;
  hud.setFlipping(true);
  sound.launch();
  launchCoin(coinBody);
}

hud.onFlip(beginFlip);
hud.onReset(() => {
  /* stats already cleared inside Hud; nothing else to reset */
});
hud.onSoundToggle((muted) => {
  sound.muted = muted;
});

// Tap the coin itself to launch it, without hijacking orbit-drag gestures.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos: { x: number; y: number; t: number } | null = null;

canvas.addEventListener("pointerdown", (e) => {
  downPos = { x: e.clientX, y: e.clientY, t: performance.now() };
});

canvas.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos.x;
  const dy = e.clientY - downPos.y;
  const dt = performance.now() - downPos.t;
  downPos = null;
  if (Math.hypot(dx, dy) > 6 || dt > 350) return;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, rig.camera);
  const hits = raycaster.intersectObject(coinMesh, false);
  if (hits.length > 0) beginFlip();
});

const FIXED_DT = 1 / 120;
const MAX_STEPS_PER_FRAME = 10;
let lastFrameTime = performance.now();
let accumulator = 0;

function animate(now: number): void {
  requestAnimationFrame(animate);
  // Advance physics in constant-size fixed steps (matching the parameters this
  // was tuned with) rather than cannon-es's variable-timestep interpolation —
  // under a low render framerate, coarse variable substeps drift from the
  // tuned bounce/settle behaviour and skew the cara/cruz/lado distribution.
  const deltaSec = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;
  accumulator += deltaSec;
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
    world.step(FIXED_DT);
    accumulator -= FIXED_DT;
    steps++;

    if (state === "flipping") {
      simFlightSeconds += FIXED_DT;
      if (simFlightSeconds > MIN_FLIGHT_SEC) {
        if (isCoinQuiet(coinBody)) {
          quietStreak++;
        } else {
          quietStreak = 0;
        }
        if (quietStreak >= QUIET_STEPS_NEEDED || simFlightSeconds > MAX_FLIGHT_SEC) {
          settleFlip();
          break;
        }
      }
    }
  }

  coinMesh.position.set(coinBody.position.x, coinBody.position.y, coinBody.position.z);
  coinMesh.quaternion.set(
    coinBody.quaternion.x,
    coinBody.quaternion.y,
    coinBody.quaternion.z,
    coinBody.quaternion.w
  );

  rig.controls.update();
  rig.renderer.render(rig.scene, rig.camera);
}

function settleFlip(): void {
  state = "settled";
  const result: CoinResult = readCoinResult(coinBody);
  hud.setFlipping(false);
  hud.showResult(result);
  sound.result(result);
  state = "idle";
}

requestAnimationFrame(animate);
