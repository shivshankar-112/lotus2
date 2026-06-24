"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import PhoneStep from "@/components/auth/PhoneStep";
import OtpStep from "@/components/auth/OtpStep";
import RegisterStep from "@/components/auth/RegisterStep";

const STEPS = ["phone", "otp", "register"] as const;

function StepDots({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {STEPS.map((s, i) => {
        const idx = STEPS.indexOf(current as any);
        const done = i < idx;
        const active = s === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300"
              style={{
                background: active
                  ? "linear-gradient(135deg, #d97706, #fbbf24)"
                  : done
                  ? "rgba(34,197,94,0.2)"
                  : "rgba(255,255,255,0.07)",
                border: active
                  ? "none"
                  : done
                  ? "1px solid rgba(34,197,94,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: active ? "#1a0a00" : done ? "#4ade80" : "rgba(255,255,255,0.3)",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-8 h-px transition-all duration-500"
                style={{ background: done ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const STEP_TITLES: Record<string, { title: string; sub: string }> = {
  phone:    { title: "Welcome Back",     sub: "Enter your mobile number to continue"  },
  otp:      { title: "Verify OTP",       sub: "Check your SMS for the 6-digit code"   },
  register: { title: "Create Account",   sub: "Almost there — choose your username"   },
};

export default function AuthPage() {
  const { state, user, submitPhone, submitOtp, submitRegistration, resendCode, goBack, otpResendLeft } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.step === "done" && user) {
      router.push("/profile");
    }
  }, [state.step, user, router]);

  const { title, sub } = STEP_TITLES[state.step] ?? STEP_TITLES.phone;

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden"
      style={{ background: "#080b12", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}
    >
      
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 320, height: 320, background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* Bottom gradient fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to top, #080b12, transparent)" }} />
      </div>

      {/* Logo header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
        <Link href="/">
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 900, color: "#fbbf24", letterSpacing: "-0.5px" }}>
            odds<span style={{ color: "#fff" }}>96</span>
          </div>
        </Link>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.5px" }}>SECURE</span>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex-1 px-6 pt-4 pb-10">

        {/* Title */}
        <div className="mb-8">
          <h1
            className="font-black leading-tight mb-1"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, color: "#fff" }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{sub}</p>
        </div>

        {/* Step dots (hide on last register step for cleanliness) */}
        {state.step !== "done" && <StepDots current={state.step} />}

        {/* Step content */}
        {state.step === "phone" && (
          <PhoneStep
            onSubmit={submitPhone}
            isLoading={state.isLoading}
            error={state.error}
          />
        )}
        {state.step === "otp" && (
          <OtpStep
            phone={state.phone}
            receivedOtp={state.receivedOtp}
            isNewUser={state.isNewUser}
            onSubmit={submitOtp}
            onResend={resendCode}
            onBack={goBack}
            isLoading={state.isLoading}
            error={state.error}
            resendLeft={otpResendLeft}
          />
        )}
        {state.step === "register" && (
          <RegisterStep
            phone={state.phone}
            onSubmit={submitRegistration}
            isLoading={state.isLoading}
            error={state.error}
          />
        )}

        {/* Footer trust badges */}
        {state.step === "phone" && (
          <div className="mt-10 flex items-center justify-center gap-6">
            {[
              { icon: "🔒", label: "SSL Secured" },
              { icon: "✅", label: "KYC Verified" },
              { icon: "⚡", label: "Instant OTP" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
