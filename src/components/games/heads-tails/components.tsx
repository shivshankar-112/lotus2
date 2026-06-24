// ── BetPanel ─────────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { CoinSide, FlipRecord } from "@/app/(Games)/heads-tails/page";

const QUICK_AMOUNTS = [10, 50, 100, 500];

interface BetPanelProps {
  balance: number;
  flipping: boolean;
  onFlip: (side: CoinSide, amount: number) => void;
}

export function BetPanel({ balance, flipping, onFlip }: BetPanelProps) {
  const [side, setSide] = useState<CoinSide>("heads");
  const [amount, setAmount] = useState(10);

  function handleQuickAmt(a: number) {
    setAmount(Math.min(a, balance));
  }

  const potentialWin = amount * 2;
  const canFlip = !flipping && amount > 0 && amount <= balance;

  return (
    <div className="px-4 pb-4 space-y-4 relative z-10">
      {/* Side selection */}
      <div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Pick your side
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(["heads", "tails"] as CoinSide[]).map((s) => {
            const isH = s === "heads";
            const active = side === s;
            return (
              <button
                key={s}
                disabled={flipping}
                onClick={() => setSide(s)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "14px 8px",
                  borderRadius: 16,
                  border: active
                    ? `2px solid ${isH ? "#f59e0b" : "#9ca3af"}`
                    : "2px solid rgba(255,255,255,0.08)",
                  background: active
                    ? isH ? "rgba(251,191,36,0.08)" : "rgba(156,163,175,0.08)"
                    : "rgba(255,255,255,0.04)",
                  boxShadow: active ? (isH ? "0 0 20px rgba(251,191,36,0.15)" : "0 0 20px rgba(156,163,175,0.1)") : "none",
                  cursor: flipping ? "not-allowed" : "pointer",
                  gap: 4,
                  opacity: flipping ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    fontSize: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isH
                      ? "conic-gradient(from 0deg, #d97706, #fbbf24, #fcd34d, #f59e0b, #d97706)"
                      : "conic-gradient(from 0deg, #6b7280, #d1d5db, #e5e7eb, #9ca3af, #6b7280)",
                    boxShadow: isH
                      ? "inset 2px 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(251,191,36,0.3)"
                      : "inset 2px 2px 4px rgba(255,255,255,0.35), 0 2px 8px rgba(156,163,175,0.2)",
                  }}
                >
                  {isH ? "👑" : "⚡"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: isH ? "#fbbf24" : "#d1d5db" }}>
                  {isH ? "Heads" : "Tails"}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>2× payout</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Bet amount
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              disabled={flipping}
              onClick={() => handleQuickAmt(q)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: amount === q ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
                background: amount === q ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                color: amount === q ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: flipping ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ₹{q}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "0 14px", marginBottom: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>₹</span>
          <input
            type="number"
            value={amount}
            min={1}
            max={balance}
            disabled={flipping}
            onChange={(e) => setAmount(Math.max(1, Math.min(balance, Number(e.target.value))))}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontWeight: 500, padding: "10px 0", fontFamily: "DM Sans, sans-serif" }}
          />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>max ₹{Math.floor(balance)}</span>
        </div>
      </div>

      {/* Potential win */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 12, padding: "10px 14px" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Potential Win</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#4ade80", fontWeight: 700 }}>
          ₹{potentialWin.toFixed(2)}
        </span>
      </div>

      {/* Flip button */}
      <button
        disabled={!canFlip}
        onClick={() => onFlip(side, amount)}
        style={{
          width: "100%",
          padding: 15,
          borderRadius: 16,
          border: "none",
          cursor: canFlip ? "pointer" : "not-allowed",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 1,
          background: canFlip ? "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)" : "#374151",
          color: canFlip ? "#1a0a00" : "rgba(255,255,255,0.3)",
          boxShadow: canFlip ? "0 4px 24px rgba(251,191,36,0.3)" : "none",
          opacity: canFlip ? 1 : 0.6,
          transition: "all 0.2s ease",
        }}
      >
        {flipping ? "⏳ Flipping..." : "🪙 FLIP THE COIN"}
      </button>
    </div>
  );
}


// ── StatsBar ─────────────────────────────────────────────────────────────────
interface StatsBarProps { wins: number; losses: number; pnl: number; }

export function StatsBar({ wins, losses, pnl }: StatsBarProps) {
  const stats = [
    { label: "Wins", value: wins.toString(), color: "#fff" },
    { label: "Losses", value: losses.toString(), color: "#f87171" },
    {
      label: "P&L",
      value: (pnl >= 0 ? "+" : "") + "₹" + Math.abs(pnl).toFixed(2),
      color: pnl >= 0 ? "#4ade80" : "#f87171",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 16px", position: "relative", zIndex: 5 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 10, textAlign: "center" }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}


// ── FlipHistory ───────────────────────────────────────────────────────────────
interface FlipHistoryProps { history: FlipRecord[]; }

export function FlipHistory({ history }: FlipHistoryProps) {
  return (
    <div style={{ padding: "0 16px 24px", position: "relative", zIndex: 5 }}>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
        Flip History
      </p>
      {history.length === 0 ? (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>No flips yet</span>
      ) : (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {history.slice(0, 24).map((r, i) => (
            <div
              key={i}
              title={`${r.result} — ${r.won ? "WIN" : "LOSS"}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                cursor: "default",
                background:
                  r.result === "heads"
                    ? "conic-gradient(from 0deg, #d97706, #fbbf24, #fcd34d, #f59e0b, #d97706)"
                    : "conic-gradient(from 0deg, #6b7280, #d1d5db, #e5e7eb, #9ca3af, #6b7280)",
                color: r.result === "heads" ? "#92400e" : "#374151",
                boxShadow:
                  r.result === "heads"
                    ? "0 0 6px rgba(251,191,36,0.4)"
                    : "0 0 6px rgba(156,163,175,0.3)",
                outline: r.won ? "2px solid rgba(34,197,94,0.5)" : "none",
                transition: "transform 0.2s",
              }}
            >
              {r.result === "heads" ? "H" : "T"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── ParticlesBurst ────────────────────────────────────────────────────────────
interface ParticlesBurstProps { onDone: () => void; }

export function ParticlesBurst({ onDone }: ParticlesBurstProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = ["#fbbf24", "#f59e0b", "#fcd34d", "#4ade80", "#86efac", "#fff"];
  const particles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360 * (Math.PI / 180);
    const dist = 60 + Math.random() * 130;
    const size = 4 + Math.random() * 6;
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - 50,
      size,
      dur: 0.6 + Math.random() * 0.6,
      delay: Math.random() * 0.2,
    };
  });

  return (
    <div style={{ position: "absolute", top: 200, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 100 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            animation: `particle-burst ${p.dur}s ease-out ${p.delay}s forwards`,
            // @ts-ignore
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes particle-burst {
          0% { opacity: 1; transform: translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.1); }
        }
      `}</style>
    </div>
  );
}
