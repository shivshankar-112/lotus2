"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, LogOut, Copy, Check, Shield, Star,
  TrendingUp, TrendingDown, Wallet, Clock, ChevronRight,
  Bell, HelpCircle, Lock, Smartphone, Gift
} from "lucide-react";
import type { User, Wallet as WalletInterface } from "@/types/auth";
import { getVipInfo, VIP_LEVELS } from "@/lib/authApi";
import { useRouter } from "next/navigation";

// ── Mock user for preview (replace with real auth context) ────────────────────
const MOCK_USER: User = {
  id: "u_001",
  phone: "9876543210",
  displayName: "Rajesh Kumar",
  avatar: "🎰",
  // balance: 4850.00,
  // totalDeposited: 10000,
  // totalWithdrawn: 3200,
  // totalBets: 312,
  // totalWins: 148,
  // totalLosses: 164,
  // pnl: -1950,
  joinedAt: "2024-03-15T10:30:00Z",
  kycVerified: true,
};

const RECENT_GAMES = [
  { game: "Aviator", result: "win", mult: "3.24x", bet: 100, payout: 324, time: "2m ago" },
  { game: "Heads & Tails", result: "lose", mult: "—", bet: 50, payout: 0, time: "5m ago" },
  { game: "Win Go", result: "win", mult: "2.0x", bet: 200, payout: 400, time: "12m ago" },
  { game: "Aviator", result: "lose", mult: "—", bet: 100, payout: 0, time: "18m ago" },
  { game: "Win Go", result: "win", mult: "4.5x", bet: 50, payout: 225, time: "25m ago" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
        {sub && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 700, color }} className="tabular-nums">
        {value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function MenuRow({ icon, label, value, danger }: {
  icon: React.ReactNode; label: string; value?: string; danger?: boolean;
}) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div style={{ color: danger ? "#ef4444" : "rgba(255,255,255,0.45)", flexShrink: 0 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? "#ef4444" : "#fff", textAlign: "left" }}>
        {label}
      </span>
      {value && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{value}</span>}
      <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
    </button>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────

interface ProfilePageProps {
  wallet?: WalletInterface | null;
  user?: User;
  onLogout?: () => void;
}

export default function ProfilePage({ wallet, user = MOCK_USER, onLogout }: ProfilePageProps) {
  const route = useRouter();
  const maskedPhone = user.phone.replace(/(\d{2})\d{6}(\d{2})/, "$1 ****** $2");
  const joinDate = new Date(user.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b"
        style={{ background: "rgba(8,11,18,0.97)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Home</span>
        </Link>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>Profile</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: "rgba(239,68,68,0.7)" }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* ── Hero card ────────────────────────────────────────────── */}
      <div
        className="mx-4 mt-4 rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a0f00 0%, #0f1117 50%, #0a0c1a 100%)",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        {/* Decorative glow */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "rgba(251,191,36,0.12)", border: "2px solid rgba(251,191,36,0.3)" }}
            >
              {user.avatar}
            </div>
            {user.kycVerified && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#22c55e", border: "2px solid #080b12" }}
              >
                <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 items-center min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-bold text-base truncate">{user.displayName}</h2>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
              📱 +91 {maskedPhone} · Joined {joinDate}
            </p>
          </div>
        </div>

        {/* Balance row */}
        <div
          className="mt-4 flex flex-wrap items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}
        >
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Balance</p>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>
              ₹{wallet?.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || 0}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => route.push("/wallet")}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", boxShadow: "0 2px 12px rgba(34,197,94,0.3)" }}
            >
              Wallet
            </button>
            {/* <button
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
            >
              Withdraw
            </button> */}
          </div>
        </div>
      </div>

    </div>
  );
}

export function WalletProfileSection({ wallet }: { wallet: WalletInterface }) {
  const [activeTab, setActiveTab] = useState<"stats" | "history" | "settings">("stats");
  const winRate = wallet.totalBets > 0
    ? ((wallet.totalWins / wallet.totalBets) * 100).toFixed(1)
    : "0.0";
  return (
    <>
      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div
        className="flex mx-4 mt-4 rounded-2xl p-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {(["stats", "history", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
            style={
              activeTab === tab
                ? { background: "rgba(255,255,255,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }
                : { color: "rgba(255,255,255,0.35)" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Stats tab ────────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="px-4 mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Bets"
              value={wallet.totalBets.toString()}
              icon={<TrendingUp className="w-4 h-4" />}
              color="#7dd3fc"
            />
            <StatCard
              label="Win Rate"
              value={`${winRate}%`}
              sub={`${wallet.totalWins}W / ${wallet.totalLosses}L`}
              icon={<Star className="w-4 h-4" />}
              color="#fbbf24"
            />
            <StatCard
              label="Total Deposited"
              value={`₹${wallet.totalDeposited.toLocaleString("en-IN")}`}
              icon={<Wallet className="w-4 h-4" />}
              color="#4ade80"
            />
            <StatCard
              label="Total Withdrawn"
              value={`₹${wallet.totalWithdrawn.toLocaleString("en-IN")}`}
              icon={<Wallet className="w-4 h-4" />}
              color="#c084fc"
            />
          </div>

          {/* P&L card */}
          {/* <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              background: wallet.pnl >= 0 ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${wallet.pnl >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            <div className="flex items-center gap-2.5">
              {wallet.pnl >= 0
                ? <TrendingUp className="w-5 h-5" style={{ color: "#4ade80" }} />
                : <TrendingDown className="w-5 h-5" style={{ color: "#f87171" }} />
              }
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Overall P&L</span>
            </div>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 20,
                fontWeight: 900,
                color: wallet.pnl >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              {wallet.pnl >= 0 ? "+" : ""}₹{Math.abs(wallet.pnl).toLocaleString("en-IN")}
            </span>
          </div> */}

        </div>
      )}

      {/* ── History tab ──────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="px-4 mt-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {RECENT_GAMES.map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={{ borderBottom: i < RECENT_GAMES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
              >
                {/* Game icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  {g.game === "Aviator" ? "✈️" : g.game === "Heads & Tails" ? "🪙" : "🎯"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{g.game}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    Bet ₹{g.bet} · {g.time}
                  </p>
                </div>
                {g.mult !== "—" && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif" }}>
                    {g.mult}
                  </span>
                )}
                <span
                  className="font-bold text-sm tabular-nums"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 13,
                    color: g.result === "win" ? "#4ade80" : "#f87171",
                  }}
                >
                  {g.result === "win" ? `+₹${g.payout}` : `-₹${g.bet}`}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>
            Showing last 5 rounds
          </p>
        </div>
      )}

      {/* ── Settings tab ─────────────────────────────────────────── */}
      {activeTab === "settings" && ("p"
        // <div className="mt-4 mx-4">
        //   {/* Account section */}
        //   <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, paddingLeft: 4 }}>
        //     Account
        //   </p>
        //   <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
        //     <MenuRow icon={<Smartphone className="w-4 h-4" />} label="Mobile Number" value={`+91 ${maskedPhone}`} />
        //     <MenuRow icon={<Shield className="w-4 h-4" />} label="KYC Verification" value={user.kycVerified ? "✓ Verified" : "Pending"} />
        //     <MenuRow icon={<Lock className="w-4 h-4" />} label="Security & PIN" />
        //   </div>

        //   {/* Preferences */}
        //   <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", margin: "16px 0 8px", paddingLeft: 4 }}>
        //     Preferences
        //   </p>
        //   <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
        //     <MenuRow icon={<Bell className="w-4 h-4" />} label="Notifications" value="On" />
        //     <MenuRow icon={<HelpCircle className="w-4 h-4" />} label="Help & Support" />
        //   </div>

        //   {/* Danger zone */}
        //   <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", margin: "16px 0 8px", paddingLeft: 4 }}>
        //     Account Actions
        //   </p>
        //   <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
        //     <MenuRow icon={<LogOut className="w-4 h-4" />} label="Logout" danger />
        //   </div>
        // </div>
      )}
    </>
  )
}
