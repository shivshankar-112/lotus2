"use client";

import { useEffect, useRef, useState } from "react";
import type { RoundResult, LivePlayer } from "@/types/aviator";
import { cn } from "@/lib/utils";

// ── HistoryRow ────────────────────────────────────────────────────────────────

interface HistoryRowProps { history: RoundResult[] }

function crashColor(m: number) {
  if (m < 2)  return { text: "#ef4444", bg: "rgba(239,68,68,0.14)",  border: "rgba(239,68,68,0.3)"  };
  if (m < 5)  return { text: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" };
  return             { text: "#4ade80", bg: "rgba(34,197,94,0.14)",  border: "rgba(34,197,94,0.3)"  };
}

export function HistoryRow({ history }: HistoryRowProps) {
  return (
    <div
      className="flex gap-1.5 items-center overflow-x-auto px-4 py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {history.length === 0 ? (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>No rounds yet</span>
      ) : (
        history.slice(0, 20).map((r, i) => {
          const c = crashColor(r.crashAt);
          return (
            <div
              key={i}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black tabular-nums"
              style={{
                color: c.text,
                background: c.bg,
                border: `1px solid ${c.border}`,
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {r.crashAt.toFixed(2)}x
            </div>
          );
        })
      )}
    </div>
  );
}

// ── LivePlayersRow ─────────────────────────────────────────────────────────────

interface LivePlayersRowProps { players: LivePlayer[]; multiplier: number }

export function LivePlayersRow({ players, multiplier }: LivePlayersRowProps) {
  return (
    <div
      className="flex gap-2 items-center overflow-x-auto px-4 py-2 border-b"
      style={{ scrollbarWidth: "none", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Live
      </span>
      {players.map((p) => (
        <div
          key={p.id}
          className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            background: p.cashedAt ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${p.cashedAt ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>₹{p.betAmount}</span>
          {p.cashedAt ? (
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, fontFamily: "'Orbitron', sans-serif" }}>
              {p.cashedAt.toFixed(2)}x
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>—</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── StatsStrip ────────────────────────────────────────────────────────────────

interface StatsStripProps { wins: number; losses: number; pnl: number }

export function StatsStrip({ wins, losses, pnl }: StatsStripProps) {
  const pnlColor = pnl >= 0 ? "#4ade80" : "#f87171";
  const pnlText  = (pnl >= 0 ? "+₹" : "-₹") + Math.abs(pnl).toFixed(0);

  const stats = [
    { label: "Wins",   value: wins.toString(),   color: "#4ade80" },
    { label: "Losses", value: losses.toString(), color: "#f87171" },
    { label: "P&L",    value: pnlText,           color: pnlColor  },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-1">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl py-2 text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: s.color }}>
            {s.value}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastMsg { id: number; text: string; type: "win" | "lose" | "info" }

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const show = (text: string, type: ToastMsg["type"]) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  };

  return { toasts, show };
}

export function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
  const styles: Record<ToastMsg["type"], React.CSSProperties> = {
    win:  { background: "rgba(34,197,94,0.18)",   border: "1px solid rgba(34,197,94,0.4)",   color: "#4ade80"  },
    lose: { background: "rgba(239,68,68,0.15)",   border: "1px solid rgba(239,68,68,0.35)",  color: "#f87171"  },
    info: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",color: "rgba(255,255,255,0.7)" },
  };

  if (toasts.length === 0) return null;
  const latest = toasts[toasts.length - 1];

  return (
    <div
      className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap pointer-events-none"
      style={{
        ...styles[latest.type],
        animation: "toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`@keyframes toast-in{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      {latest.text}
    </div>
  );
}
