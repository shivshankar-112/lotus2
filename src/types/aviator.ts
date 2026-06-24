export type GamePhase = "waiting" | "flying" | "crashed";

export interface BetSlot {
  id: 1 | 2;
  placed: boolean;
  cashedOut: boolean;
  amount: number;
  autoCash: number; // 0 = disabled
  cashoutMultiplier?: number;
  payout?: number;
}

export interface RoundResult {
  crashAt: number;
  timestamp: number;
}

export interface LivePlayer {
  id: string;
  name: string;
  betAmount: number;
  cashedAt?: number;
  payout?: number;
}

export interface GameState {
  currentRoundId?: string;
  phase: GamePhase;
  multiplier: number;
  crashAt: number;
  waitLeft: number;
  balance: number;
  bets: Record<1 | 2, BetSlot>;
  history: RoundResult[];
  wins: number;
  losses: number;
  pnl: number;
  livePlayers: LivePlayer[];
}

export interface GameConfig {
  waitDuration: number;    // seconds before each round
  tickMs: number;          // ms between multiplier updates
  startingBalance: number;
  timeConstant: number;    // controls growth speed (ln curve)
}
