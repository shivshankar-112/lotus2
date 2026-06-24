"use client";

import { useEffect, useState } from "react";
import { Zap, CreditCard, Building2, Smartphone, CheckCircle2, Loader2, ArrowDownLeft, ArrowUpRight, Gamepad2, Trophy, Copy,  Landmark, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useGetMyDepositsQuery } from "@/app/store/apis/depositsSlice";
import axios from "axios";
import { BASE_URL } from "@/lib/APIROTES";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

type PayMethod = "upi" | "card" | "netbanking" | "wallet";

const PAY_METHODS: { id: PayMethod; label: string; icon: React.ReactNode; tag?: string }[] = [
  { id: "upi", label: "UPI", icon: <Zap className="w-4 h-4" />, tag: "Instant" },
  { id: "card", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
  { id: "netbanking", label: "Net Banking", icon: <Building2 className="w-4 h-4" /> },
  { id: "wallet", label: "Wallet", icon: <Smartphone className="w-4 h-4" /> },
];

interface DepositPanelProps {
  balance: number;
  onDeposit?: (amount: number, method: PayMethod, accountDetails?: any) => Promise<void>;
}



type TxType = "all" | "deposit" | "withdraw" | "bet" | "win" | "none";
type TxStatus = "success" | "pending" | "failed";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  status: TxStatus;
  description: string;
  timestamp: string;
  game?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t001", type: "deposit", amount: 1000, status: "success", description: "UPI Deposit", timestamp: "2025-05-15T10:30:00Z" },
  { id: "t002", type: "bet", amount: 100, status: "success", description: "Aviator", timestamp: "2025-05-15T10:35:00Z", game: "Aviator" },
  { id: "t003", type: "win", amount: 324, status: "success", description: "Aviator Win (3.24x)", timestamp: "2025-05-15T10:35:30Z", game: "Aviator" },
  { id: "t004", type: "bet", amount: 50, status: "success", description: "Heads & Tails", timestamp: "2025-05-15T10:40:00Z", game: "Heads&Tails" },
  { id: "t005", type: "deposit", amount: 500, status: "success", description: "Net Banking", timestamp: "2025-05-15T11:00:00Z" },
  { id: "t006", type: "bet", amount: 200, status: "success", description: "Win Go", timestamp: "2025-05-15T11:10:00Z", game: "WinGo" },
  { id: "t007", type: "win", amount: 400, status: "success", description: "Win Go Win (2.0x)", timestamp: "2025-05-15T11:10:30Z", game: "WinGo" },
  { id: "t008", type: "bet", amount: 100, status: "success", description: "Aviator", timestamp: "2025-05-15T11:20:00Z", game: "Aviator" },
  { id: "t009", type: "withdraw", amount: 500, status: "pending", description: "UPI Withdrawal", timestamp: "2025-05-15T11:30:00Z" },
  { id: "t010", type: "bet", amount: 50, status: "success", description: "Chicken Road 2", timestamp: "2025-05-15T11:40:00Z", game: "CR2" },
  { id: "t011", type: "win", amount: 173, status: "success", description: "CR2 Win (3.46x)", timestamp: "2025-05-15T11:40:20Z", game: "CR2" },
  { id: "t012", type: "withdraw", amount: 1000, status: "failed", description: "Bank Transfer", timestamp: "2025-05-14T09:00:00Z" },
];

const TX_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  deposit: { text: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
  withdraw: { text: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.2)" },
  bet: { text: "#7dd3fc", bg: "rgba(125,211,252,0.1)", border: "rgba(125,211,252,0.2)" },
  win: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
};

const STATUS_STYLES: Record<TxStatus, { text: string; bg: string }> = {
  success: { text: "#4ade80", bg: "rgba(34,197,94,0.1)" },
  pending: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  failed: { text: "#f87171", bg: "rgba(239,68,68,0.1)" },
};

const TX_ICONS: Record<string, React.ReactNode> = {
  deposit: <ArrowDownLeft className="w-4 h-4" />,
  withdraw: <ArrowUpRight className="w-4 h-4" />,
  bet: <Gamepad2 className="w-4 h-4" />,
  win: <Trophy className="w-4 h-4" />,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}


