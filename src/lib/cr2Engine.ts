import type { DifficultyConfig, Difficulty, ObjectType, RoadObject } from "@/types/cr2";

// ── Difficulty configs ────────────────────────────────────────────────────────

export const DIFF_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy:     { lanes: 30, hitBase: 0.12, multStep: 1.032, label: "EASY · 30 lanes"     },
  medium:   { lanes: 25, hitBase: 0.20, multStep: 1.055, label: "MEDIUM · 25 lanes"   },
  hard:     { lanes: 22, hitBase: 0.30, multStep: 1.085, label: "HARD · 22 lanes"     },
  hardcore: { lanes: 18, hitBase: 0.42, multStep: 1.14,  label: "HARDCORE · 18 lanes" },
};

export const CAR_COLORS = [
  "#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c","#e67e22",
];

export const NUM_COLS = 3;
export const LANE_H   = 90;  // px per lane height

// ── Seeded RNG (deterministic per lane) ──────────────────────────────────────

export function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Lane object type ──────────────────────────────────────────────────────────

export function laneObjectType(lane: number): ObjectType {
  if (lane === 0) return "start";
  const r = seededRand(lane * 137 + 17);
  if (r < 0.18) return "barrier";  // safe zone
  const types: ObjectType[] = ["car","car","truck","bus","manhole","manhole"];
  return types[Math.floor(r * types.length)];
}

// ── Build all road objects for a round ───────────────────────────────────────

let _objId = 0;

export function buildRoadObjects(totalLanes: number, canvasWidth: number): RoadObject[] {
  return Array.from({ length: totalLanes + 3 }, (_, lane) => ({
    lane,
    type: laneObjectType(lane),
    col: Math.floor(seededRand(lane * 73) * NUM_COLS),
    carColor: CAR_COLORS[Math.floor(seededRand(lane * 59) * CAR_COLORS.length)],
    x: seededRand(lane * 97) * canvasWidth,
    speed: (0.5 + seededRand(lane * 41) * 1.2) * (seededRand(lane * 23) < 0.5 ? 1 : -1),
    animOffset: seededRand(lane * 31) * Math.PI * 2,
  }));
}

// ── Hit probability per lane ──────────────────────────────────────────────────

export function hitProbability(diff: Difficulty, lane: number): number {
  const cfg = DIFF_CONFIGS[diff];
  return cfg.hitBase + lane * 0.008;
}

// ── API adapter ───────────────────────────────────────────────────────────────
// Replace demo block to go live.

export async function checkStep(
  lane: number,
  diff: Difficulty
): Promise<{ hit: boolean; isBarrier: boolean }> {
  // DEMO MODE
  await new Promise((r) => setTimeout(r, 30));
  const prob = hitProbability(diff, lane);
  const objType = laneObjectType(lane);
  const isBarrier = objType === "barrier";
  const hit = !isBarrier && Math.random() < prob;
  return { hit, isBarrier };

  // REAL API:
  // const res = await fetch("/api/cr2/step", {
  //   method: "POST",
  //   body: JSON.stringify({ lane, diff }),
  //   headers: { "Content-Type": "application/json" },
  // });
  // return res.json() as Promise<{ hit: boolean; isBarrier: boolean }>;
}

// ── Multiplier helpers ────────────────────────────────────────────────────────

export function nextMult(current: number, diff: Difficulty): number {
  return parseFloat((current * DIFF_CONFIGS[diff].multStep).toFixed(3));
}

// ── Color helpers ─────────────────────────────────────────────────────────────

export function lightenHex(hex: string, amt: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}