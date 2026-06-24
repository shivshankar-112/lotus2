"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCR2 } from "@/hooks/useCr2";
import CR2Canvas from "@/components/games/cr2/Cr2Canvas";
import { LiveBar, BottomPanel, ToastStack } from "@/components/games/cr2/Cr2Ui";
import { DIFF_CONFIGS } from "@/lib/cr2Engine";

export default function ChickenRoad2Page() {
  const {
    state,
    toasts,
    startRound,
    advanceLane,
    cashOut,
    setDifficulty,
    setBet,
    addFunds,
    onAdvanceRef,
    onDeathRef,
    onWinRef,
    onStartRef,
  } = useCR2();

  const { phase, lane, mult, diff, totalLanes, bet, balance } = state;

  function handleGo() {
    if (phase === "idle")    startRound(bet, diff);
    else if (phase === "running") advanceLane();
  }

  return (
    <div
      style={{
        background: "#1a1a2e",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 420,
        margin: "0 auto",
        fontFamily: "'Arial Rounded MT Bold', Arial, sans-serif",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; user-select: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg,#ffd700,#ff9500);
          border: 2px solid #fff; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,.4);
        }
        input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; }
      `}</style>

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header style={{
        background: "#2a2a3e", padding: "8px 12px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "2px solid #3a3a5e",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <ChevronLeft style={{ color: "rgba(255,255,255,0.5)", width: 18, height: 18 }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Back</span>
        </Link>

        {/* Logo */}
        <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: -0.5, display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ color: "#fff" }}>CHICKEN</span>
          <span style={{ color: "#ff4444", fontSize: 22, lineHeight: 1 }}>2</span>
          <span style={{ color: "#ffd700" }}>ROAD</span>
        </div>

        {/* Balance pill */}
        <div style={{
          background: "#3a3a5e", borderRadius: 20, padding: "5px 12px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {Math.round(balance).toLocaleString("en-US").replace(/,/g, " ")}
          </span>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "linear-gradient(135deg,#ffd700,#ff9500)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#7a4700",
          }}>
            $
          </div>
          <button
            onClick={() => addFunds(1000)}
            style={{
              marginLeft: 4, background: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700",
              fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            +1K
          </button>
        </div>
      </header>

      {/* ── Live Bar ────────────────────────────────────────── */}
      <LiveBar />

      {/* ── Road canvas ─────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#7a7a6a", minHeight: 300 }}>
        <CR2Canvas
          phase={phase}
          lane={lane}
          mult={mult}
          diff={diff}
          totalLanes={totalLanes}
          onAdvanceRef={onAdvanceRef}
          onDeathRef={onDeathRef}
          onWinRef={onWinRef}
          onStartRef={onStartRef}
          onClick={handleGo}
        />

        {/* Difficulty badge */}
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 15,
          background: "rgba(0,0,0,0.65)", borderRadius: 20, padding: "4px 10px",
          fontSize: 11, color: "#ffd700", fontWeight: 700,
          border: "1px solid rgba(255,215,0,0.3)",
        }}>
          {DIFF_CONFIGS[diff].label}
        </div>

        {/* Lane counter (during run) */}
        {phase === "running" && (
          <div style={{
            position: "absolute", top: 10, left: 10, zIndex: 15,
            background: "rgba(0,0,0,0.65)", borderRadius: 20, padding: "4px 10px",
            fontSize: 11, color: "#22c55e", fontWeight: 700,
            border: "1px solid rgba(34,197,94,0.3)",
          }}>
            Lane {lane} / {totalLanes}
          </div>
        )}

        {/* Tap-to-advance hint */}
        {phase === "idle" && (
          <div style={{
            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "5px 16px",
            fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, zIndex: 15,
            border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap",
          }}>
            👆 Tap road or press GO to start
          </div>
        )}

        {/* Toast overlay */}
        <ToastStack toasts={toasts} />
      </div>

      {/* ── Bottom panel ────────────────────────────────────── */}
      <BottomPanel
        phase={phase}
        bet={bet}
        mult={mult}
        diff={diff}
        balance={balance}
        onGo={handleGo}
        onCashOut={cashOut}
        onBetChange={setBet}
        onDiffChange={setDifficulty}
      />
    </div>
  );
}