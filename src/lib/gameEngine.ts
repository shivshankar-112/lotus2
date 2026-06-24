import type { ColorChoice, RoundResult, GameConfig } from "@/types/colorGame";

// ─── Config ──────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: GameConfig = {
  roundDuration: 60,
  lockoutSeconds: 5,
  startingBalance: 1000,
  multipliers: {
    red: 2,
    green: 2,
    violet: 4.5,
    big: 2,
    small: 2,
  },
};

// ─── Number → Color mapping (WinGo style) ───────────────────────────────────
// 0 = violet+red, 5 = violet+green, 1,3,7,9 = green, 2,4,6,8 = red

export function numberToColor(n: number): ColorChoice {
  if (n === 0 || n === 5) return "violet";
  if ([1, 3, 7, 9].includes(n)) return "green";
  return "red";
}

export function numberToBigSmall(n: number): "big" | "small" {
  return n >= 5 ? "big" : "small";
}

export function numberToDisplayColors(n: number): string[] {
  if (n === 0) return ["violet", "red"];
  if (n === 5) return ["violet", "green"];
  return [numberToColor(n)];
}

// ─── Round ID generator ──────────────────────────────────────────────────────

export function generateRoundId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(Date.now() / 1000) % 100000;
  return `${date}${String(seq).padStart(5, "0")}`;
}

// ─── Demo RNG result ─────────────────────────────────────────────────────────

export function generateDemoResult(roundId: string): RoundResult {
  const number = Math.floor(Math.random() * 10);
  return {
    roundId,
    number,
    color: numberToColor(number),
    bigSmall: numberToBigSmall(number),
    timestamp: Date.now(),
  };
}

// ─── API adapter (swap demo → real endpoint) ─────────────────────────────────
// Replace this function to connect to your backend.
// Expected response shape: { number: number } or full RoundResult

export async function fetchRoundResult(roundId: string): Promise<RoundResult> {
  // ── DEMO MODE ──────────────────────────────────────────────────────────────
  // Comment out the block below and uncomment the API block to go live.

  await new Promise((r) => setTimeout(r, 600)); // simulate network
  return generateDemoResult(roundId);

  // ── REAL API MODE (uncomment + configure) ─────────────────────────────────
  // const res = await fetch(`/api/color-game/result?roundId=${roundId}`);
  // if (!res.ok) throw new Error("Failed to fetch result");
  // const data = await res.json();
  // return {
  //   roundId,
  //   number: data.number,
  //   color: numberToColor(data.number),
  //   bigSmall: numberToBigSmall(data.number),
  //   timestamp: Date.now(),
  // };
}

// ─── Payout calculator ───────────────────────────────────────────────────────

export function calculatePayout(
  choice: {size:string, number:number, color:ColorChoice},
  result: RoundResult,
  amount: number,
  multipliers: GameConfig["multipliers"]
): { won: boolean; payout: number } {
  let won = false;

  if (choice.color === result.color) {
    won = true;
  } else if (choice.size === result.bigSmall) {
    won = true;
  } else if (
    (choice.color === "red" && result.number === 0) ||
    (choice.color === "green" && result.number === 5)
  ) {
    // 0 is violet+red → red bets get half payout, violet gets full
    won = true;
  }

  const multiplier = 2;
  const payout = won ? amount * multiplier : 0;
  return { won, payout };
}
