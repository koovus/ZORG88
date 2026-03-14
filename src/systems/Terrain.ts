export interface TerrainPoint {
  x: number;
  y: number;
}

export interface LandingZone {
  x: number;
  width: number;
  y: number;
  score: number;
  label: string;
  color: string;
  used: boolean;
}

const W = 1024;
const H = 768;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function generateTerrain(seed: number): { points: TerrainPoint[]; zones: LandingZone[] } {
  const rng = seededRand(seed);

  const NUM_SEGS = 48;
  const segW = W / NUM_SEGS;
  const baseY = H - 80;

  const heights: number[] = [];
  let h = baseY;
  for (let i = 0; i <= NUM_SEGS; i++) {
    h += (rng() - 0.5) * 50;
    h = Math.max(H - 280, Math.min(H - 50, h));
    heights.push(h);
  }

  const zones: LandingZone[] = [
    { x: 0, width: 90, y: 0, score: 200, label: 'A', color: '#00ff88', used: false },
    { x: 0, width: 70, y: 0, score: 400, label: 'B', color: '#ffcc00', used: false },
    { x: 0, width: 55, y: 0, score: 600, label: 'C', color: '#ff4444', used: false },
  ];

  const positions = [
    Math.floor(NUM_SEGS * 0.18),
    Math.floor(NUM_SEGS * 0.50),
    Math.floor(NUM_SEGS * 0.78),
  ];

  for (let z = 0; z < 3; z++) {
    const si = positions[z];
    const zoneWidthSegs = Math.ceil(zones[z].width / segW);
    const flatY = heights[si];
    const startX = si * segW;
    zones[z].x = startX;
    zones[z].y = flatY;
    for (let k = si; k <= si + zoneWidthSegs && k <= NUM_SEGS; k++) {
      heights[k] = flatY;
    }
    const zoneEndSeg = si + zoneWidthSegs;
    if (zoneEndSeg < NUM_SEGS) {
      let nextH = heights[Math.min(zoneEndSeg + 3, NUM_SEGS)];
      nextH = Math.max(H - 280, Math.min(H - 50, nextH));
      for (let k = zoneEndSeg; k < Math.min(zoneEndSeg + 4, NUM_SEGS + 1); k++) {
        const t = (k - zoneEndSeg) / 4;
        heights[k] = lerp(flatY, nextH, t);
      }
    }
  }

  const smooth = [...heights];
  for (let i = 1; i < heights.length - 1; i++) {
    smooth[i] = (heights[i - 1] + heights[i] * 2 + heights[i + 1]) / 4;
  }
  for (let z = 0; z < 3; z++) {
    const si = positions[z];
    const zoneWidthSegs = Math.ceil(zones[z].width / segW);
    for (let k = si; k <= si + zoneWidthSegs && k <= NUM_SEGS; k++) {
      smooth[k] = zones[z].y;
    }
  }

  const points: TerrainPoint[] = [];
  for (let i = 0; i <= NUM_SEGS; i++) {
    points.push({ x: i * segW, y: smooth[i] });
  }

  return { points, zones };
}

export function getTerrainY(points: TerrainPoint[], x: number): number {
  const segW = W / (points.length - 1);
  const si = Math.floor(x / segW);
  if (si < 0) return points[0].y;
  if (si >= points.length - 1) return points[points.length - 1].y;
  const t = (x - si * segW) / segW;
  return lerp(points[si].y, points[si + 1].y, t);
}

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  points: TerrainPoint[],
  zones: LandingZone[]
): void {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(0, H);
  for (const p of points) {
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, H - 280, 0, H);
  grad.addColorStop(0, '#3a2a1a');
  grad.addColorStop(1, '#1a1008');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (const zone of zones) {
    if (zone.used) continue;
    const x1 = zone.x;
    const x2 = zone.x + zone.width;
    const y = zone.y;

    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    const dotSpacing = 12;
    ctx.fillStyle = zone.color;
    for (let dx = x1 + 6; dx < x2 - 4; dx += dotSpacing) {
      ctx.beginPath();
      ctx.arc(dx, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = zone.color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${zone.label} ${zone.score}`, (x1 + x2) / 2, y - 10);
  }

  ctx.restore();
}

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
