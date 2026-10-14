import * as CANNON from "cannon-es";

export const COIN_RADIUS = 1.15;
export const COIN_HALF_THICKNESS = 0.135;
export const FACE_DOT_THRESHOLD = 0.78;

const GRAVITY_Y = -21.6;

export interface PhysicsWorld {
  world: CANNON.World;
  coinBody: CANNON.Body;
  groundBody: CANNON.Body;
}

export function createPhysicsWorld(): PhysicsWorld {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, GRAVITY_Y, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  (world.solver as CANNON.GSSolver).iterations = 14;

  const groundMaterial = new CANNON.Material("ground");
  const coinMaterial = new CANNON.Material("coin");

  world.addContactMaterial(
    new CANNON.ContactMaterial(groundMaterial, coinMaterial, {
      friction: 0.9,
      restitution: 0.08,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
    })
  );

  const groundBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    shape: new CANNON.Plane(),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  const coinShape = new CANNON.Cylinder(COIN_RADIUS, COIN_RADIUS, COIN_HALF_THICKNESS * 2, 32);
  const coinBody = new CANNON.Body({
    mass: 1,
    material: coinMaterial,
    shape: coinShape,
    linearDamping: 0.25,
    angularDamping: 0.55,
    allowSleep: true,
    sleepSpeedLimit: 0.12,
    sleepTimeLimit: 0.35,
  });
  coinBody.position.set(0, COIN_RADIUS * 3, 0);
  world.addBody(coinBody);

  return { world, coinBody, groundBody };
}
