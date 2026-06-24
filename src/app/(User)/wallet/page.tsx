"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, RefreshCw, Wallet } from "lucide-react";

import type { AppDispatch, RootState } from "@/app/store/store";
import { fetchWallet } from "@/app/store/features/walletSlice";

import WalletStats from "@/components/wallet/WalletStats";
import DepositPanel from "@/components/wallet/DepositPanel";
import WithdrawPanel from "@/components/wallet/WithdrawPanel";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import WalletSkeleton from "@/components/wallet/WalletSkeleton";
import { DEPOSIT } from "@/lib/APIROTES";
import axios from "axios";
import { useRequestWithdrawMutation } from "@/app/store/apis/withdrawlsSlice";
import { useRouter } from "next/navigation";

type Tab = "overview" | "deposit" | "withdraw" | "history";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "📊" },
  { id: "deposit", label: "Deposit", emoji: "💳" },
  { id: "withdraw", label: "Withdraw", emoji: "🏦" },
  { id: "history", label: "History", emoji: "📋" },
];

export default function WalletPage() {
  const [requestWithdraw] = useRequestWithdrawMutation();

  const route = useRouter()

  const dispatch = useDispatch<AppDispatch>();
  const { data: wallet, loading, error } = useSelector((state: RootState) => state.wallet);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const goBack = () => {
    route.back();
  }
  // Fetch wallet on mount
  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  function handleRefresh() {
    dispatch(fetchWallet());
  }

  async function handleDeposit(amount: number, method: any, accountDetails?: any): Promise<void> {
    try {
      return await axios.post(DEPOSIT, { amount, method, accountDetails }, { withCredentials: true })
    } catch (error: any) {
      console.log("Deposit failed:", error);
      throw new Error(error.response?.data?.message || "Deposit failed. Please try again."); // re-throw to let the DepositPanel know about the failure
    }
  }

  async function handleWithdraw(amount: number, method: "bank" | "upi", accountDetails?: any) {
    try {
      console.log("Initiating withdraw request with data:", { amount, method, accountDetails });
      
      const res = await requestWithdraw({amount, method, accountDetails}).unwrap();

      console.log("Withdraw request sent, awaiting response...", res);
    } catch (error: any) {
      console.log("Withdrawl failed", error);
      throw new Error(error.data?.message || "Withdrawl failed. Please try again.");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{
        background: "#080b12",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { display: none; }
      `}</style>



      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b"
        style={{
          background: "rgba(8,11,18,0.97)",
          backdropFilter: "blur(10px)",
          borderColor: "rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <a
          onClick={goBack}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back</span>
        </a>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}
          >
            <Wallet className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
          </div>
          <span
            className="font-black text-base"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "#fbbf24" }}
          >
            Wallet
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-xl transition-all disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          title="Refresh wallet"
        >
          <RefreshCw
            className="w-4 h-4"
            style={{
              color: "rgba(255,255,255,0.5)",
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </header>



      {/* ── Balance Hero Card ────────────────────────────────────── */}
      {wallet && !loading && (
        <div className="px-4 pt-4 pb-2 mt-4">
          <div
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#1a0f00 0%,#0f1117 55%,#0a0c1a 100%)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            {/* Glow decoration */}
            <div
              style={{
                position: "absolute", top: -40, right: -40,
                width: 150, height: 150, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(251,191,36,0.1) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute", bottom: -30, left: -30,
                width: 120, height: 120, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(34,197,94,0.07) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div className="relative z-10">
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>
                Available Balance
              </p>
              <p
                className="tabular-nums font-black mt-1.5 mb-4"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 34, color: "#fbbf24", lineHeight: 1 }}
              >
                ₹{wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveTab("deposit")}
                  className="py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg,#16a34a,#22c55e)",
                    color: "#fff",
                    boxShadow: "0 3px 12px rgba(34,197,94,0.28)",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.5px",
                  }}
                >
                  + DEPOSIT
                </button>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  className="py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "#fff",
                    boxShadow: "0 3px 12px rgba(168,85,247,0.25)",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.5px",
                  }}
                >
                  − WITHDRAW
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div
        className="flex mx-4 mt-3 rounded-2xl p-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
            style={
              activeTab === tab.id
                ? {
                  background: "rgba(251,191,36,0.12)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251,191,36,0.25)",
                }
                : { color: "rgba(255,255,255,0.35)" }
            }
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto mt-3 pb-8">

        {/* Loading state */}
        {loading && <WalletSkeleton />}

        {/* Error state */}
        {!loading && error && (
          <div className="px-4 py-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold mb-1" style={{ color: "#f87171" }}>Failed to load wallet</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Wallet data tabs */}
        {!loading && !error && wallet && (
          <>
            {activeTab === "overview" && <WalletStats wallet={wallet} />}

            {activeTab === "deposit" && (
              <DepositPanel balance={wallet.balance} onDeposit={handleDeposit} />
            )}

            {activeTab === "withdraw" && (
              <WithdrawPanel onWithdraw={handleWithdraw} balance={wallet.balance} />
            )}

            {activeTab === "history" && <TransactionHistory />}
          </>
        )}

        {/* Empty state — no wallet yet */}
        {!loading && !error && !wallet && (
          <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
            >
              <Wallet className="w-7 h-7" style={{ color: "#fbbf24" }} />
            </div>
            <p className="font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>No wallet data</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Please log in to view your wallet
            </p>
            <Link
              href="/auth"
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: "linear-gradient(135deg,#d97706,#fbbf24)",
                color: "#1a0a00",
                textDecoration: "none",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 11,
                letterSpacing: "0.5px",
              }}
            >
              LOG IN
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
