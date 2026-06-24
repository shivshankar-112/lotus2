"use client";

import { useEffect } from "react";

import { useAviator } from "@/hooks/useAviator";
import SkyCanvas from "@/components/games/aviator/SkyCanvas";
import MultiplierDisplay from "@/components/games/aviator/MultiplierDisplay";
import BetCard from "@/components/games/aviator/BetCard";
import {
  HistoryRow,
  LivePlayersRow,
  StatsStrip,
  ToastStack,
  useToast,
} from "@/components/games/aviator/AviatorUI";
import { fetchWallet } from "@/app/store/features/walletSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import GameHeader from "@/components/games/shared/Header";

export default function AviatorPage() {
  const {
    state,
    placeBet,
    cashOut,
    updateBetAmount,
    updateAutoCash,
    addFunds,
    registerToast,
  } = useAviator();

  const { toasts, show: showToast } = useToast();

  // Wire toast callback into engine
  useEffect(() => {
    registerToast(showToast);
  }, [registerToast, showToast]);

  const { phase, multiplier, waitLeft, balance, bets, history, wins, losses, pnl, livePlayers } = state;

  // Wallet updation --------------------
  const dispatch = useDispatch<AppDispatch>();
  const { data: wallet, loading, error } = useSelector((state: RootState) => state.wallet)

  useEffect(() => {
    if (wallet) return;
    dispatch(fetchWallet());
  }, [dispatch])
  // useEffect(()=>{})

  // useEffect(() => {
  //   if (!wallet) return;
  //   setStats(s => ({
  //     ...s,
  //     balance: wallet.balance
  //   }))
  // }, [wallet])


  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative"
      style={{ background: "#0a0c14", fontFamily: "'Rajdhani', sans-serif", color: "#fff" }}
    >

      {/* ── Header ─────────────────────────────────────────── */}
      <GameHeader title="AVIATOR" balance={wallet?.balance}/>

      {/* Toast notifications */}
      <div className="relative">
        <ToastStack toasts={toasts} />
      </div>

      {/* ── Sky / Canvas area ───────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 240, background: "#080b18", flexShrink: 0 }}
      >
        <SkyCanvas phase={phase} multiplier={multiplier} crashAt={state.crashAt} />
        <MultiplierDisplay phase={phase} multiplier={multiplier} waitLeft={waitLeft} />
      </div>

      {/* ── History dots ────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <HistoryRow history={history} />
      </div>

      {/* ── Live players ────────────────────────────────────── */}
      <LivePlayersRow players={livePlayers} multiplier={multiplier} />

      {/* ── Bet cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3">
        {([1, 2] as const).map((slot) => (
          <BetCard
            key={slot}
            slot={bets[slot]}
            phase={phase}
            multiplier={multiplier}
            balance={balance}
            onAction={() =>
              phase === "flying" && bets[slot].placed && !bets[slot].cashedOut
                ? cashOut(slot)
                : placeBet(slot)
            }
            onAmountChange={(v) => updateBetAmount(slot, v)}
            onAutoCashChange={(v) => updateAutoCash(slot, v)}
          />
        ))}
      </div>

      {/* Add funds button */}
      <div className="px-4 pb-3">
        <button
          onClick={() => addFunds(500)}
          className="w-full py-2 rounded-xl text-sm font-bold transition-all"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
            color: "#fbbf24",
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          + Add ₹500 Demo Funds
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <StatsStrip wins={wins} losses={losses} pnl={pnl} />

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.3); }
        }
      `}</style>
    </div>
  );
}
