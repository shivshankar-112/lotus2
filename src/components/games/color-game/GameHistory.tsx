"use client";

import { cn } from "@/lib/utils";
import type { RoundResult } from "@/types/colorGame";
import { numberToDisplayColors } from "@/lib/gameEngine";
import { useState } from "react";

interface GameHistoryProps {
  history: RoundResult[];
}

const DOT_COLORS: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  violet: "bg-violet-500",
};

function ColorDot({ color, number }: { number: number, color: "red" | "green" | "violet" }) {
  return (
    <div className={cn(
      "w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[11px] shadow-md shrink-0",
      color === "red" && "bg-linear-to-br from-red-500 to-rose-600",
      color === "green" && "bg-linear-to-br from-green-500 to-emerald-600",
      color === "violet" && "bg-linear-to-br from-violet-500 to-purple-600",
    )}>
      {number}
    </div>
  );
}


export default function GameHistory({ history }: GameHistoryProps) {
  const [tab, setTab] = useState<"dots" | "table">("dots");

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">Game History</h3>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(["dots", "table"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize",
                tab === t ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "dots" ? (
        /* Dot grid */
        <div className="flex flex-wrap gap-2">
          {history.length === 0 ? (
            <p className="text-white/30 text-sm w-full text-center py-4">No rounds yet</p>
          ) : (
            history.slice(0, 30).map((r, i) => {
              console.log("Loka lu ", r)
              return (
                <ColorDot key={i} number={r.number} color={r.color} />
              )
            })
          )}
        </div>
      ) : (
        /* Table */
        <div className="rounded-xl overflow-hidden border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 text-white/40 text-left">
                <th className="px-3 py-2 font-semibold">Round</th>
                <th className="px-3 py-2 font-semibold">Num</th>
                <th className="px-3 py-2 font-semibold">Color</th>
                <th className="px-3 py-2 font-semibold">B/S</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-white/30">No rounds yet</td>
                </tr>
              ) : (
                history.slice(0, 15).map((r, i) => (
                  <tr
                    key={i}
                    className={cn("border-t border-white/5", i === 0 && "bg-white/5")}
                  >
                    <td className="px-3 py-2 text-white/40 font-mono">#{r.roundId?.slice(-5)}</td>
                    <td className="px-3 py-2">
                      <span className="text-white font-bold">{r.number}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-semibold uppercase text-[10px]",
                        r.color === "red" && "bg-red-500/20 text-red-400",
                        r.color === "green" && "bg-green-500/20 text-green-400",
                        r.color === "violet" && "bg-violet-500/20 text-violet-400",
                      )}>
                        {r.color}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white/60 capitalize">{r.bigSmall}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
