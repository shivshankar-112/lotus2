"use client";

import { cn } from "@/lib/utils";
import type { RoundResult } from "@/types/colorGame";
import { numberToDisplayColors } from "@/lib/gameEngine";

interface ResultRevealProps {
  result: RoundResult;
  isWin: boolean | null;
  betChoice?: any;
  betAmount?: number;
  payout?: number;
}

const COLOR_STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  red: {
    bg: "from-red-600 to-rose-700",
    text: "text-red-400",
    ring: "ring-red-500",
    label: "RED",
  },
  green: {
    bg: "from-green-600 to-emerald-700",
    text: "text-green-400",
    ring: "ring-green-500",
    label: "GREEN",
  },
  violet: {
    bg: "from-violet-600 to-purple-700",
    text: "text-violet-400",
    ring: "ring-violet-500",
    label: "VIOLET",
  },
};

export default function ResultReveal({ result, isWin, betChoice, betAmount, payout }: ResultRevealProps) {
  const displayColors = [result.color];
  const primaryColor = displayColors[0];
  const style = COLOR_STYLES[primaryColor] ?? COLOR_STYLES.red;
  const hasBet = betChoice != null && betAmount != null;

  return (
    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Number circle */}
      <div className="relative">
        {/* Glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-60 scale-150",
          `bg-gradient-to-br ${style.bg}`
        )} />
        <div className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center",
          `bg-gradient-to-br ${style.bg}`,
          "ring-4", style.ring, "ring-opacity-60",
          "shadow-2xl"
        )}>
          <span className="text-white font-black text-5xl drop-shadow-xl">{result.number}</span>
        </div>

        {/* Dual color dots for 0 and 5 */}
        {displayColors.length > 1 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {displayColors.map((c) => (
              <div
                key={c}
                className={cn(
                  "w-3 h-3 rounded-full border-2 border-[#0f1117]",
                  c === "red" && "bg-red-500",
                  c === "green" && "bg-green-500",
                  c === "violet" && "bg-violet-500"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Color label */}
      <div className="flex items-center gap-2">
        {displayColors.map((c) => (
          <span
            key={c}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
              c === "red" && "bg-red-500/20 text-red-400 border border-red-500/40",
              c === "green" && "bg-green-500/20 text-green-400 border border-green-500/40",
              c === "violet" && "bg-violet-500/20 text-violet-400 border border-violet-500/40"
            )}
          >
            {c}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-white/60 border border-white/10">
          {result.bigSmall}
        </span>
      </div>

      {/* Win / Loss result */}
      {hasBet && isWin !== null && (
        <div className={cn(
          "text-center rounded-2xl px-6 py-3 border",
          isWin
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        )}>
          <p className={cn("font-black text-2xl", isWin ? "text-green-400" : "text-red-400")}>
            {isWin ? `+₹${(payout ?? 0).toFixed(2)}` : `-₹${betAmount?.toFixed(2)}`}
          </p>
          <p className="text-white/50 text-xs mt-0.5">
            {isWin ? "🎉 You Won!" : "Better luck next time"}
          </p>
        </div>
      )}
    </div>
  );
}
