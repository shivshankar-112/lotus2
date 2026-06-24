"use client";

import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const JACKPOTS = [
  { name: "Mega Jackpot", amount: 1482950.75, color: "from-yellow-500 to-orange-500" },
  { name: "Major", amount: 284531.20, color: "from-purple-500 to-pink-500" },
  { name: "Minor", amount: 12480.60, color: "from-blue-500 to-cyan-500" },
];

function formatAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function JackpotBanner() {
  const [amounts, setAmounts] = useState(JACKPOTS.map((j) => j.amount));

  // Simulate live ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setAmounts((prev) =>
        prev.map((a, i) => a + Math.random() * (i === 0 ? 2.5 : i === 1 ? 0.8 : 0.2))
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-base">Casino Jackpots</h3>
        <button className="flex items-center gap-0.5 text-[#f5a623] text-sm font-semibold">
          See All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jackpot Cards */}
      <div className="space-y-2">
        {JACKPOTS.map((jackpot, i) => (
          <div
            key={jackpot.name}
            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${jackpot.color} shadow-lg`} />
              <span className="text-white/70 text-sm font-medium">{jackpot.name}</span>
            </div>
            <span
              className={`font-black text-base bg-gradient-to-r ${jackpot.color} bg-clip-text text-transparent tabular-nums`}
            >
              ${formatAmount(amounts[i])}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
