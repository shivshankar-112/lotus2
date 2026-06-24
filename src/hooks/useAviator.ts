"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, BetSlot } from "@/types/aviator";
import {
  GAME_CONFIG,
  fetchCrashPoint,
  multAtTime,
  generateLivePlayers,
  simulateCashouts,
  newRoundId,
} from "@/lib/aviatorEngine";

import { socket } from "@/lib/socket";
import { usePlaceBetMutation } from "@/app/store/apis/games/aviatorGameSlice";
import { useCashoutMutation } from "@/app/store/apis/games/aviatorGameSlice";
// ── Initial state ─────────────────────────────────────────────────────────────

function makeBet(id: 1 | 2, amount: number): BetSlot {
  return { id, placed: false, cashedOut: false, amount, autoCash: 0 };
}

const INITIAL: GameState = {
  phase: "waiting",
  multiplier: 1.0,
  crashAt: 2.0,
  waitLeft: GAME_CONFIG.waitDuration,
  balance: GAME_CONFIG.startingBalance,
  bets: { 1: makeBet(1, 50), 2: makeBet(2, 100) },
  history: [],
  wins: 0,
  losses: 0,
  pnl: 0,
  livePlayers: generateLivePlayers(),
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAviator() {
  const [state, setState] = useState<GameState>(INITIAL);
  const stateRef = useRef<GameState>(INITIAL);

  // Keep ref in sync so callbacks always see latest state
  const set = useCallback((updater: (s: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const flyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const roundIdRef = useRef<string>("");

  // Notification callback (set by consumer)
  const onToastRef = useRef<(msg: string, type: "win" | "lose" | "info") => void>(() => { });
  const registerToast = useCallback(
    (fn: (msg: string, type: "win" | "lose" | "info") => void) => {
      onToastRef.current = fn;
    },
    []
  );



  const [placeBetApi] = usePlaceBetMutation();
  const [cashoutApi] = useCashoutMutation();

  useEffect(() => {
    socket.on("aviator:new-round", (round) => {

      roundIdRef.current = round._id;

      set((prev) => ({
        ...prev,
        phase: "waiting",
        multiplier: 1,
        crashAt: 0, // hidden from client
        waitLeft: GAME_CONFIG.waitDuration,

        bets: {
          1: { ...prev.bets[1], placed: false, cashedOut: false, cashoutMultiplier: undefined },
          2: { ...prev.bets[2], placed: false, cashedOut: false, cashoutMultiplier: undefined },
        },

        livePlayers: generateLivePlayers(),
      }));

      waiting();
    });

    socket.on(
      "aviator:update",
      ({ multiplier }) => {
        set((prev) => ({
          ...prev,
          phase: "flying",
          multiplier,
        }));
      }
    );

    socket.on(
      "aviator:crash",
      ({ multiplier }) => {
        set((prev) => ({
          ...prev,
          phase: "crashed",
          multiplier,
          history: [
            {
              crashAt: multiplier,
              timestamp: Date.now(),
            },
            ...prev.history,
          ].slice(0, 50),
        }));
      }
    );

    return () => {
      socket.off("aviator:new-round");
      socket.off("aviator:multiplier");
      socket.off("aviator:crash");
    };
  }, [set]);

  const placeBet = useCallback(
    async (slot: 1 | 2) => {
      const s = stateRef.current;
      const bet = s.bets[slot];

      try {
        await placeBetApi({
          amount: bet.amount,
        }).unwrap();

        set((prev) => ({
          ...prev,
          bets: {
            ...prev.bets,
            [slot]: {
              ...prev.bets[slot],
              placed: true,
            },
          },
        }));

        onToastRef.current(
          "Bet placed",
          "win"
        );
      } catch (err) {
        onToastRef.current(
          "Failed to place bet",
          "lose"
        );
      }
    },
    [placeBetApi, set]
  );
  const cashOut = useCallback(
    async (slot: 1 | 2) => {
      try {
        await cashoutApi({
          roundId: roundIdRef.current,
        }).unwrap();

        set((prev) => ({
          ...prev,
          bets: {
            ...prev.bets,
            [slot]: {
              ...prev.bets[slot],
              cashedOut: true,
            },
          },
        }));
      } catch {
        onToastRef.current(
          "Cashout failed",
          "lose"
        );
      }
    },
    [cashoutApi, set]
  );

  const waiting = useCallback(async () => {

    console.log("from start waiting")

    if (waitTimerRef.current) {
      clearInterval(waitTimerRef.current);
    }
    waitTimerRef.current = setInterval(() => {
      const current = stateRef.current;
      if (current.waitLeft <= 1) {
        clearInterval(waitTimerRef.current!);

        console.log("stopped");

        set((prev) => ({
          ...prev,
          waitLeft: 0,
        }));

        return;
      }

      set((prev) => {
        return { ...prev, waitLeft: prev.waitLeft - 1 };
      });
    }, 2000);
  }, [set]);




  

  // ── Cashout ────────────────────────────────────────────────────────────────

  // const cashOut = useCallback((slot: 1 | 2) => {
  //   const s = stateRef.current;
  //   const bet = s.bets[slot];
  //   if (s.phase !== "flying" || !bet.placed || bet.cashedOut) return;

  //   const mult = s.multiplier;
  //   const payout = +(bet.amount * mult).toFixed(2);
  //   const profit = +(payout - bet.amount).toFixed(2);

  //   set((prev) => ({
  //     ...prev,
  //     balance: +(prev.balance + payout).toFixed(2),
  //     wins: prev.wins + 1,
  //     pnl: +(prev.pnl + profit).toFixed(2),
  //     bets: {
  //       ...prev.bets,
  //       [slot]: { ...prev.bets[slot], cashedOut: true, cashoutMultiplier: mult, payout },
  //     },
  //   }));

  //   onToastRef.current(`Cashed out ${mult.toFixed(2)}x → +₹${payout.toFixed(2)}`, "win");
  // }, [set]);

  // ── Place / cancel bet ─────────────────────────────────────────────────────

  // const placeBet = useCallback((slot: 1 | 2) => {
  //   const s = stateRef.current;
  //   if (s.phase !== "waiting") return;
  //   const bet = s.bets[slot];
  //   if (bet.placed) {
  //     set((prev) => ({
  //       ...prev,
  //       bets: { ...prev.bets, [slot]: { ...prev.bets[slot], placed: false } },
  //     }));
  //     onToastRef.current("Bet cancelled", "info");
  //   } else {
  //     if (bet.amount < 1 || bet.amount > s.balance) {
  //       onToastRef.current("Invalid amount", "lose");
  //       return;
  //     }
  //     set((prev) => ({
  //       ...prev,
  //       bets: { ...prev.bets, [slot]: { ...prev.bets[slot], placed: true } },
  //     }));
  //     onToastRef.current(`Bet ₹${bet.amount} placed`, "win");
  //   }
  // }, [set]);

  const updateBetAmount = useCallback((slot: 1 | 2, amount: number) => {
    set((prev) => ({
      ...prev,
      bets: { ...prev.bets, [slot]: { ...prev.bets[slot], amount } },
    }));
  }, [set]);

  const updateAutoCash = useCallback((slot: 1 | 2, autoCash: number) => {
    set((prev) => ({
      ...prev,
      bets: { ...prev.bets, [slot]: { ...prev.bets[slot], autoCash } },
    }));
  }, [set]);

  // ── Add funds ──────────────────────────────────────────────────────────────

  const addFunds = useCallback((amount: number) => {
    set((prev) => ({ ...prev, balance: +(prev.balance + amount).toFixed(2) }));
    onToastRef.current(`+₹${amount} added`, "win");
  }, [set]);

  // ── Start flying ───────────────────────────────────────────────────────────

  const startFlying = useCallback(() => {
    const s = stateRef.current;

    // Deduct bets
    let deduction = 0;
    if (s.bets[1].placed) deduction += s.bets[1].amount;
    if (s.bets[2].placed) deduction += s.bets[2].amount;

    set((prev) => ({
      ...prev,
      phase: "flying",
      multiplier: 1.0,
      bets: {
        1: { ...prev.bets[1], cashedOut: false, cashoutMultiplier: undefined, payout: undefined },
        2: { ...prev.bets[2], cashedOut: false, cashoutMultiplier: undefined, payout: undefined },
      },
      balance: +(prev.balance - deduction).toFixed(2),
    }));

    startTimeRef.current = Date.now();

    let mult = 1;

    console.log("Starting fly timer with crashAt =", s.crashAt);

    if (!flyTimerRef.current) clearInterval(flyTimerRef.current!)
    flyTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 100;
      // const mult = +multAtTime(elapsed, GAME_CONFIG.timeConstant).toFixed(2);
      mult += 0.01;
      const current = stateRef.current;

      // Auto-cashouts
      ([1, 2] as const).forEach((slot) => {
        const bet = current.bets[slot];
        if (bet.placed && !bet.cashedOut && bet.autoCash >= 1.1 && mult >= bet.autoCash) {
          cashOut(slot);
        }
      });

      // Check crash
      if (mult >= current.crashAt) {
        clearInterval(flyTimerRef.current!);
        triggerCrash(elapsed);
        return;
      }

      // Simulate live player cashouts
      set((prev) => ({
        ...prev,
        multiplier: mult,
        livePlayers: simulateCashouts(prev.livePlayers, mult, prev.crashAt),
      }));

    }, GAME_CONFIG.tickMs);

  }, [set, cashOut]);

  // ── Trigger crash ──────────────────────────────────────────────────────────

  const triggerCrash = useCallback((_elapsed: number) => {
    const s = stateRef.current;

    let lossCount = 0;
    let lossAmount = 0;
    ([1, 2] as const).forEach((slot) => {
      const bet = s.bets[slot];
      if (bet.placed && !bet.cashedOut) {
        lossCount++;
        lossAmount += bet.amount;
      }
    });

    set((prev) => ({
      ...prev,
      phase: "crashed",
      multiplier: prev.crashAt,
      losses: prev.losses + lossCount,
      pnl: +(prev.pnl - lossAmount).toFixed(2),
      history: [
        { crashAt: prev.crashAt, timestamp: Date.now() },
        ...prev.history,
      ].slice(0, 50),
    }));

    if (lossAmount > 0) {
      onToastRef.current(`Flew away at ${s.crashAt.toFixed(2)}x`, "lose");
    }
  }, [set]);

  // ── Start waiting ──────────────────────────────────────────────────────────

  const startWaiting = useCallback(async () => {
    roundIdRef.current = newRoundId();

    // Pre-fetch crash point  during waiting phase
    const crashAt = await fetchCrashPoint(roundIdRef.current);

    set((prev) => ({
      ...prev,
      phase: "waiting",
      multiplier: 1.0,
      crashAt,
      waitLeft: GAME_CONFIG.waitDuration,
      bets: {
        1: { ...prev.bets[1], placed: false, cashedOut: false, cashoutMultiplier: undefined },
        2: { ...prev.bets[2], placed: false, cashedOut: false, cashoutMultiplier: undefined },
      },
      livePlayers: generateLivePlayers(),
    }));

    console.log("from start waiting")

    if (waitTimerRef.current) {
      clearInterval(waitTimerRef.current);
    }
    waitTimerRef.current = setInterval(() => {
      const current = stateRef.current;
      if (current.waitLeft <= 1) {
        clearInterval(waitTimerRef.current!);

        console.log("stopped");
        setTimeout(() => startFlying(), 0)

        set((prev) => ({
          ...prev,
          waitLeft: 0,
        }));

        return;
      }

      set((prev) => {
        return { ...prev, waitLeft: prev.waitLeft - 1 };
      });
    }, 2000);
  }, [set, startFlying]);

  // ── Lifecycle: crashed → wait ──────────────────────────────────────────────

  // useEffect(() => {
  //   if (state.phase === "crashed") {
  //     const t = setTimeout(() => startWaiting(), 5000);
  //     return () => clearTimeout(t);
  //   }
  // }, [state.phase, startWaiting]);

  // // ── Bootstrap ──────────────────────────────────────────────────────────────

  // useEffect(() => {
  //   startWaiting();
  //   return () => {
  //     clearInterval(flyTimerRef.current!);
  //     clearInterval(waitTimerRef.current!);
  //   };
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return {
    state,
    placeBet,
    cashOut,
    updateBetAmount,
    updateAutoCash,
    addFunds,
    registerToast,
  };
}
