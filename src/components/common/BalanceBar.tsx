"use client";

import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BalanceBarProps {
  balance: number;
  onAddFunds: () => void;
}

export default function BalanceBar({ balance, onAddFunds }: BalanceBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider leading-none">Balance</p>
          <p className="text-white font-black text-base leading-tight tabular-nums">
            ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={onAddFunds}
        className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl h-8 px-3 text-xs gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Add ₹500
      </Button>
    </div>
  );
}
