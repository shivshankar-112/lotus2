"use client";

import { useState, useEffect } from "react";
import type { Difficulty, GamePhase } from "@/types/cr2";
import type { ToastMsg } from "@/hooks/useCr2";
import { DIFF_CONFIGS } from "@/lib/cr2Engine";

// ── LiveBar ───────────────────────────────────────────────────────────────────

export function LiveBar() {
  const [liveWin, setLiveWin]     = useState("$0.00");
  const [online, setOnline]       = useState("10 529");

  useEffect(() => {
    const wins = setInterval(() => {
      if (Math.random() < 0.4) {
        const amt = (Math.random() * 500 + 5).toFixed(2);
        setLiveWin(`+$${amt}`);
      }
    }, 2500);

    const cnt = setInterval(() => {
      setOnline((10529 + Math.floor(Math.random() * 20 - 10)).toLocaleString("en-US").replace(/,/g, " "));
    }, 3000);

    return () => { clearInterval(wins); clearInterval(cnt); };
  }, []);

  return (
    <div style={{ background: "#222235", padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "blink 1.2s infinite" }} />
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Live wins:</span>
      <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{liveWin}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>
        Online: <b style={{ color: "rgba(255,255,255,0.6)" }}>{online}</b>
      </span>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

// ── BottomPanel ───────────────────────────────────────────────────────────────

const QUICK_BETS = [2, 3, 8, 20];

interface BottomPanelProps {
  phase: GamePhase;
  bet: number;
  mult: number;
  diff: Difficulty;
  balance: number;
  onGo: () => void;
  onCashOut: () => void;
  onBetChange: (v: number) => void;
  onDiffChange: (d: Difficulty) => void;
}

export function BottomPanel({
  phase, bet, mult, diff, balance,
  onGo, onCashOut, onBetChange, onDiffChange,
}: BottomPanelProps) {
  const disabled = phase !== "idle";
  const payout = (bet * mult).toFixed(2);

  function pct(v: number) { return ((v - 1) / 199 * 100).toFixed(1) + "%"; }

  return (
    <div style={{ background: "#2d2d40", flexShrink: 0, padding: "10px 12px 14px", borderTop: "2px solid #3a3a5e" }}>

      {/* Difficulty */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {(["easy","medium","hard","hardcore"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => !disabled && onDiffChange(d)}
            disabled={disabled}
            style={{
              flex: 1, padding: "6px 4px", borderRadius: 8, border: "none",
              fontSize: 11, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
              transition: "all .15s",
              background: diff === d ? "#ffd700" : "#3a3a5e",
              color: diff === d ? "#1a1000" : "rgba(255,255,255,0.5)",
              opacity: disabled && diff !== d ? 0.5 : 1,
            }}
          >
            {d.charAt(0).toUpperCase() + d.slice(1, 4)}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ background: "#222235", borderRadius: 12, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", width: 28 }}>MIN</span>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="range" min={1} max={200} step={1} value={bet}
            disabled={disabled}
            onChange={(e) => onBetChange(Number(e.target.value))}
            style={{
              width: "100%", WebkitAppearance: "none", height: 4, borderRadius: 2, outline: "none",
              cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
              background: `linear-gradient(to right, #ffd700 ${pct(bet)}, #3a3a5e ${pct(bet)})`,
            }}
          />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", minWidth: 28, textAlign: "center" }}>{bet}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", textAlign: "right", width: 28 }}>MAX</span>
      </div>

      {/* Quick bets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
        {QUICK_BETS.map((q) => (
          <button
            key={q}
            onClick={() => !disabled && onBetChange(q)}
            disabled={disabled}
            style={{
              background: bet === q ? "#4a4a7e" : "#3a3a5e",
              border: "none", borderRadius: 10, padding: "8px 4px",
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{q}</span>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#ffd700,#ff9500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#7a4700" }}>$</div>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* Cash Out */}
        <button
          onClick={onCashOut}
          disabled={phase !== "running"}
          style={{
            background: phase === "running" ? "#ffd700" : "#5a5a3a",
            border: "none", borderRadius: 14, padding: "16px 12px",
            cursor: phase === "running" ? "pointer" : "not-allowed",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: phase === "running" ? "#1a1000" : "#8a8a5a", letterSpacing: ".5px" }}>
            CASH OUT
          </span>
          <span style={{ fontSize: 17, fontWeight: 900, color: phase === "running" ? "#1a1000" : "#8a8a5a" }}>
            ${payout}
          </span>
        </button>

        {/* GO */}
        <button
          onClick={onGo}
          disabled={phase === "dead"}
          style={{
            background: phase === "dead" ? "#2d5a3d" : phase === "running" ? "#16a34a" : "#22c55e",
            border: "none", borderRadius: 14, padding: "16px 12px",
            fontSize: 22, fontWeight: 900, color: phase === "dead" ? "#4a8a5a" : "#fff",
            cursor: phase === "dead" ? "not-allowed" : "pointer",
            letterSpacing: 1, transition: "all .15s",
            boxShadow: phase === "dead" ? "none" : "0 4px 16px rgba(34,197,94,0.35)",
          }}
        >
          {phase === "running" ? "GO →" : "GO"}
        </button>
      </div>
    </div>
  );
}

// ── ToastStack ────────────────────────────────────────────────────────────────

export function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
  if (!toasts.length) return null;
  const t = toasts[toasts.length - 1];
  return (
    <>
      <style>{`@keyframes toast-pop{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <div style={{
        position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)",
        padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700,
        whiteSpace: "nowrap", pointerEvents: "none", zIndex: 50,
        animation: "toast-pop .3s cubic-bezier(.34,1.56,.64,1)",
        background: "rgba(0,0,0,0.88)", color: t.color,
        border: `1px solid ${t.color}55`,
      }}>
        {t.text}
      </div>
    </>
  );
}