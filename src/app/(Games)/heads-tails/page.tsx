"use client";

import { useState, useRef, useCallback, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import Coin3D from "@/components/games/heads-tails/Coin3D";
import { BetPanel, FlipHistory, StatsBar, ParticlesBurst } from "@/components/games/heads-tails/components";
import axios from "axios";
import { BASE_URL } from "@/lib/APIROTES";
import { toast } from "sonner";
import Header from "@/components/games/shared/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet } from "@/app/store/features/walletSlice";
import { AppDispatch, RootState } from "@/app/store/store";
export type CoinSide = "heads" | "tails";

export interface FlipRecord {
  result: CoinSide;
  bet: CoinSide;
  amount: number;
  betAmount?:number; //just for api
  won: boolean;
  payout: number;
}

export interface GameStats {
  balance: number | undefined;
  wins: number;
  losses: number;
  pnl: number;
  history: FlipRecord[];
}

// ── API adapter ──────────────────────────────────────────────────────────────
async function fetchFlipResult(choice: CoinSide, amount: number): Promise<CoinSide> {
  // DEMO MODE — remove this and call your API below
  // await new Promise((r) => setTimeout(r, 50));
  // return Math.random() < 0.5 ? "heads" : "tails";

  // REAL API MODE (uncomment):
  try {
    const { data } = await axios.post(`${BASE_URL}/coin/flip`, { choice, betAmount: amount }, { withCredentials: true })
    return data.data?.result as CoinSide;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.response?.data?.message || error.message || "error in flip")
  }
}

export default function HeadsTailsPage() {
  const [stats, setStats] = useState<GameStats>({
    balance: undefined,
    wins: 0,
    losses: 0,
    pnl: 0,
    history: [],
  });
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const roundRef = useRef(0);

  const dispatch = useDispatch<AppDispatch>();

  const { data: wallet, loading, error } = useSelector((state: RootState) => state.wallet)

  useEffect(() => {
    if (wallet) return;
    dispatch(fetchWallet());
  }, [dispatch])
  
  useEffect(() => {
    if(!wallet) return;
    setStats(s => ({
      ...s,
      balance: wallet.balance
    }))
  }, [wallet])

  const handleFlip = useCallback(
    async (side: CoinSide, amount: number) => {

      if(!stats.balance) throw new Error("Invalid wallet ! pls wait.");
      if (flipping || amount > stats.balance) return;

      setFlipping(true);
      setResult(null);
      setIsWin(null);
      setStats(s=>({
        ...s,
        balance: (s.balance ?? 0) - amount
            }))
      roundRef.current++;

      try {
        const flipResult = await fetchFlipResult(side, amount);
        const won = flipResult === side;
        const payout = won ? amount * 2 : 0;

        // Delay state update to sync with coin animation land
        setTimeout(() => {
          setResult(flipResult);
          setIsWin(won);
          setShowParticles(won);

          setStats((prev) => ({
            balance: (prev.balance ?? 0) + payout,
            wins: prev.wins + (won ? 1 : 0),
            losses: prev.losses + (won ? 0 : 1),
            pnl: prev.pnl + (won ? amount : -amount),
            history: [
              { result: flipResult, bet: side, amount, won, payout },
              ...prev.history,
            ].slice(0, 50),
          }));

          setTimeout(() => setFlipping(false), 2000);
        }, 1600); // matches coin flip duration
      } catch (err: any) {
        setStats(prev=>({
          ...prev,
          balance:(prev.balance??0) + amount
        }))
        console.log("Flip error:", err);
        toast.error(err.message || "Error in fliping coin !")
        setFlipping(false);
      }
    },
    [flipping, stats.balance]
  );
  const getHistory = async () => {
      try {
        const {data:res} = await axios.get(`${BASE_URL}/coin/my-history`, {withCredentials:true});
        const history = res.data as GameStats["history"]
        let pnl = history.reduce((prev,flip)=>{
          if(flip.won) return (prev + flip.payout - (flip.betAmount || 0) )
            else return prev - (flip.betAmount || 0)

        },0)
      let totalWins = history.filter(flip=>(flip.won));
      let totalLosses = history.filter(flip=>!flip.won);
        setStats(prev => ({
          ...prev,
          history: Array.isArray(res.data) ? [...res.data, ...prev.history] : prev.history,
          wins:totalWins.length,
          losses:totalLosses.length,
          pnl
        }));
      } catch (error) {
        console.log(error);
        toast.error("Error in getting history");
        return null
      }
    }
  useEffect(()=>{
    getHistory();
  },[])

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#080b12", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-24 -right-20 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Particle burst overlay */}
      {showParticles && (
        <ParticlesBurst onDone={() => setShowParticles(false)} />
      )}

      {/* Header */}
      <Header balance={stats.balance} title="Heads & Tails" desc="Evoplay · RTP: 96%" />

      {/* Coin */}
      <div className="flex flex-col items-center py-8 relative z-5">
        <Coin3D flipping={flipping} result={result} />

        {/* Result label */}
        <div
          className={cn(
            "mt-4 px-5 py-2 rounded-full text-sm font-bold transition-all duration-500",
            isWin === null
              ? "opacity-0"
              : isWin
                ? "opacity-100 scale-100"
                : "opacity-100 scale-100"
          )}
          style={
            isWin === null
              ? {}
              : isWin
                ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }
                : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }
          }
        >
          {isWin === null
            ? ""
            : isWin
              ? `🎉 YOU WON  +₹${stats.history[0]?.amount ?? 0}`
              : `💫 ${result?.toUpperCase()} — Better luck!`}
        </div>
      </div>

      {/* Bet Panel */}
      <BetPanel
        balance={stats.balance || 0}
        flipping={flipping}
        onFlip={handleFlip}
      />

      {/* Stats */}
      <StatsBar wins={stats.wins} losses={stats.losses} pnl={stats.pnl} />

      {/* History */}
      <FlipHistory history={stats.history} />
    </div>
  );
}
