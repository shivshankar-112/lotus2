"use client";

import { useState } from "react";
import { Building2, Zap, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type WithdrawMethod = "bank" | "upi";

const QUICK_AMOUNTS = [200, 500, 1000, 2000];

interface WithdrawPanelProps {
  balance: number;
  onWithdraw?: (amount: number, method: WithdrawMethod, detail: any) => Promise<void>;
}

export default function WithdrawPanel({ balance, onWithdraw }: WithdrawPanelProps) {
  const [amount, setAmount]     = useState(500);
  const [method, setMethod]     = useState<WithdrawMethod>("upi");
  const [detail, setDetail]     = useState<any>("");  // UPI ID or account number
  const [ifsc, setIfsc]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const insufficient = amount > balance;
  const minWithdraw  = 200;
  const canSubmit    = amount >= minWithdraw && !insufficient;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      if (onWithdraw) await onWithdraw(amount, method, detail);
      else await new Promise((r) => setTimeout(r, 1600));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (e: any) {
      setError(e.message || "Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(192,132,252,0.15)", border: "2px solid rgba(192,132,252,0.4)" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "#c084fc" }} />
        </div>
        <div className="text-center">
          <p className="font-black text-lg" style={{ color: "#c084fc", fontFamily: "'Orbitron', sans-serif" }}>
            Withdrawal Requested!
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            ₹{amount.toLocaleString("en-IN")} will arrive in 1–3 hours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4 pb-4">

      {/* Available balance */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.18)" }}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Available Balance</p>
        <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: "#c084fc" }}>
          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Amount */}
      <div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Withdraw Amount
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className="py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: amount === q ? "rgba(192,132,252,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${amount === q ? "rgba(192,132,252,0.45)" : "rgba(255,255,255,0.1)"}`,
                color: amount === q ? "#c084fc" : "rgba(255,255,255,0.5)",
              }}
            >
              ₹{q}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${insufficient ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>₹</span>
          <input
            type="number"
            value={amount}
            min={minWithdraw}
            max={balance}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="flex-1 bg-transparent outline-none py-3 text-sm font-bold"
            style={{ color: "#fff", fontFamily: "'Orbitron', sans-serif" }}
          />
          <button
            onClick={() => setAmount(Math.floor(balance))}
            className="text-xs font-bold px-2 py-1 rounded-lg transition-all"
            style={{ background: "rgba(192,132,252,0.12)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.25)" }}
          >
            MAX
          </button>
        </div>
        {insufficient && (
          <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
            <AlertCircle className="w-3 h-3" /> Insufficient balance
          </p>
        )}
        {amount < minWithdraw && amount > 0 && (
          <p className="text-xs font-semibold mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Minimum withdrawal: ₹{minWithdraw}
          </p>
        )}
      </div>

      {/* Method */}
      <div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Withdrawal Method
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "upi"  as const, label: "UPI",          icon: <Zap className="w-4 h-4" />,       tag: "1-3 hrs" },
            { id: "bank" as const, label: "Bank Transfer", icon: <Building2 className="w-4 h-4" />, tag: "1-2 days" },
          ]).map((m) => (
            <button
              key={m.id}
              onClick={() => { setMethod(m.id); setDetail(""); }}
              className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
              style={{
                background: method === m.id ? "rgba(192,132,252,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${method === m.id ? "rgba(192,132,252,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div style={{ color: method === m.id ? "#c084fc" : "rgba(255,255,255,0.4)" }}>{m.icon}</div>
              <div className="flex-1 text-left">
                <p style={{ fontSize: 13, fontWeight: 600, color: method === m.id ? "#c084fc" : "rgba(255,255,255,0.6)" }}>
                  {m.label}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{m.tag}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail fields */}
      {method === "upi" && (
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>
            UPI ID
          </p>
          <div
            className="flex items-center gap-2 rounded-xl px-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Zap className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type="text"
              value={detail.upiId}
              onChange={(e) => setDetail(({upiId:e.target.value}))}
              placeholder="yourname@upi"
              className="flex-1 bg-transparent outline-none py-3 text-sm"
              style={{ color: "#fff" }}
            />
          </div>
        </div>
      )}

      {method === "bank" && (
        <div className="space-y-2.5">
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>
              Account Number
            </p>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value.replace(/\D/g, "").slice(0, 18))}
              placeholder="Enter account number"
              className="w-full rounded-xl px-3 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}
            />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>
              IFSC Code
            </p>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
              placeholder="e.g. SBIN0001234"
              className="w-full rounded-xl px-3 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", letterSpacing: "2px" }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
          <p style={{ fontSize: 12, color: "#f87171", fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.5px",
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          `WITHDRAW ₹${amount.toLocaleString("en-IN")} →`
        )}
      </button>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Withdrawals are processed within 1–24 hours after KYC verification
      </p>
    </div>
  );
}