export default function DepositPanel({ balance, onDeposit }: DepositPanelProps) {
  const { data } = useGetMyDepositsQuery();

  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const [filter, setFilter] = useState<TxType>("none");

  const filtered = MOCK_TRANSACTIONS.filter(
    (t) => filter === "all" || t.type === filter
  );

  async function handleSubmit() {
    if (amount < 100) return;
    setLoading(true);
    try {
      if (onDeposit) await onDeposit(amount, method, { upiId });
      else await new Promise((r) => setTimeout(r, 1400)); // demo delay

      setSuccess(true);
      // setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    // return (
    //   <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
    //     <div
    //       className="w-16 h-16 rounded-full flex items-center justify-center"
    //       style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}
    //     >
    //       <CheckCircle2 className="w-8 h-8" style={{ color: "#4ade80" }} />
    //     </div>
    //     <div className="text-center">
    //       <p className="font-black text-lg" style={{ color: "#4ade80", fontFamily: "'Orbitron', sans-serif" }}>
    //         ₹{amount.toLocaleString("en-IN")} Added!
    //       </p>
    //       <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
    //         Your balance has been updated
    //       </p>
    //     </div>
    //   </div>
    // );

    return <DepositDetails/>
  }

  return (
    <div className="px-4 space-y-4 pb-4">

      {/* Amount selection */}
      <div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Select Amount
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className="py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: amount === q ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${amount === q ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: amount === q ? "#fbbf24" : "rgba(255,255,255,0.5)",
              }}
            >
              ₹{q.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        {/* Custom amount */}
        <div
          className="flex items-center gap-2 rounded-xl px-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>₹</span>
          <input
            type="number"
            value={amount}
            min={100}
            onChange={(e) => setAmount(Math.max(100, Number(e.target.value) || 100))}
            className="flex-1 bg-transparent outline-none py-3 text-sm font-bold"
            style={{ color: "#fff", fontFamily: "'Orbitron', sans-serif" }}
            placeholder="Enter amount"
          />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>MIN ₹100</span>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PAY_METHODS.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setMethod(pm.id)}
              className="flex items-center gap-2.5 p-3 rounded-xl transition-all"
              style={{
                background: method === pm.id ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${method === pm.id ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div style={{ color: method === pm.id ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>
                {pm.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: method === pm.id ? "#fbbf24" : "rgba(255,255,255,0.6)" }}>
                {pm.label}
              </span>
              {pm.tag && (
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  {pm.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* UPI ID field */}
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
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="flex-1 bg-transparent outline-none py-3 text-sm"
              style={{ color: "#fff" }}
            />
          </div>
        </div>
      )}

      {/* Bonus hint */}
      {amount >= 1000 && (
        <div
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
        >
          <span className="text-base">🎁</span>
          <p style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>
            +5% bonus on deposits ₹1,000 and above
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || amount < 100}
        className="w-full py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-40"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.5px",
          background: "linear-gradient(135deg,#16a34a,#22c55e)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          `DEPOSIT ₹${amount.toLocaleString("en-IN")} →`
        )}
      </button>

      {/* Safety badges */}
      <div className="flex items-center justify-center gap-5 pt-1">
        {["🔒 SSL Secured", "⚡ Instant", "✅ Safe"].map((b) => (
          <span key={b} style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>{b}</span>
        ))}
      </div>

      {/* Transaction list */}

      
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No transactions found</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {filtered.map((tx, i) => {
            const col = TX_COLORS[tx.type];
            const sts = STATUS_STYLES[tx.status];
            const isCredit = tx.type === "deposit" || tx.type === "win";

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}
                >
                  {TX_ICONS[tx.type]}
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>
                    {tx.description}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
                    {formatDate(tx.timestamp)}
                  </p>
                </div>

                {/* Status + Amount */}
                <div className="text-right shrink-0">
                  <p
                    className="font-black text-sm tabular-nums"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 13,
                      color: isCredit ? "#4ade80" : col.text,
                    }}
                  >
                    {isCredit ? "+" : "−"}₹{tx.amount.toFixed(2)}
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sts.bg, color: sts.text }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

interface PaymentConfig {
  upi: {
    upiId: string;
    upiName: string;
    qrImage: string;
  };
  bank: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    branchName: string;
  };
}

export function DepositDetails() {
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] =
    useState<PaymentConfig | null>(null);

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/admin/payment-details`
      );

      setPaymentConfig(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        Loading payment details...
      </div>
    );
  }

  if (!paymentConfig) {
    return (
      <div className="py-20 text-center text-red-400">
        Payment details unavailable
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* Notice */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <p className="text-center text-sm leading-6 text-yellow-300">
          Pay using any method below. After successful
          payment and verification, your wallet balance
          will be updated within 24 hours.
        </p>
      </div>

      {/* QR */}
      {paymentConfig.upi.qrImage && (
        <div className="rounded-3xl border border-yellow-500/20 bg-[#11151c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-yellow-400" />
            <span className="font-medium text-yellow-400">
              Scan & Pay
            </span>
          </div>

          <div className="flex justify-center">
            <img
              src={paymentConfig.upi.qrImage}
              alt="QR"
              className="h-60 w-60 rounded-2xl bg-white p-2"
            />
          </div>
        </div>
      )}

      {/* UPI */}
      <div className="rounded-2xl bg-[#11151c] p-4">
        <p className="mb-2 text-xs text-gray-500">
          UPI ID
        </p>

        <div className="flex items-center justify-between">
          <span className="text-white">
            {paymentConfig.upi.upiId}
          </span>

          <button
            onClick={() =>
              copy(paymentConfig.upi.upiId)
            }
          >
            <Copy
              size={18}
              className="text-yellow-400"
            />
          </button>
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-2xl bg-[#11151c] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-yellow-400" />
          <span className="font-medium text-white">
            Bank Transfer
          </span>
        </div>

        <div className="space-y-4">
          <InfoRow
            label="Account Holder"
            value={paymentConfig.bank.accountName}
          />

          <InfoRow
            label="Account Number"
            value={paymentConfig.bank.accountNumber}
            copyable
          />

          <InfoRow
            label="IFSC Code"
            value={paymentConfig.bank.ifsc}
            copyable
          />

          <InfoRow
            label="Bank Name"
            value={paymentConfig.bank.bankName}
          />

          <InfoRow
            label="Branch"
            value={paymentConfig.bank.branchName}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-1 text-sm text-white">
          {value}
        </p>
      </div>

      {copyable && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied");
          }}
        >
          <Copy
            size={16}
            className="text-yellow-400"
          />
        </button>
      )}
    </div>
  );
}