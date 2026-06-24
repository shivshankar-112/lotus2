import type { GameConfig, LivePlayer, RoundResult } from "@/types/aviator";

// ── Config ────────────────────────────────────────────────────────────────────

export const GAME_CONFIG: GameConfig = {
  waitDuration: 5,
  tickMs: 200,
  startingBalance: 1000,
  timeConstant: 5,
};

// ── Crash point RNG ───────────────────────────────────────────────────────────
// Weighted distribution matching real Aviator feel:
// ~30% crash below 1.5x, ~25% between 1.5-2.5x, ~20% 2.5-5x, ~15% 5-20x, ~10% 20x+

export function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.30) return 1.00 + Math.random() * 0.5;          // 1.0–1.5x
  if (r < 0.55) return 1.5  + Math.random() * 1.0;          // 1.5–2.5x
  if (r < 0.75) return 2.5  + Math.random() * 2.5;          // 2.5–5x
  if (r < 0.88) return 5    + Math.random() * 15;            // 5–20x
  if (r < 0.95) return 20   + Math.random() * 30;            // 20–50x
  return 50 + Math.random() * 150;                           // 50–200x (rare)
}

// ── Multiplier ↔ time conversion ──────────────────────────────────────────────
// mult(t) = e^(t / TC)  →  t(mult) = TC * ln(mult)

export function multAtTime(elapsedSec: number, tc = GAME_CONFIG.timeConstant): number {
  // console.log("Elapsed seconds:", elapsedSec, "Time constant:", tc);
  return Math.exp(elapsedSec / tc);
}

export function timeForMult(mult: number, tc = GAME_CONFIG.timeConstant): number {
  return tc * Math.log(Math.max(mult, 1.001));
}

// ── Multiplier color ──────────────────────────────────────────────────────────

export function multColor(m: number): string {
  if (m < 2)  return "#ffffff";
  if (m < 5)  return "#fbbf24";
  if (m < 10) return "#f97316";
  return "#ef4444";
}

// ── API adapter ───────────────────────────────────────────────────────────────
// Swap demo block → real backend to go live.
// Backend must return: { crashAt: number }

export async function fetchCrashPoint(_roundId: string): Promise<number> {
  // DEMO MODE — remove and uncomment API block below to go live
  // await new Promise((r) => setTimeout(r, 2));
  return generateCrashPoint();

  // REAL API MODE:
  // const res = await fetch(`/api/aviator/crash?round=${_roundId}`);
  // if (!res.ok) throw new Error("API error");
  // const data = await res.json();
  // return data.crashAt as number;
}

// ── Live players simulator ────────────────────────────────────────────────────

const FAKE_NAMES = [
  "Raj***", "Priya**", "Lucky**", "Anon***", "High***",
  "King***", "Spribe*", "Fast***", "Bold***", "Risk***",
];

export function generateLivePlayers(): LivePlayer[] {
  const count = 5 + Math.floor(Math.random() * 6);
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}-${Date.now()}`,
    name: FAKE_NAMES[i % FAKE_NAMES.length],
    betAmount: [10, 25, 50, 100, 200, 500][Math.floor(Math.random() * 6)],
  }));
}

export function simulateCashouts(
  players: LivePlayer[],
  currentMult: number,
  crashAt: number
): LivePlayer[] {
  return players.map((p) => {
    if (p.cashedAt) return p;
    // Random cashout between 1.2x and (crashAt * 0.9)
    const threshold = 1.2 + Math.random() * (crashAt * 0.85 - 1.2);
    if (currentMult >= threshold) {
      return { ...p, cashedAt: currentMult, payout: +(p.betAmount * currentMult).toFixed(2) };
    }
    return p;
  });
}

// ── Round ID ──────────────────────────────────────────────────────────────────

export function newRoundId(): string {
  return `av-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}
