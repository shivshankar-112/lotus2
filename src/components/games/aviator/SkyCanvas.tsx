"use client";

import { useEffect, useRef } from "react";
import type { GamePhase } from "@/types/aviator";
import { multColor, timeForMult, GAME_CONFIG } from "@/lib/aviatorEngine";

interface SkyCanvasProps {
  phase: GamePhase;
  multiplier: number;
  crashAt: number;
}

interface Star { x: number; y: number; r: number; phase: number }
interface TrailPoint { x: number; y: number }

export default function SkyCanvas({ phase, multiplier, crashAt }: SkyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef  = useRef<Star[]>([]);
  const trailRef  = useRef<TrailPoint[]>([]);
  const rafRef    = useRef<number>(0);
  const gridOff   = useRef(0);
  const startedAt = useRef<number | null>(null);

  // Reset trail on new round
  useEffect(() => {
    if (phase === "waiting") {
      trailRef.current = [];
      startedAt.current = null;
    }
    if (phase === "flying" && startedAt.current === null) {
      startedAt.current = Date.now();
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function buildStars(w: number, h: number) {
      starsRef.current = Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.8,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { clientWidth: w, clientHeight: h } = parent;
      canvas.width = w;
      canvas.height = h;
      buildStars(w, h);
    }
    resize();

    const parent = canvas.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    function getPlanePos(mult: number): { px: number; py: number } {
      const W = canvas.width, H = canvas.height;
      const maxT  = timeForMult(crashAt, GAME_CONFIG.timeConstant);
      const curT  = timeForMult(Math.min(mult, crashAt), GAME_CONFIG.timeConstant);
      const prog  = Math.min(curT / maxT, 1);
      const px    = 60 + prog * (W - 120);
      const baseline = H - 36;
      const py    = baseline - prog * prog * (H - 90);
      return { px, py };
    }

    function drawFrame() {
      const W = canvas.width, H = canvas.height;
      const t = Date.now() / 1000;

      // — Background —
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#050712");
      bg.addColorStop(1, "#0d1228");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // — Stars —
      for (const s of starsRef.current) {
        const alpha = 0.35 + 0.45 * Math.sin(s.phase + t * 1.1);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fill();
      }

      // — Scrolling grid —
      if (phase === "flying") gridOff.current = (gridOff.current + 1.4) % 44;
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = -gridOff.current; x < W; x += 44) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 44) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // — Ground line —
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H - 20); ctx.lineTo(W, H - 20); ctx.stroke();

      if (phase === "waiting") {
        rafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const col   = multColor(multiplier);
      const { px, py } = getPlanePos(multiplier);

      // — Update trail —
      // if (phase === "flying") {
      //   trailRef.current.push({ x: px, y: py });
      //   if (trailRef.current.length > 140) trailRef.current.shift();
      // }

      // // — Draw trail —
      // const trail = trailRef.current;
      // if (trail.length > 1) {
      //   // Main line
      //   ctx.beginPath();
      //   ctx.moveTo(trail[0].x, trail[0].y);
      //   for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      //   ctx.strokeStyle = col;
      //   ctx.lineWidth = 2.5;
      //   ctx.globalAlpha = 0.75;
      //   ctx.stroke();
      //   ctx.globalAlpha = 1;

      //   // Glow tail (last 30 points)
      //   const tail = trail.slice(-30);
      //   ctx.beginPath();
      //   ctx.moveTo(tail[0].x, tail[0].y);
      //   for (let i = 1; i < tail.length; i++) ctx.lineTo(tail[i].x, tail[i].y);
      //   ctx.strokeStyle = col;
      //   ctx.lineWidth = 8;
      //   ctx.globalAlpha = 0.14;
      //   ctx.stroke();
      //   ctx.globalAlpha = 1;
      // }

      // — Draw plane (only during flying) —
      // if (phase === "flying") {
      //   const wobble = Math.sin(t * 2.5) * 2.5;
      //   drawPlane(ctx, px, py, wobble, col);
      // }

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [phase, multiplier, crashAt]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

// ── Plane renderer ────────────────────────────────────────────────────────────

function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wobbleDeg: number,
  engineCol: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-18 + wobbleDeg) * (Math.PI / 180));

  // Fuselage
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.ellipse(0, 0, 23, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose cone
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(19, 0);
  ctx.lineTo(30, -2.5);
  ctx.lineTo(30, 2.5);
  ctx.closePath();
  ctx.fill();

  // Main wings
  ctx.fillStyle = "#94a3b8";
  for (const sign of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(2, sign * 1.5);
    ctx.lineTo(-6, sign * 20);
    ctx.lineTo(-14, sign * 20);
    ctx.lineTo(-11, sign * 1.5);
    ctx.closePath();
    ctx.fill();
  }

  // Tail fin
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(-14, -1.5);
  ctx.lineTo(-22, -11);
  ctx.lineTo(-24, -11);
  ctx.lineTo(-21, -1.5);
  ctx.closePath();
  ctx.fill();

  // Horizontal stabilizer
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(-16, 1);
  ctx.lineTo(-22, 7);
  ctx.lineTo(-24, 7);
  ctx.lineTo(-21, 1);
  ctx.closePath();
  ctx.fill();

  // Cockpit window
  ctx.fillStyle = engineCol;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(11, -1.5, 3.5, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Engine glow
  ctx.fillStyle = engineCol;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.ellipse(-23, 0, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.ellipse(-28, 0, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
