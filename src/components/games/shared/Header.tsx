"use client"
import { fetchWallet } from '@/app/store/features/walletSlice';
import { AppDispatch, RootState } from '@/app/store/store';
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const GameHeader = ({ title, desc, balance }: { title: string, desc?: string, balance: number | undefined }) => {
    const route = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { data: wallet, loading, error } = useSelector((state: RootState) => state.wallet)

    useEffect(() => {
        if (wallet) return;
        dispatch(fetchWallet());
    }, [dispatch])

    return (
        <header
            className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 border-b"
            style={{ background: "rgba(10,12,20,0.97)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.06)" }}
        >
            <div className="flex items-center gap-3">
                <button onClick={() => route.back()} className="text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1
                        className="font-black text-base leading-tight"
                        style={{ fontFamily: "'Orbitron', sans-serif", color: "#ef4444", letterSpacing: "1px" }}
                    >
                        {title || "Header"}
                    </h1>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>
                        {desc || 'Spribe · RTP 97%'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Live badge */}
                <div
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.5px" }}>LIVE</span>
                </div>

                {/* Balance pill */}
                <div
                    className="flex items-center gap-2 rounded-full px-3 py-1.5"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Bal
                    </span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: "#fbbf24", fontWeight: 700 }}>
                        {balance ? (`₹${Math.round(balance).toLocaleString("en-IN")}`) : (
                            <div
                                className="animate-pulse rounded-full"
                                style={{
                                    width: "50px",
                                    height: "14px",
                                    background:
                                        "linear-gradient(90deg, rgba(251,191,36,0.15), rgba(251,191,36,0.5), rgba(251,191,36,0.15))",
                                }}
                            />
                        )}
                    </span>
                </div>
            </div>
        </header>
    )
}

export default GameHeader