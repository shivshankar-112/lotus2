"use client";

import type { GamePhase } from "@/types/aviator";
import { multColor } from "@/lib/aviatorEngine";
import { cn } from "@/lib/utils";

interface MultiplierDisplayProps {
  phase: GamePhase;
  multiplier: number;
  waitLeft: number;
}

export default function MultiplierDisplay({ phase, multiplier, waitLeft }: MultiplierDisplayProps) {
  const color = phase === "crashed" ? "#ef4444" : multColor(multiplier);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none">
      {phase === "waiting" ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="text-[11px] font-bold uppercase tracking-[3px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Next round in
          </div>
          <div
            className="font-black leading-none tabular-nums"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 64,
              color: "#fbbf24",
              textShadow: "0 0 40px rgba(251,191,36,0.5)",
            }}
          >
            {waitLeft}
          </div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[2px]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Place your bets
          </div>
        </div>
      ) : phase === "crashed" ? (
        <div className="flex flex-col items-center gap-1 animate-in zoom-in-90 duration-300">
          <div
            className="text-sm font-black uppercase tracking-[4px]"
            style={{ color: "#ef4444" }}
          >
            Flew Away!
          </div>
          <div
            className="font-black leading-none tabular-nums"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 52,
              color: "#ef4444",
              textShadow: "0 0 40px rgba(239,68,68,0.6)",
            }}
          >
            {multiplier.toFixed(2)}x
          </div>
          <div
            className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#4ade80",
              letterSpacing: "1px",
            }}
          >
            Next round in 5s
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "font-black leading-none tabular-nums transition-all duration-150",
              multiplier >= 10 && "animate-pulse"
            )}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: multiplier >= 10 ? 56 : multiplier >= 5 ? 60 : 64,
              color,
              textShadow: `0 0 40px ${color}55`,
            }}
          >
            {multiplier.toFixed(2)}x
          </div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[2px]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Flying...
          </div>
        </div>
      )}
    </div>
  );
}
