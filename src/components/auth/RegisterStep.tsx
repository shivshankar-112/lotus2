"use client";

import { useState } from "react";
import { User, Gift, Eye, EyeOff, Settings } from "lucide-react";

interface RegisterStepProps {
  phone: string;
  onSubmit: (username: string, password:string, referralCode?: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function RegisterStep({ phone, onSubmit, isLoading, error }: RegisterStepProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [referral, setReferral] = useState("");
  const [showReferral, setShowReferral] = useState(false);

  const canSubmit = username.trim().length >= 3;

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-bold text-sm" style={{ color: "#4ade80" }}>Welcome! You're new here</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          Create your account to claim your ₹100 welcome bonus
        </p>
      </div>

      {/* Username */}
      <div>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", display: "block", marginBottom: 10 }}>
          Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 20))}
            placeholder="Your name"
            className="w-full h-12 pl-10 pr-4 rounded-xl text-sm font-semibold outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
            }}
          />
          {username.length >= 3 && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: "#4ade80" }}
            >
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", display: "block", marginBottom: 10 }}>
          Password
        </label>
        <div className="relative">
          <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-12 pl-10 pr-4 rounded-xl text-sm font-semibold outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
            }}
          />

          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold "
            style={{ color: "rgba(255,255,255,0.6" }}
          >
            {!showPassword ? <Eye className={`size-5`} onClick={()=>setShowPassword(true)}/> : <EyeOff className={`size-5`} onClick={()=>setShowPassword(false)} />}
          </span>

          {/* {password.length >= 6 && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: "#4ade80" }}
            >
              ✓
            </span>
          )} */}

        </div>
        <p style={{ fontSize: 11, marginTop: 6, color: "rgba(255,255,255,0.25)" }}>
         password must be of minimun 6 char.
        </p>
      </div>

      {/* Referral */}
      <div>
        <button
          type="button"
          onClick={() => setShowReferral((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold transition-colors"
          style={{ color: showReferral ? "#fbbf24" : "rgba(255,255,255,0.35)" }}
        >
          <Gift className="w-3.5 h-3.5" />
          {showReferral ? "Hide referral code" : "Have a referral code?"}
        </button>
        {showReferral && (
          <input
            type="text"
            value={referral}
            onChange={(e) => setReferral(e.target.value.toUpperCase().slice(0, 12))}
            placeholder="Enter referral code"
            className="mt-2 w-full h-11 px-4 rounded-xl text-sm font-bold outline-none transition-all"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "#fbbf24",
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: "2px",
            }}
          />
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold" style={{ color: "#f87171" }}>{error}</p>
      )}

      <button
        type="button"
        onClick={() => onSubmit(username,password, referral || undefined)}
        disabled={isLoading || !canSubmit}
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
            Creating account...
          </span>
        ) : "CREATE ACCOUNT & PLAY →"}
      </button>
    </div>
  );
}
