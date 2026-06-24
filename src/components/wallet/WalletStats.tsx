"use client";

import { TrendingUp, TrendingDown, Wallet, BarChart2, Target, Trophy } from "lucide-react";
import type { Wallet as WalletType } from "@/types/auth";

interface WalletStatsProps {
  wallet: WalletType;
}

export default function WalletStats({ wallet }: WalletStatsProps) {
  const pnl = wallet.totalWins - wallet.totalLosses;
  const winRate =
    wallet.totalBets > 0
      ? ((wallet.totalWins / wallet.totalBets) * 100).toFixed(1)
      : "0.0";

  const stats = [
    {
      label: "Total Deposited",
      value: `₹${wallet.totalDeposited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "#4ade80",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.18)",
    },
    {
      label: "Total Withdrawn",
      value: `₹${wallet.totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <TrendingDown className="w-4 h-4" />,
      color: "#c084fc",
      bg: "rgba(192,132,252,0.08)",
      border: "rgba(192,132,252,0.18)",
    },
    {
      label: "Total Bets",
      value: wallet.totalBets.toLocaleString("en-IN"),
      icon: <Target className="w-4 h-4" />,
      color: "#7dd3fc",
      bg: "rgba(125,211,252,0.08)",
      border: "rgba(125,211,252,0.18)",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: <Trophy className="w-4 h-4" />,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.18)",
    },
    {
      label: "Total Wins",
      value: wallet.totalWins.toLocaleString("en-IN"),
      icon: <BarChart2 className="w-4 h-4" />,
      color: "#4ade80",
      bg: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.15)",
    },
    {
      label: "Total Losses",
      value: wallet.totalLosses.toLocaleString("en-IN"),
      icon: <BarChart2 className="w-4 h-4" />,
      color: "#f87171",
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.15)",
    },
  ];

  return (
    <div className="px-4 space-y-3">
      {/* P&L highlight card */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: pnl >= 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
          border: `1px solid ${pnl >= 0 ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`,
        }}
      >
        <div className="flex items-center gap-3">
          {pnl >= 0 ? (
            <TrendingUp className="w-5 h-5" style={{ color: "#4ade80" }} />
          ) : (
            <TrendingDown className="w-5 h-5" style={{ color: "#f87171" }} />
          )}
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              Net P&L
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
              Wins − Losses
            </p>
          </div>
        </div>
        <p
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            color: pnl >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-3.5"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <p
              className="tabular-nums font-black"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 16,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 600 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
