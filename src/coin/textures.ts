import * as THREE from "three";

/**
 * Cylinder cap UVs in three.js are an orthographic (top-down) projection of the
 * disc, not a polar unwrap — so a face drawn as a normal 2D circular icon lines
 * up perfectly with no distortion.
 */
function makeCanvas(size = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  return { canvas, ctx };
}

function paintMetalBase(ctx: CanvasRenderingContext2D, size: number): void {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const grad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.38, r * 0.08, cx, cy, r);
  grad.addColorStop(0, "#fff6d6");
  grad.addColorStop(0.32, "#f3d477");
  grad.addColorStop(0.68, "#c69a3c");
  grad.addColorStop(1, "#815f18");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(90, 62, 12, 0.55)";
  ctx.lineWidth = size * 0.016;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.985, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(80, 55, 10, 0.5)";
  ctx.lineWidth = size * 0.014;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 246, 210, 0.55)";
  ctx.lineWidth = size * 0.007;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.83, 0, Math.PI * 2);
  ctx.stroke();

  const ticks = 60;
  ctx.strokeStyle = "rgba(80, 55, 10, 0.38)";
  ctx.lineWidth = size * 0.005;
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2;
    const r1 = r * 0.93;
    const r2 = r * 0.975;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
}

function drawSunburst(ctx: CanvasRenderingContext2D, size: number): void {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.4;
  const inner = size * 0.175;
  const points = 9;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outer : inner;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(0, 0, inner * 0.2, 0, 0, outer);
  grad.addColorStop(0, "#4a3308");
  grad.addColorStop(1, "#2c1f04");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 246, 210, 0.6)";
  ctx.lineWidth = size * 0.006;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, inner * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 246, 210, 0.85)";
  ctx.fill();
  ctx.restore();
}

function drawCompassDiamond(ctx: CanvasRenderingContext2D, size: number): void {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.4;
  const inner = size * 0.15;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = "#3a2807";
  ctx.strokeStyle = "rgba(255, 246, 210, 0.6)";
  ctx.lineWidth = size * 0.006;

  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 2) * i);
    ctx.beginPath();
    ctx.moveTo(0, -outer);
    ctx.lineTo(outer * 0.16, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, inner);
  grad.addColorStop(0, "#fff6d6");
  grad.addColorStop(1, "rgba(255, 246, 210, 0.7)");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 62, 12, 0.5)";
  ctx.lineWidth = size * 0.005;
  ctx.stroke();

  ctx.restore();
}

export function createFaceTexture(symbol: "cara" | "cruz"): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512);
  paintMetalBase(ctx, canvas.width);
  if (symbol === "cara") drawSunburst(ctx, canvas.width);
  else drawCompassDiamond(ctx, canvas.width);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createEdgeTexture(): THREE.CanvasTexture {
  const width = 256;
  const height = 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#8a6a26");
  grad.addColorStop(0.5, "#caa04a");
  grad.addColorStop(1, "#7a5c1f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const reedCount = 90;
  const reedWidth = width / reedCount;
  for (let i = 0; i < reedCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)";
    ctx.fillRect(i * reedWidth, 0, reedWidth * 0.5, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(6, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
