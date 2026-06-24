"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { DEMO_OTP } from "@/lib/authApi";

interface OtpStepProps {
  phone: string;
  isNewUser: boolean;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  resendLeft: number;

  receivedOtp?:string;
}

export default function OtpStep({
  phone, isNewUser, onSubmit, onResend, onBack, isLoading, error, resendLeft, receivedOtp
}: OtpStepProps) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Auto-submit when all 6 filled
  useEffect(() => {
    const otp = digits.join("");
    if (otp.length === 6) onSubmit(otp);
  }, [digits]); // eslint-disable-line

  function handleChange(i: number, val: string) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    refs[Math.min(pasted.length, 5)].current?.focus();
  }

  const maskedPhone = phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");

  return (
    <div className="flex flex-col gap-6">
      {/* Info */}
      <div className="text-center">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          OTP sent to{" "}
          <span style={{ color: "#fbbf24", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 12 }}>
            +91 {maskedPhone}
          </span>
        </p>
        {isNewUser && (
          <span
            className="inline-block mt-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
          >
            🎉 New account — ₹100 bonus awaits!
          </span>
        )}
      </div>

      {/* Demo hint */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
      >
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Demo OTP</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#fbbf24", fontWeight: 700, letterSpacing: "3px" }}>
          {receivedOtp}
        </span>
      </div>

      {/* OTP boxes */}
      <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className="w-12 h-14 text-center text-xl font-black rounded-xl outline-none transition-all"
            style={{
              background: d ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)",
              border: error
                ? "2px solid rgba(239,68,68,0.6)"
                : d
                ? "2px solid rgba(251,191,36,0.5)"
                : "1px solid rgba(255,255,255,0.12)",
              color: "#fbbf24",
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: 0,
              caretColor: "#fbbf24",
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-xs font-semibold" style={{ color: "#f87171" }}>{error}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={() => onSubmit(digits.join(""))}
        disabled={isLoading || digits.join("").length !== 6}
        className="w-full h-12 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "1px",
          background: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
          color: "#1a0a00",
          boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Verifying...
          </span>
        ) : "VERIFY & CONTINUE →"}
      </button>

      {/* Resend + back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          ← Change number
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resendLeft > 0}
          className="text-xs font-semibold transition-colors disabled:cursor-not-allowed"
          style={{ color: resendLeft > 0 ? "rgba(255,255,255,0.25)" : "#fbbf24" }}
        >
          {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
