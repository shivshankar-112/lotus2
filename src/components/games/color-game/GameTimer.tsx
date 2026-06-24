"use client";

import { cn } from "@/lib/utils";
import type { GamePhase } from "@/types/colorGame";

interface GameTimerProps {
  timeLeft: number;
  totalSeconds: number;
  phase: GamePhase;
  roundId: string;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function GameTimer({ timeLeft, totalSeconds, phase, roundId }: GameTimerProps) {
  const progress = timeLeft / totalSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const isLocked = phase === "locked";
  const isRevealing = phase === "revealing";

  const ringColor =
    timeLeft > 10 ? "#22c55e" : timeLeft > 5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Phase label */}
      <div
        className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full",
          isRevealing
            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
            : isLocked
            ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
            : "bg-green-500/20 text-green-300 border border-green-500/40"
        )}
      >
        {isRevealing ? "Revealing" : isLocked ? "Locked" : "Place Bet"}
      </div>

      {/* SVG ring timer */}
      <div className="relative w-[100px] h-[100px]">
        <svg
          className="absolute inset-0 -rotate-90"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="6"
          />
          {/* Progress */}
          {!isRevealing && (
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease" }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isRevealing ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] text-purple-300 font-medium mt-0.5">wait</span>
            </div>
          ) : (
            <>
              <span
                className={cn(
                  "font-black tabular-nums leading-none",
                  timeLeft <= 5 ? "text-red-400 text-3xl animate-pulse" :
                  timeLeft <= 10 ? "text-amber-400 text-2xl" :
                  "text-white text-2xl"
                )}
              >
                {timeLeft}
              </span>
              <span className="text-white/40 text-[9px] font-medium mt-0.5">seconds</span>
            </>
          )}
        </div>
      </div>

      {/* Round ID */}
      <span className="text-white/30 text-[10px] font-mono">#{roundId.slice(-6)}</span>
    </div>
  );
}
