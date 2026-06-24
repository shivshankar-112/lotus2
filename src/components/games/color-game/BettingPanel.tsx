"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ColorChoice, GamePhase } from "@/types/colorGame";

interface BettingPanelProps {
  phase: GamePhase;
  balance: number;
  currentBet: { choice: { color: ColorChoice | null, size: "big" | "small" | null, number: number | null }; amount: number } | null;
  onPlaceBet: (choice: { color: ColorChoice | null, size: "big" | "small" | null, number: number | null }, amount: number) => void;
  onCancelBet: () => void;
  multipliers: Record<string, number>;
}

const COLOR_OPTIONS: { value: ColorChoice; label: string; style: string; activeBg: string }[] = [
  {
    value: "red",
    label: "Red",
    style: "border-red-600/60 text-red-400 hover:bg-red-600/10",
    activeBg: "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40",
  },
  {
    value: "violet",
    label: "Violet",
    style: "border-violet-600/60 text-violet-400 hover:bg-violet-600/10",
    activeBg: "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40",
  },
  {
    value: "green",
    label: "Green",
    style: "border-green-600/60 text-green-400 hover:bg-green-600/10",
    activeBg: "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40",
  },
];

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

export default function BettingPanel({
  phase,
  balance,
  currentBet,
  onPlaceBet,
  onCancelBet,
  multipliers,
}: BettingPanelProps) {
  const [selectedColor, setSelectedColor] = useState<ColorChoice | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<"big" | "small" | null>(null);
  const [amount, setAmount] = useState(10);

  const isLocked = phase === "locked" || phase === "revealing" || phase === "result";

  function handleConfirm() {
    if ((!selectedColor && !selectedNumber && !selectedSize) || amount <= 0 || isLocked) return;
    onPlaceBet({ color: selectedColor, size: selectedSize, number: selectedNumber }, amount);
  }

  function handleSelectColor(value:ColorChoice){
    setSelectedNumber(null);
    setSelectedSize(null);
    if(value == selectedColor) return setSelectedColor(null);
    setSelectedColor(value);
  }
  function handleSelectNumber(i:number){
    setSelectedColor(null);
    setSelectedSize(null);
    if(i == selectedNumber) return setSelectedNumber(null);
    setSelectedNumber(i)
  }
  function handleSelectSize(v:"big" | "small"){
    setSelectedColor(null);
    setSelectedNumber(null);
    if(v == selectedSize) return setSelectedSize(null);
    setSelectedSize(v)
  }

  const hasBet = currentBet !== null;

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* ── Color Row ─────────────────────────────────────────── */}
      <div className="pt-4">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Pick Colour</p>
        <div className="grid grid-cols-3 gap-2.5">
          {COLOR_OPTIONS.map(({ value, label, style, activeBg }) => (
            <button
              key={value}
              disabled={isLocked || hasBet}
              onClick={() => handleSelectColor(value)}
              className={cn(
                "relative flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-150 font-bold text-sm gap-0.5",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                selectedColor === value ? activeBg : `bg-white/5 ${style}`
              )}
            >
              {/* Color dot */}
              <div className={cn(
                "w-8 h-8 rounded-full mb-0.5",
                value === "red" && "bg-linear-to-br from-red-500 to-rose-600",
                value === "green" && "bg-linear-to-br from-green-500 to-emerald-600",
                value === "violet" && "bg-linear-to-br from-violet-500 to-purple-600",
              )} />
              <span>{label}</span>
              <span className="text-[10px] font-normal opacity-70">{multipliers[value]}×</span>
            </button>
          ))}
        </div>
      </div>

      {/* ------- Number Row ------------------------------- */}
      <div className="pt-4 space-y-4">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Pick Number</p>
       
        <div className="flex gap-1.5 items-center flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              disabled={isLocked || hasBet}
              onClick={() => handleSelectNumber(i)}
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                selectedNumber === i
                  ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-900/40"
                  : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:border-white/30"
              )}
            >
              {i}
            </button>
          ))}
        </div>
    
      </div>

      {/* ── Big / Small Row ───────────────────────────────────── */}
      <div>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Big / Small</p>
        <div className="grid grid-cols-2 gap-2.5">
          {(["big", "small"] as const).map((v) => (
            <button
              key={v}
              disabled={isLocked || hasBet}
              onClick={() => handleSelectSize(v)}
              className={cn(
                "py-2.5 rounded-2xl border-2 font-bold text-sm transition-all duration-150 capitalize",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                selectedSize === v
                  ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-900/40"
                  : "bg-white/5 border-amber-600/40 text-amber-400 hover:bg-amber-600/10"
              )}
            >
              {v} (5–9 / 0–4)
              <span className="block text-[10px] font-normal opacity-70">{multipliers[v]}×</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Amount ───────────────────────────────────────────── */}
      <div>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Bet Amount</p>
        <div className="flex gap-2 flex-wrap mb-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              disabled={isLocked || hasBet}
              onClick={() => setAmount(q)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                amount === q
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white/60 border-white/15 hover:border-white/30"
              )}
            >
              ₹{q}
            </button>
          ))}
        </div>
        {/* Custom input */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center bg-white/5 border border-white/15 rounded-xl px-3 gap-2">
            <span className="text-white/40 text-sm">₹</span>
            <input
              type="number"
              min={1}
              max={balance}
              value={amount}
              disabled={isLocked || hasBet}
              onChange={(e) => setAmount(Math.max(1, Math.min(balance, Number(e.target.value))))}
              className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none tabular-nums disabled:opacity-40"
            />
            <span className="text-white/30 text-xs">max: {balance}</span>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      {hasBet ? (
        <div className="space-y-2">
          {/* Active bet info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs">Active Bet</p>

              <p className="text-white font-bold capitalize">
                {[
                  currentBet?.choice.color,
                  currentBet?.choice.size,
                  currentBet?.choice.number,
                ]
                  .filter(Boolean)
                  .join(" • ")}{" "}
                — ₹{currentBet?.amount}
              </p>

            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs">Potential Win</p>
              <p className="text-green-400 font-bold">
                ₹{((currentBet?.amount ?? 0) * (2)).toFixed(2)}
              </p>
            </div>
          </div>
          {!isLocked && (
            <button
              onClick={onCancelBet}
              className="w-full py-2 rounded-xl text-sm text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 font-semibold transition-colors"
            >
              Cancel Bet
            </button>
          )}
        </div>
      ) : (
        <Button
          onClick={handleConfirm}
          disabled={(!selectedColor&&!selectedNumber&&!selectedSize) || isLocked || amount <= 0 || amount > balance}
          className="w-full h-12 rounded-2xl font-black text-base bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black disabled:opacity-40 shadow-lg shadow-amber-900/30"
        >
          {isLocked ? "🔒 Bets Locked" : !selectedColor ? "Choose a bet first" : `Confirm Bet · ₹${amount}`}
        </Button>
      )}
    </div>
  );
}
