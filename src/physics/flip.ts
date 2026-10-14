import * as CANNON from "cannon-es";
import { COIN_RADIUS, FACE_DOT_THRESHOLD } from "./world";

export type CoinResult = "cara" | "cruz" | "lado";

const upLocal = new CANNON.Vec3(0, 1, 0);
const tmpUpWorld = new CANNON.Vec3();

/** Launches the coin with a randomised upward impulse and tumbling spin. */
export function launchCoin(coinBody: CANNON.Body, rand: () => number = Math.random): void {
  coinBody.wakeUp();
  coinBody.position.set((rand() - 0.5) * 0.4, COIN_RADIUS * 2.6, (rand() - 0.5) * 0.4);
  coinBody.quaternion.setFromEuler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
  coinBody.velocity.setZero();
  coinBody.angularVelocity.setZero();

  const upSpeed = 12 + rand() * 4.5;
  coinBody.velocity.set((rand() - 0.5) * 2.2, upSpeed, (rand() - 0.5) * 2.2);

  const spinAxis = new CANNON.Vec3(rand() - 0.5, (rand() - 0.5) * 0.3, rand() - 0.5);
  spinAxis.normalize();
  const spinMagnitude = 26 + rand() * 16;
  coinBody.angularVelocity.set(
    spinAxis.x * spinMagnitude,
    spinAxis.y * spinMagnitude * 0.4,
    spinAxis.z * spinMagnitude
  );
}

/** Reads the coin's current resting orientation and classifies the outcome. */
export function readCoinResult(coinBody: CANNON.Body): CoinResult {
  coinBody.quaternion.vmult(upLocal, tmpUpWorld);
  const dot = tmpUpWorld.y;
  if (dot > FACE_DOT_THRESHOLD) return "cara";
  if (dot < -FACE_DOT_THRESHOLD) return "cruz";
  return "lado";
}

/** True once the coin's linear and angular speed have stayed low for a few frames. */
export function isCoinQuiet(coinBody: CANNON.Body, linearEps = 0.35, angularEps = 0.35): boolean {
  return coinBody.velocity.length() < linearEps && coinBody.angularVelocity.length() < angularEps;
}
