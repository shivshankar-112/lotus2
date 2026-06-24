"use client";

import { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";

const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1",  flag: "🇺🇸", name: "USA"   },
  { code: "+44", flag: "🇬🇧", name: "UK"    },
  { code: "+971",flag: "🇦🇪", name: "UAE"   },
  { code: "+65", flag: "🇸🇬", name: "SG"    },
];

interface PhoneStepProps {
  onSubmit: (phone: string, countryCode: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function PhoneStep({ onSubmit, isLoading, error }: PhoneStepProps) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone]     = useState("");
  const [showDD, setShowDD]   = useState(false);

  function handlePhone(v: string) {
    setPhone(v.replace(/\D/g, "").slice(0, 10));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", display: "block", marginBottom: 10 }}>
          Mobile Number
        </label>

        <div className="flex gap-2">
          {/* Country picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDD((v) => !v)}
              className="flex items-center gap-1.5 h-12 px-3 rounded-xl border font-semibold text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", whiteSpace: "nowrap" }}
            >
              <span>{country.flag}</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11 }}>{country.code}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {showDD && (
              <div
                className="absolute top-14 left-0 z-50 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "#1a1d2e", border: "1px solid rgba(255,255,255,0.12)", minWidth: 160 }}
              >
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setCountry(c); setShowDD(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: country.code === c.code ? "#fbbf24" : "rgba(255,255,255,0.75)" }}
                  >
                    <span>{c.flag}</span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="ml-auto opacity-50" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11 }}>{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone input */}
          <div className="flex-1 relative">
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => handlePhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && onSubmit(phone, country.code)}
              placeholder="Enter 10-digit number"
              maxLength={10}
              className="w-full h-12 rounded-xl px-4 text-sm font-semibold outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "1px",
              }}
            />
            {phone.length > 0 && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif" }}>
                {phone.length}/10
              </span>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-2 text-xs font-semibold" style={{ color: "#f87171" }}>{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSubmit(phone, country.code)}
        disabled={isLoading || phone.length !== 10}
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
            Sending OTP...
          </span>
        ) : (
          "GET OTP →"
        )}
      </button>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.5 }}>
        By continuing, you agree to our{" "}
        <span style={{ color: "rgba(251,191,36,0.6)", cursor: "pointer" }}>Terms of Service</span>{" "}
        and{" "}
        <span style={{ color: "rgba(251,191,36,0.6)", cursor: "pointer" }}>Privacy Policy</span>
      </p>
    </div>
  );
}
