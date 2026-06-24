"use client";

import { cn } from "@/lib/utils";
import type { BetSlot, GamePhase } from "@/types/aviator";

interface BetCardProps {
  slot: BetSlot;
  phase: GamePhase;
  multiplier: number;
  onAction: () => void;
  onAmountChange: (v: number) => void;
  onAutoCashChange: (v: number) => void;
  balance: number;
}

const QUICK_AMTS = [10, 50, 100, 500];

export default function BetCard({
  slot,
  phase,
  multiplier,
  onAction,
  onAmountChange,
  onAutoCashChange,
  balance,
}: BetCardProps) {
  const { placed, cashedOut, amount, autoCash, cashoutMultiplier, payout } = slot;

  // Determine button state
  const btnState: "bet" | "cancel" | "cashout" | "cashed" | "wait" = (() => {
    if (phase === "waiting") return placed ? "cancel" : "bet";
    if (phase === "flying")  return placed && !cashedOut ? "cashout" : cashedOut ? "cashed" : "wait";
    return "wait";
  })();

  const disabled =
    btnState === "wait" ||
    btnState === "cashed" ||
    (btnState === "bet" && (amount < 1 || amount > balance));

  const livePayout = placed && !cashedOut && phase === "flying"
    ? (amount * multiplier).toFixed(2)
    : null;

  // Card accent
  const cardStyle: React.CSSProperties = (() => {
    if (placed && phase === "waiting") return {
      borderColor: "rgba(34,197,94,0.4)",
      background: "rgba(34,197,94,0.05)",
    };
    if (placed && !cashedOut && phase === "flying") return {
      borderColor: "rgba(251,191,36,0.45)",
      background: "rgba(251,191,36,0.06)",
    };
    if (cashedOut) return {
      borderColor: "rgba(34,197,94,0.25)",
      background: "rgba(34,197,94,0.04)",
    };
    return { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" };
  })();

  return (
    <div
      className="rounded-2xl p-3 border transition-all duration-300"
      style={cardStyle}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
          Bet {slot.id}
        </span>
        {cashedOut && cashoutMultiplier && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
            {cashoutMultiplier.toFixed(2)}x ✓
          </span>
        )}
      </div>

      {/* Amount control */}
      <div className="flex items-center gap-1.5 mb-2">
        <button
          onClick={() => onAmountChange(Math.max(1, amount - 10))}
          disabled={phase !== "waiting" || placed}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-all disabled:opacity-30"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
        >
          −
        </button>
        <input
          type="number"
          value={amount}
          min={1}
          disabled={phase !== "waiting" || placed}
          onChange={(e) => onAmountChange(Math.max(1, Math.min(balance, Number(e.target.value) || 1)))}
          className="flex-1 text-center text-sm font-black rounded-lg py-1.5 outline-none disabled:opacity-50 tabular-nums"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontFamily: "'Orbitron', sans-serif",
            minWidth: 0,
          }}
        />
        <button
          onClick={() => onAmountChange(Math.min(balance, amount + 10))}
          disabled={phase !== "waiting" || placed}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-all disabled:opacity-30"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
        >
          +
        </button>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-1 mb-2">
        {QUICK_AMTS.map((q) => (
          <button
            key={q}
            onClick={() => onAmountChange(Math.min(balance, q))}
            disabled={phase !== "waiting" || placed}
            className="flex-1 py-1 rounded-md text-[10px] font-bold transition-all disabled:opacity-30"
            style={{
              background: amount === q ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${amount === q ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: amount === q ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          >
            ₹{q}
          </button>
        ))}
      </div>

      {/* Auto cashout */}
      <div className="flex items-center justify-between mb-2.5">
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Auto cashout</span>
        <input
          type="number"
          placeholder="e.g. 2.0"
          step={0.1}
          min={1.1}
          value={autoCash > 0 ? autoCash : ""}
          disabled={phase !== "waiting" || placed}
          onChange={(e) => onAutoCashChange(parseFloat(e.target.value) || 0)}
          className="w-16 text-center text-xs font-bold rounded-lg py-1 outline-none disabled:opacity-40 tabular-nums"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fbbf24",
            fontFamily: "'Orbitron', sans-serif",
          }}
        />
      </div>

      {/* Live potential win */}
      {livePayout && (
        <div className="mb-2 text-center text-xs font-bold tabular-nums"
          style={{ color: "#fbbf24", fontFamily: "'Orbitron', sans-serif" }}>
          ₹{livePayout}
        </div>
      )}
      {cashedOut && payout && (
        <div className="mb-2 text-center text-xs font-bold tabular-nums"
          style={{ color: "#4ade80", fontFamily: "'Orbitron', sans-serif" }}>
          Won ₹{payout.toFixed(2)}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onAction}
        disabled={disabled}
        className="w-full py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.5px",
          ...btnStyles[btnState],
        }}
      >
        {btnState === "bet"     && `BET ₹${amount}`}
        {btnState === "cancel"  && "CANCEL BET"}
        {btnState === "cashout" && `CASH OUT ₹${livePayout}`}
        {btnState === "cashed"  && "CASHED OUT ✓"}
        {btnState === "wait"    && "NEXT ROUND"}
      </button>
    </div>
  );
}

const btnStyles: Record<string, React.CSSProperties> = {
  bet: {
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "#fff",
    boxShadow: "0 3px 14px rgba(34,197,94,0.3)",
  },
  cancel: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#ef4444",
  },
  cashout: {
    background: "linear-gradient(135deg,#b45309,#f59e0b)",
    color: "#000",
    boxShadow: "0 3px 14px rgba(245,158,11,0.35)",
  },
  cashed: {
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.3)",
    color: "#4ade80",
  },
  wait: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.3)",
  },
};
