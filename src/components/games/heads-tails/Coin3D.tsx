"use client";

import { useEffect, useRef } from "react";
import type { CoinSide } from "@/app/(Games)/heads-tails/page";

interface Coin3DProps {
  flipping: boolean;
  result: CoinSide | null;
}

export default function Coin3D({ flipping, result }: Coin3DProps) {
  const coinRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const coin = coinRef.current;
    if (!coin) return;

    if (flipping) {
      // Random full rotations + land on correct face
      const baseSpin = 1080 + Math.floor(Math.random() * 3) * 360;
      const landAngle = result === "heads" ? 0 : 180;
      const finalRot = baseSpin + landAngle;
      const dur = 1.6 + Math.random() * 0.4;

      coin.style.setProperty("--flip-dur", `${dur}s`);
      coin.style.setProperty("--final-rot", `${finalRot}deg`);
      coin.style.animation = "none";
      void coin.offsetHeight; // force reflow
      coin.style.animation = `coin-flip ${dur}s cubic-bezier(0.4,0,0.2,1) forwards`;
    } else if (result) {
      // Settle on result face
      const angle = result === "heads" ? 0 : 180;
      coin.style.animation = "none";
      coin.style.transform = `rotateY(${angle}deg)`;
    } else {
      // Idle float
      coin.style.animation = "coin-idle 6s ease-in-out infinite";
      coin.style.transform = "";
    }
  }, [flipping, result]);

  return (
    <>
      <style>{`
        @keyframes coin-idle {
          0%,100% { transform: rotateY(0deg) rotateX(8deg) translateY(0px); }
          50% { transform: rotateY(180deg) rotateX(8deg) translateY(-6px); }
        }
        @keyframes coin-flip {
          0%   { transform: rotateY(0deg) translateY(0px); }
          20%  { transform: rotateY(720deg) translateY(-90px); }
          50%  { transform: rotateY(1440deg) translateY(-130px); }
          80%  { transform: rotateY(2160deg) translateY(-50px); }
          95%  { transform: rotateY(var(--final-rot, 2880deg)) translateY(6px); }
          100% { transform: rotateY(var(--final-rot, 2880deg)) translateY(0px); }
        }
      `}</style>

      <div style={{ perspective: "900px", width: 160, height: 160 }}>
        <div
          ref={coinRef}
          style={{
            width: 160,
            height: 160,
            position: "relative",
            transformStyle: "preserve-3d",
            animation: "coin-idle 6s ease-in-out infinite",
          }}
        >
          {/* HEADS face — gold */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 3,
              background:
                "conic-gradient(from 0deg, #d97706, #fbbf24, #f59e0b, #fcd34d, #f59e0b, #d97706, #b45309, #d97706, #fbbf24, #fcd34d, #f59e0b, #d97706)",
              boxShadow:
                "inset 0 0 0 6px rgba(255,255,255,0.14), inset 4px 4px 12px rgba(255,255,255,0.2), inset -4px -4px 12px rgba(0,0,0,0.3), 0 0 0 3px #92400e, 0 8px 40px rgba(251,191,36,0.45), 0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {/* Engraving rings */}
            <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 0 8px rgba(0,0,0,0.2)" }} />
            <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
            {/* Art */}
            <span style={{ fontSize: 44, lineHeight: 1, zIndex: 2, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>👑</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "2.5px", color: "#92400e", zIndex: 2, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>HEADS</span>
          </div>

          {/* TAILS face — silver */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 3,
              background:
                "conic-gradient(from 0deg, #6b7280, #d1d5db, #9ca3af, #e5e7eb, #9ca3af, #6b7280, #4b5563, #6b7280, #d1d5db, #e5e7eb, #9ca3af, #6b7280)",
              boxShadow:
                "inset 0 0 0 6px rgba(255,255,255,0.18), inset 4px 4px 12px rgba(255,255,255,0.25), inset -4px -4px 12px rgba(0,0,0,0.25), 0 0 0 3px #374151, 0 8px 40px rgba(156,163,175,0.25), 0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.22)", boxShadow: "inset 0 0 8px rgba(0,0,0,0.15)" }} />
            <div style={{ position: "absolute", inset: 18, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)" }} />
            <span style={{ fontSize: 44, lineHeight: 1, zIndex: 2, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>⚡</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "2.5px", color: "#374151", zIndex: 2, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>TAILS</span>
          </div>

          {/* Coin edge (reeded rim effect) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 12,
              height: 160,
              marginLeft: -6,
              transform: "rotateY(90deg) translateZ(0px)",
              background:
                "repeating-linear-gradient(to bottom, #92400e 0px, #d97706 2px, #fbbf24 4px, #d97706 6px, #92400e 8px)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Ground shadow */}
      <div
        style={{
          width: 120,
          height: 14,
          marginTop: 6,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }}
      />
    </>
  );
}
