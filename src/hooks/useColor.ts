"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, ColorChoice, Bet, RoundResult } from "@/types/colorGame";
import { DEFAULT_CONFIG, generateRoundId } from "@/lib/gameEngine";
import {
  useGetCurrentRoundQuery,
  useLazyGetCurrentRoundQuery,
  useLazyGetMyResultQuery,
  useLazyGetResultQuery,
  usePlaceBetMutation,
} from "@/app/store/apis/games/colorGameSlice";
import { toast } from "sonner";

// ── Constants ──────────────────────────────────────────────────────────────────

const FALLBACK_NEXT_ROUND_DELAY_MS = 3_000;
const MIN_TIME_LEFT_SECONDS = 0;

const INITIAL_STATE: GameState = {
  isLoading: true,
  error: null,
  phase: "betting",
  currentRoundId: generateRoundId(),
  timeLeft: DEFAULT_CONFIG.roundDuration,
  totalSeconds: DEFAULT_CONFIG.roundDuration,
  balance: DEFAULT_CONFIG.startingBalance,
  currentBet: null,
  lastResult: null,
  history: [],
  betHistory: [],
  isWin: null,
};

// ── Types ──────────────────────────────────────────────────────────────────────

type BetChoice = {
  color: ColorChoice | null;
  size: "big" | "small" | null;
  number: number | null;
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useGameEngine() {
  const {
    data: currentRoundData,
    isLoading: roundLoading,
  } = useGetCurrentRoundQuery({});

  // Fix: use the correct query for the no-bet path
  const [getMyResult] = useLazyGetMyResultQuery();
  const [getResult] = useLazyGetResultQuery();
  const [getNextRound] = useLazyGetCurrentRoundQuery();
  const [placeBetApi] = usePlaceBetMutation();

  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track whether a resolve is already in-flight to prevent double-fires
  const resolvingRef = useRef(false);

  // ── Bootstrap round from server ────────────────────────────────────────────

  useEffect(() => {
    if (roundLoading || !currentRoundData?.data) return;

    const endTime = new Date(currentRoundData.data.endTime).getTime();
    const timeLeft = Math.max(
      MIN_TIME_LEFT_SECONDS,
      Math.floor((endTime - Date.now()) / 1000)
    );

    setState((s) => ({
      ...s,
      isLoading: false,
      currentRoundId: currentRoundData.data._id,
      currentRoundNumber: currentRoundData.data.roundNumber,
      timeLeft,
    }));
  }, [roundLoading, currentRoundData]);

  // ── Resolve round ──────────────────────────────────────────────────────────

  const resolveRound = useCallback(
    async (roundId: string, pendingBet: GameState["currentBet"]) => {
      // Guard against concurrent resolves (timer fires while a resolve is pending)
      if (resolvingRef.current) return;
      resolvingRef.current = true;

      setState((s) => ({ ...s, phase: "revealing" }));

      try {
        const response = pendingBet
          ? await getMyResult(roundId).unwrap()
          : await getResult(roundId).unwrap();

        const { round, bet } = response.data;

        if (!round?.result) {
          throw new Error("Round result missing from server response");
        }

        const { number, color, size } = round.result;
        const isWin = bet?.status === "won";

        // Build bet record only when a bet exists
        let betRecord: Bet | null = null;
        if (bet) {
          betRecord = {
            id: `${bet._id}`,
            roundId,
            choice: {
              number: bet.number,
              size: bet.size,
              color: bet.color,
            },
            amount: bet.amount,
            status: bet.status,
            payout: bet.winAmount,
            timestamp: Date.now(),
          };
        }

        setState((s) => {
          const alreadyRecorded = betRecord
            ? s.betHistory.some((b) => b.id === betRecord!.id)
            : false;

          return {
            ...s,
            phase: "result",
            lastResult: {
              roundId: round._id,
              roundNumber: round.roundNumber,
              number,
              color,
              bigSmall: size,
              timestamp: round.updatedAt,
            },
            isWin,
            betHistory:
              betRecord && !alreadyRecorded
                ? [betRecord, ...s.betHistory].slice(0, 100)
                : s.betHistory,
          };
        });

        // Fetch next round
        const { data: nextRound } = await getNextRound({}).unwrap();
        const now = Date.now();
        const startIn = new Date(nextRound.startTime).getTime() - now;
        const delay = startIn > 0 ? startIn : FALLBACK_NEXT_ROUND_DELAY_MS;

        setTimeout(() => {
          const nextEndTime = new Date(nextRound.endTime).getTime();
          const timeLeft = Math.max(
            MIN_TIME_LEFT_SECONDS,
            Math.floor((nextEndTime - Date.now()) / 1000)
          );

          setState((s) => ({
            ...s,
            phase: "betting",
            currentRoundId: nextRound._id,
            currentRoundNumber: nextRound.roundNumber,
            timeLeft,
            currentBet: null,
            // Preserve lastResult for display until next result arrives
            history: [{roundId: round._id, roundNumber:round.roundNumber , ...round.result, bigSmall:round.result?.size}, ...s.history].slice(0, 50),
            isWin: null,
          }));

          resolvingRef.current = false;
        }, delay);
      } catch (err:any) {
        console.log("Failed to resolve round:", err);
        // Return to betting so the player isn't stuck
        resolvingRef.current = false;
        if(err?.data) return
        setState((s) => ({ ...s, phase: "betting" }));
      }
    },
    [getMyResult, getResult, getNextRound]
  );

  // ── Countdown timer ────────────────────────────────────────────────────────

  useEffect(() => {
    // Don't start the timer until the initial round is loaded
    if (state.isLoading) return;

    timerRef.current = setInterval(() => {
      setState((s) => {
        // Timer is irrelevant during reveal / result phases
        if (s.phase === "result") return s;

        if (s.phase === "revealing") {
          const { currentRoundId, currentBet, balance } = s;

          setTimeout(() => resolveRound(currentRoundId, currentBet), 0);
          return { ...s, timeLeft: 0, phase: "revealing" };
        }

        const next = s.timeLeft - 1;

        // Lock bets when the lockout threshold is reached
        if (next <= DEFAULT_CONFIG.lockoutSeconds && s.phase === "betting") {
          return { ...s, phase: "locked", timeLeft: next };
        }

        // Time's up — kick off resolution
        if (next <= 0) {
          setTimeout(() => resolveRound(s.currentRoundId, s.currentBet), 0);
          return { ...s, timeLeft: 0, phase: "revealing" };
        }

        return { ...s, timeLeft: next };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isLoading, resolveRound]);

  // ── Place bet ──────────────────────────────────────────────────────────────

  const placeBet = useCallback(
    async (choice: BetChoice, amount: number) => {
      // Count how many selections the player made (color, number, size are separate bets)
      const selectionCount = [choice.color, choice.number, choice.size].filter(
        Boolean
      ).length;

      if (selectionCount === 0) {
        toast.error("Please choose a color, number, or size before betting.");
        return;
      }

      const totalAmount = amount * selectionCount;

      try {
        await placeBetApi({ amount, choice }).unwrap();

        setState((s) => {
          if (s.phase !== "betting") return s;
          if (totalAmount > s.balance) {
            toast.error("Insufficient balance.");
            return s;
          }
          return { ...s, currentBet: { choice, amount: totalAmount } };
        });
      } catch (error: any) {
        console.error("Error placing bet:", error);
        toast.error(error?.data?.message ?? "Failed to place bet.");
      }
    },
    [placeBetApi]
  );

  // ── Cancel bet ─────────────────────────────────────────────────────────────

  const cancelBet = useCallback(() => {
    toast.error("Feature coming soon…");
  }, []);

  // ── Add demo funds ─────────────────────────────────────────────────────────

  const addFunds = useCallback((amount: number) => {
    setState((s) => ({ ...s, balance: s.balance + amount }));
  }, []);

  return { state, placeBet, cancelBet, addFunds, config: DEFAULT_CONFIG };
}