"use client";

import { cn } from "@/lib/utils";
import type { Bet } from "@/types/colorGame";

interface MyBetsProps {
  bets: Bet[];
}

export default function MyBets({ bets }: MyBetsProps) {
  if (bets.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-white/30 text-sm">No bets placed yet</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <h3 className="text-white font-bold text-sm mb-3">My Bets</h3>
      <div className="space-y-2">
        {bets.slice(0, 20).map((bet, i) => (
          <div
            key={bet.id+i}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5 border",
              bet.status === "won"
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                bet.status === "won" ? "bg-green-500" : "bg-red-500"
              )} />
              <div>
                <p className="text-white text-xs font-semibold capitalize">{bet.choice.color}</p>
                <p className="text-white/40 text-[10px] font-mono">#{bet.roundId.slice(-5)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-bold text-sm",
                bet.status === "won" ? "text-green-400" : "text-red-400"
              )}>
                {bet.status === "won" ? `+₹${bet.payout.toFixed(2)}` : `-₹${bet.amount.toFixed(2)}`}
              </p>
              <p className="text-white/30 text-[10px]">bet ₹{bet.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
