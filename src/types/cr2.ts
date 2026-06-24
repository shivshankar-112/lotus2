export type GamePhase = "idle" | "running" | "dead" | "won";
export type Difficulty = "easy" | "medium" | "hard" | "hardcore";

export type ObjectType = "start" | "barrier" | "car" | "truck" | "bus" | "manhole";

export interface RoadObject {
  lane: number;
  type: ObjectType;
  col: number;           // which column (0..NUM_COLS-1)
  carColor: string;
  x: number;             // horizontal position for moving vehicles
  speed: number;         // px/frame — negative = leftward
  animOffset: number;
}

export interface Particle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface DifficultyConfig {
  lanes: number;
  hitBase: number;       // base hit probability
  multStep: number;      // multiplier growth per lane
  label: string;
}

export interface GameState {
  phase: GamePhase;
  lane: number;
  totalLanes: number;
  bet: number;
  mult: number;
  balance: number;
  diff: Difficulty;
}

export interface RoundRecord {
  lanesReached: number;
  mult: number;
  won: boolean;
  payout: number;
  timestamp: number;
}