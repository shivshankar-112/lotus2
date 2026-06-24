"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Gamepad2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type TxType = "all" | "deposit" | "withdraw" | "bet" | "win";
type TxStatus = "success" | "pending" | "failed";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  status: TxStatus;
  description: string;
  timestamp: string;
  game?: string;
}

// Mock data — replace with real API
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t001", type: "deposit",  amount: 1000, status: "success", description: "UPI Deposit",         timestamp: "2025-05-15T10:30:00Z" },
  { id: "t002", type: "bet",      amount: 100,  status: "success", description: "Aviator",              timestamp: "2025-05-15T10:35:00Z", game: "Aviator"     },
  { id: "t003", type: "win",      amount: 324,  status: "success", description: "Aviator Win (3.24x)", timestamp: "2025-05-15T10:35:30Z", game: "Aviator"     },
  { id: "t004", type: "bet",      amount: 50,   status: "success", description: "Heads & Tails",        timestamp: "2025-05-15T10:40:00Z", game: "Heads&Tails" },
  { id: "t005", type: "deposit",  amount: 500,  status: "success", description: "Net Banking",          timestamp: "2025-05-15T11:00:00Z" },
  { id: "t006", type: "bet",      amount: 200,  status: "success", description: "Win Go",               timestamp: "2025-05-15T11:10:00Z", game: "WinGo"       },
  { id: "t007", type: "win",      amount: 400,  status: "success", description: "Win Go Win (2.0x)",   timestamp: "2025-05-15T11:10:30Z", game: "WinGo"       },
  { id: "t008", type: "bet",      amount: 100,  status: "success", description: "Aviator",              timestamp: "2025-05-15T11:20:00Z", game: "Aviator"     },
  { id: "t009", type: "withdraw", amount: 500,  status: "pending", description: "UPI Withdrawal",       timestamp: "2025-05-15T11:30:00Z" },
  { id: "t010", type: "bet",      amount: 50,   status: "success", description: "Chicken Road 2",       timestamp: "2025-05-15T11:40:00Z", game: "CR2"         },
  { id: "t011", type: "win",      amount: 173,  status: "success", description: "CR2 Win (3.46x)",     timestamp: "2025-05-15T11:40:20Z", game: "CR2"         },
  { id: "t012", type: "withdraw", amount: 1000, status: "failed",  description: "Bank Transfer",        timestamp: "2025-05-14T09:00:00Z" },
];

const TX_ICONS: Record<string, React.ReactNode> = {
  deposit:  <ArrowDownLeft className="w-4 h-4" />,
  withdraw: <ArrowUpRight className="w-4 h-4" />,
  bet:      <Gamepad2 className="w-4 h-4" />,
  win:      <Trophy className="w-4 h-4" />,
};

const TX_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  deposit:  { text: "#4ade80",  bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)"   },
  withdraw: { text: "#c084fc",  bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.2)" },
  bet:      { text: "#7dd3fc",  bg: "rgba(125,211,252,0.1)", border: "rgba(125,211,252,0.2)" },
  win:      { text: "#fbbf24",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)"  },
};

const STATUS_STYLES: Record<TxStatus, { text: string; bg: string }> = {
  success: { text: "#4ade80", bg: "rgba(34,197,94,0.1)"  },
  pending: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  failed:  { text: "#f87171", bg: "rgba(239,68,68,0.1)"  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const FILTERS: { id: TxType; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "deposit",  label: "Deposits" },
  { id: "withdraw", label: "Withdraws"},
  { id: "bet",      label: "Bets"     },
  { id: "win",      label: "Wins"     },
];

export default function TransactionHistory() {
  const [filter, setFilter] = useState<TxType>("all");

  const filtered = MOCK_TRANSACTIONS.filter(
    (t) => filter === "all" || t.type === filter
  );

  return (
    <div className="px-4 pb-6">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: filter === f.id ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${filter === f.id ? "rgba(251,191,36,0.45)" : "rgba(255,255,255,0.1)"}`,
              color: filter === f.id ? "#fbbf24" : "rgba(255,255,255,0.45)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No transactions found</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {filtered.map((tx, i) => {
            const col   = TX_COLORS[tx.type];
            const sts   = STATUS_STYLES[tx.status];
            const isCredit = tx.type === "deposit" || tx.type === "win";

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}
                >
                  {TX_ICONS[tx.type]}
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>
                    {tx.description}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
                    {formatDate(tx.timestamp)}
                  </p>
                </div>

                {/* Status + Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="font-black text-sm tabular-nums"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 13,
                      color: isCredit ? "#4ade80" : col.text,
                    }}
                  >
                    {isCredit ? "+" : "−"}₹{tx.amount.toFixed(2)}
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sts.bg, color: sts.text }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
