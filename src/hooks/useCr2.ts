"use client";

import { useState, useCallback, useRef } from "react";
import type { GameState, Difficulty, RoundRecord } from "@/types/cr2";
import { DIFF_CONFIGS, checkStep, nextMult } from "@/lib/cr2Engine";

const INITIAL: GameState = {
  phase: "idle",
  lane: 0,
  totalLanes: 30,
  bet: 3,
  mult: 1.0,
  balance: 999994,
  diff: "easy",
};

export type ToastMsg = { id: number; text: string; color: string };
let _tid = 0;

export function useCR2() {
  const [state, setState] = useState<GameState>(INITIAL);
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const stateRef = useRef<GameState>(INITIAL);

  // Callbacks into canvas
  const onAdvanceRef = useRef<(lane: number, isBarrier: boolean) => void>(() => {});
  const onDeathRef   = useRef<() => void>(() => {});
  const onWinRef     = useRef<() => void>(() => {});
  const onStartRef   = useRef<() => void>(() => {});

  const set = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => { const next = fn(prev); stateRef.current = next; return next; });
  }, []);

  function toast(text: string, color: string) {
    const id = ++_tid;
    setToasts((p) => [...p, { id, text, color }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2400);
  }

  // ── Start / GO ──────────────────────────────────────────────────────────────
  const startRound = useCallback((bet: number, diff: Difficulty) => {
    const s = stateRef.current;
    if (s.phase !== "idle") return;
    if (bet < 1 || bet > s.balance) { toast("Invalid bet amount", "#e74c3c"); return; }

    set((prev) => ({
      ...prev,
      phase: "running",
      lane: 0,
      mult: 1.0,
      bet,
      diff,
      totalLanes: DIFF_CONFIGS[diff].lanes,
      balance: +(prev.balance - bet).toFixed(2),
    }));

    onStartRef.current?.();
  }, [set]);

  // ── Advance one lane ────────────────────────────────────────────────────────
  const advanceLane = useCallback(async () => {
    const s = stateRef.current;
    if (s.phase !== "running") return;

    const nextLane = s.lane + 1;
    if (nextLane > s.totalLanes) return;

    const { hit, isBarrier } = await checkStep(nextLane, s.diff);

    if (hit) {
      set((prev) => ({ ...prev, phase: "dead" }));
      onDeathRef.current?.();
      setHistory((h) => [{
        lanesReached: s.lane, mult: s.mult, won: false,
        payout: 0, timestamp: Date.now(),
      }, ...h].slice(0, 50));
      toast(`💥 Got hit! Lost ₹${s.bet.toFixed(2)}`, "#e74c3c");
      setTimeout(() => set((p) => ({ ...p, phase: "idle", lane: 0, mult: 1.0 })), 2600);
      return;
    }

    const newMult = nextMult(s.mult, s.diff);
    set((prev) => ({ ...prev, lane: nextLane, mult: newMult }));
    onAdvanceRef.current?.(nextLane, isBarrier);

    // Reached finish
    if (nextLane >= s.totalLanes) {
      const payout = +(s.bet * newMult).toFixed(2);
      set((prev) => ({
        ...prev, phase: "idle", balance: +(prev.balance + payout).toFixed(2),
        lane: 0, mult: 1.0,
      }));
      onWinRef.current?.();
      setHistory((h) => [{
        lanesReached: nextLane, mult: newMult, won: true,
        payout, timestamp: Date.now(),
      }, ...h].slice(0, 50));
      toast(`🏆 All lanes crossed! +₹${payout.toFixed(2)}`, "#ffd700");
    }
  }, [set]);

  // ── Cash out ────────────────────────────────────────────────────────────────
  const cashOut = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "running" || s.lane === 0) return;

    const payout = +(s.bet * s.mult).toFixed(2);
    set((prev) => ({
      ...prev, phase: "idle",
      balance: +(prev.balance + payout).toFixed(2),
      lane: 0, mult: 1.0,
    }));
    onWinRef.current?.();
    setHistory((h) => [{
      lanesReached: s.lane, mult: s.mult, won: true,
      payout, timestamp: Date.now(),
    }, ...h].slice(0, 50));
    toast(`💰 Cashed out ${s.mult.toFixed(2)}x → +₹${payout.toFixed(2)}`, "#ffd700");
  }, [set]);

  // ── Set difficulty ──────────────────────────────────────────────────────────
  const setDifficulty = useCallback((diff: Difficulty) => {
    if (stateRef.current.phase !== "idle") return;
    set((prev) => ({
      ...prev, diff,
      totalLanes: DIFF_CONFIGS[diff].lanes,
    }));
  }, [set]);

  // ── Set bet ─────────────────────────────────────────────────────────────────
  const setBet = useCallback((bet: number) => {
    set((prev) => ({ ...prev, bet: Math.max(1, Math.min(prev.balance, bet)) }));
  }, [set]);

  // ── Add funds ───────────────────────────────────────────────────────────────
  const addFunds = useCallback((amt: number) => {
    set((prev) => ({ ...prev, balance: +(prev.balance + amt).toFixed(2) }));
  }, [set]);

  return {
    state, history, toasts,
    startRound, advanceLane, cashOut, setDifficulty, setBet, addFunds,
    onAdvanceRef, onDeathRef, onWinRef, onStartRef,
  };
}