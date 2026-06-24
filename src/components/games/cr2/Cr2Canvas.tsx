"use client";

import { useEffect, useRef } from "react";
import type { GamePhase, Difficulty, RoadObject, Particle } from "@/types/cr2";
import {
  buildRoadObjects, LANE_H, NUM_COLS,
  lightenHex, CAR_COLORS, DIFF_CONFIGS,
} from "@/lib/cr2Engine";

interface CR2CanvasProps {
  phase: GamePhase;
  lane: number;
  mult: number;
  diff: Difficulty;
  totalLanes: number;
  onAdvanceRef: React.MutableRefObject<(lane: number, isBarrier: boolean) => void>;
  onDeathRef:   React.MutableRefObject<() => void>;
  onWinRef:     React.MutableRefObject<() => void>;
  onStartRef:   React.MutableRefObject<() => void>;
  onClick: () => void;
}

let particleId = 0;

export default function CR2Canvas({
  phase, lane, mult, diff, totalLanes,
  onAdvanceRef, onDeathRef, onWinRef, onStartRef, onClick,
}: CR2CanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const objectsRef   = useRef<RoadObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const chickenYRef  = useRef(0);
  const targetYRef   = useRef(0);
  const deadAnimRef  = useRef(0);
  const phaseRef     = useRef<GamePhase>("idle");
  const laneRef      = useRef(0);
  const multRef      = useRef(1.0);
  const rafRef       = useRef<number>(0);

  function spawnParticles(x: number, y: number, colors: string[], count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const maxLife = 25 + Math.floor(Math.random() * 25);
      particlesRef.current.push({
        id: ++particleId, x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        r: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: maxLife, maxLife,
      });
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;

    function getLaneY(laneNum: number): number {
      return H - (laneNum - laneRef.current) * LANE_H - LANE_H / 2;
    }

    function chickenScreenX(): number { return (W / NUM_COLS) * 1.5; }

    function resize() {
      W = canvas.width  = canvas.parentElement!.clientWidth;
      H = canvas.height = canvas.parentElement!.clientHeight;
      objectsRef.current = buildRoadObjects(totalLanes, W);
      chickenYRef.current = H - LANE_H * 1.5;
      targetYRef.current  = chickenYRef.current;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();

    // ── Canvas drawing helpers ───────────────────────────────────────────────

    function drawRoad() {
      ctx.fillStyle = "#7a7a6a";
      ctx.fillRect(0, 0, W, H);

      // Subtle texture
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 8) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Vertical lane dividers
      ctx.setLineDash([22, 14]);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 3;
      for (let c = 1; c < NUM_COLS; c++) {
        const lx = (W / NUM_COLS) * c;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Horizontal lane boundaries
      for (let l = laneRef.current - 1; l <= laneRef.current + Math.ceil(H / LANE_H) + 2; l++) {
        const ly = getLaneY(l) - LANE_H / 2;
        if (ly < -10 || ly > H + 10) continue;
        ctx.strokeStyle = "rgba(100,100,80,0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function drawCar(x: number, y: number, color: string) {
      const w = 68, h = 38;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(0, h / 2 + 4, w * 0.45, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      roundRect(ctx, -w / 2, -h / 2, w, h * 0.72, 6); ctx.fill();
      ctx.fillStyle = lightenHex(color, 30);
      roundRect(ctx, -w / 2 + w * 0.15, -h / 2 - h * 0.35, w * 0.7, h * 0.4, 5); ctx.fill();
      ctx.fillStyle = "rgba(150,220,255,0.75)";
      roundRect(ctx, -w / 2 + w * 0.18, -h / 2 - h * 0.28, w * 0.28, h * 0.28, 3); ctx.fill();
      roundRect(ctx, -w / 2 + w * 0.52, -h / 2 - h * 0.28, w * 0.25, h * 0.28, 3); ctx.fill();
      ctx.fillStyle = "#1a1a2e";
      [[-w * 0.3, h * 0.25], [w * 0.3, h * 0.25]].forEach(([wx, wy]) => {
        ctx.beginPath(); ctx.arc(wx, wy, h * 0.24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#444"; ctx.beginPath(); ctx.arc(wx, wy, h * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1a1a2e";
      });
      ctx.fillStyle = "rgba(255,255,160,0.9)";
      ctx.beginPath(); ctx.ellipse(w / 2 - 4, 0, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawTruck(x: number, y: number, color: string) {
      const w = 90, h = 46;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = "#888";
      roundRect(ctx, -w / 2 + w * 0.2, -h / 2, w * 0.7, h * 0.78, 4); ctx.fill();
      ctx.fillStyle = "#aaa";
      roundRect(ctx, -w / 2 + w * 0.22, -h / 2 + 2, w * 0.66, h * 0.74, 3); ctx.fill();
      ctx.fillStyle = "#555";
      roundRect(ctx, -w / 2, -h / 2, w * 0.28, h * 0.8, 5); ctx.fill();
      ctx.fillStyle = "rgba(150,220,255,0.7)";
      roundRect(ctx, -w / 2 + 4, -h / 2 + 3, w * 0.2, h * 0.4, 3); ctx.fill();
      ctx.fillStyle = "#1a1a2e";
      [[-w * 0.35, h * 0.36], [w * 0.1, h * 0.36], [w * 0.35, h * 0.36]].forEach(([wx, wy]) => {
        ctx.beginPath(); ctx.arc(wx, wy, 9, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }

    function drawBus(x: number, y: number) {
      const w = 88, h = 50;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = "#f39c12";
      roundRect(ctx, -w / 2, -h / 2, w, h * 0.8, 6); ctx.fill();
      ctx.fillStyle = "rgba(100,210,255,0.8)";
      for (let i = 0; i < 3; i++) {
        roundRect(ctx, -w / 2 + 10 + i * 26, -h / 2 + 5, 20, h * 0.38, 3); ctx.fill();
      }
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(-w / 2, -h / 2 + h * 0.5, w, 3);
      ctx.fillStyle = "#1a1a2e";
      [[-w * 0.3, h * 0.3], [w * 0.3, h * 0.3]].forEach(([wx, wy]) => {
        ctx.beginPath(); ctx.arc(wx, wy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#444"; ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1a1a2e";
      });
      ctx.restore();
    }

    function drawBarrier(x: number, y: number) {
      const bw = 120, bh = 44;
      const bx = (x % (W - bw) + W) % (W - bw);
      ctx.save();
      ctx.fillStyle = "#888";
      ctx.fillRect(bx + 8, y - bh / 2 + bh * 0.65, 6, bh * 0.4);
      ctx.fillRect(bx + bw - 14, y - bh / 2 + bh * 0.65, 6, bh * 0.4);
      ctx.fillStyle = "#f5a623";
      roundRect(ctx, bx, y - bh / 2, bw, bh * 0.65, 4); ctx.fill();
      ctx.save();
      ctx.beginPath(); roundRect(ctx, bx, y - bh / 2, bw, bh * 0.65, 4); ctx.clip();
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      for (let s = -bw; s < bw * 2; s += 20) {
        ctx.beginPath();
        ctx.moveTo(bx + s, y - bh / 2);
        ctx.lineTo(bx + s + 14, y - bh / 2);
        ctx.lineTo(bx + s + 14 - bh * 0.65, y - bh / 2 + bh * 0.65);
        ctx.lineTo(bx + s - bh * 0.65, y - bh / 2 + bh * 0.65);
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); roundRect(ctx, bx, y - bh / 2, bw, bh * 0.65, 4); ctx.stroke();
      ctx.restore();
    }

    function drawManhole(x: number, y: number) {
      const r = 28;
      ctx.save();
      ctx.fillStyle = "#888";
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#555";
      ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(160,160,160,0.65)"; ctx.lineWidth = 2;
      for (let i = -r + 6; i < r - 6; i += 10) {
        const hw = Math.sqrt(r * r - i * i);
        ctx.beginPath(); ctx.moveTo(x - hw + 4, y + i); ctx.lineTo(x + hw - 4, y + i); ctx.stroke();
      }
      for (let j = -r + 6; j < r - 6; j += 10) {
        const hh = Math.sqrt(r * r - j * j);
        ctx.beginPath(); ctx.moveTo(x + j, y - hh + 4); ctx.lineTo(x + j, y + hh - 4); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(200,200,200,0.25)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r - 1, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    function drawObject(obj: RoadObject) {
      const ly = getLaneY(obj.lane);
      if (ly < -130 || ly > H + 130) return;
      const colX = (W / NUM_COLS) * obj.col + (W / NUM_COLS) / 2;

      if (obj.type === "barrier") { drawBarrier(colX, ly); return; }
      if (obj.type === "manhole") { drawManhole(colX, ly); return; }

      // Moving vehicles
      if (phaseRef.current === "running") {
        obj.x += obj.speed;
        if (obj.x > W + 90) obj.x = -90;
        if (obj.x < -90)    obj.x = W + 90;
      }
      if (obj.type === "car")   { drawCar(obj.x, ly, obj.carColor); return; }
      if (obj.type === "truck") { drawTruck(obj.x, ly, obj.carColor); return; }
      if (obj.type === "bus")   { drawBus(obj.x, ly); return; }
    }

    function drawChicken() {
      const cx = chickenScreenX();
      const cy = chickenYRef.current;
      const t = Date.now() / 800;
      const s = 1.05;

      ctx.save();

      if (phaseRef.current === "dead") {
        ctx.globalAlpha = Math.max(0, 1 - deadAnimRef.current / 40);
        ctx.translate(cx, cy);
        ctx.rotate((deadAnimRef.current / 30) * Math.PI * 0.6);
        deadAnimRef.current++;
      } else {
        const bob = Math.sin(t) * 3 * (phaseRef.current === "running" ? 1 : 0.3);
        ctx.translate(cx, cy + bob);
      }

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath(); ctx.ellipse(0, 28 * s, 24 * s, 6, 0, 0, Math.PI * 2); ctx.fill();

      // Body
      ctx.fillStyle = "#f0f0e8";
      ctx.beginPath(); ctx.ellipse(0, 8 * s, 26 * s, 28 * s, 0, 0, Math.PI * 2); ctx.fill();

      // Feather texture
      ctx.fillStyle = "rgba(225,225,215,0.7)";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.cos(i * 0.8) * 20 * s, Math.sin(i * 0.9) * 18 * s + 8 * s, 5 * s, 8 * s, i * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wings
      ctx.fillStyle = "#e0e0d0";
      ctx.beginPath(); ctx.ellipse(-22 * s, 8 * s, 8 * s, 15 * s, -0.25, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(22 * s, 8 * s, 8 * s, 15 * s, 0.25, 0, Math.PI * 2); ctx.fill();

      // Head
      ctx.fillStyle = "#f5f5ed";
      ctx.beginPath(); ctx.arc(0, -20 * s, 16 * s, 0, Math.PI * 2); ctx.fill();

      // Comb
      ctx.fillStyle = "#e74c3c";
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath(); ctx.arc(c * 5 * s, -34 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#c0392b";
      ctx.beginPath(); ctx.ellipse(0, -30 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();

      // Wattle
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath(); ctx.ellipse(-3 * s, -12 * s, 4 * s, 6 * s, 0.3, 0, Math.PI * 2); ctx.fill();

      // Eye white
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(4 * s, -22 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath(); ctx.arc(5 * s, -22 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(6.5 * s, -23.5 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();

      // Worried eyebrow
      ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(1 * s, -27 * s); ctx.lineTo(8 * s, -29 * s); ctx.stroke();

      // Beak
      ctx.fillStyle = "#f39c12";
      ctx.beginPath();
      ctx.moveTo(-3 * s, -17 * s); ctx.lineTo(2 * s, -14 * s); ctx.lineTo(-3 * s, -11 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#d68910"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-3 * s, -14 * s); ctx.lineTo(2 * s, -14 * s); ctx.stroke();

      // Legs
      ctx.strokeStyle = "#f39c12"; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
      const swing = phaseRef.current === "running" ? Math.sin(Date.now() / 150) * 8 : 0;
      ctx.beginPath(); ctx.moveTo(-6 * s, 22 * s); ctx.lineTo(-8 * s, 36 * s + swing); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6 * s, 22 * s); ctx.lineTo(8 * s, 36 * s - swing); ctx.stroke();
      // Feet
      ctx.lineWidth = 2 * s;
      [[-8 * s, 36 * s + swing], [8 * s, 36 * s - swing]].forEach(([fx, fy]) => {
        ctx.beginPath(); ctx.moveTo(fx - 5 * s, fy); ctx.lineTo(fx + 5 * s, fy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 3 * s, fy + 5 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 3 * s, fy + 5 * s); ctx.stroke();
      });

      ctx.restore();

      // Multiplier badge
      if (phaseRef.current === "running" || phaseRef.current === "idle") {
        drawMultBadge(cx, cy + 52 * s, multRef.current);
      }
    }

    function drawMultBadge(x: number, y: number, m: number) {
      const bw = 90, bh = 36;
      ctx.save();
      ctx.fillStyle = "#2c4a8c";
      ctx.beginPath();
      ctx.moveTo(x - bw / 2 + 8, y - bh / 2);
      ctx.lineTo(x + bw / 2 - 8, y - bh / 2);
      ctx.lineTo(x + bw / 2, y);
      ctx.lineTo(x + bw / 2 - 8, y + bh / 2);
      ctx.lineTo(x - bw / 2 + 8, y + bh / 2);
      ctx.lineTo(x - bw / 2, y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(100,140,255,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#1a2d5a";
      ctx.beginPath();
      ctx.moveTo(x - 8, y - bh / 2 - 4); ctx.lineTo(x + 8, y - bh / 2 - 4);
      ctx.lineTo(x, y - bh / 2 + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px 'Arial Rounded MT Bold',Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(m.toFixed(2) + "x", x, y);
      ctx.restore();
    }

    function drawParticles() {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
    }

    // ── Main loop ──────────────────────────────────────────────────────────

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);

      // Smooth chicken movement
      chickenYRef.current += (targetYRef.current - chickenYRef.current) * 0.16;

      drawRoad();

      // Draw objects bottom-first
      [...objectsRef.current]
        .sort((a, b) => b.lane - a.lane)
        .forEach(drawObject);

      drawChicken();
      drawParticles();
    }

    rafRef.current = requestAnimationFrame(loop);

    // ── Exposed callbacks ────────────────────────────────────────────────────

    onStartRef.current = () => {
      deadAnimRef.current = 0;
      objectsRef.current = buildRoadObjects(totalLanes, W);
      chickenYRef.current = H - LANE_H * 1.5;
      targetYRef.current  = chickenYRef.current;
      spawnParticles(chickenScreenX(), chickenYRef.current, ["#ffd700","#fff"], 8);
    };

    onAdvanceRef.current = (newLane: number, isBarrier: boolean) => {
      targetYRef.current = H - (newLane + 0.5) * LANE_H;
      spawnParticles(
        chickenScreenX(), targetYRef.current,
        isBarrier ? ["#22c55e","#ffd700","#fff"] : ["#ffd700","#fff"],
        isBarrier ? 14 : 7
      );
    };

    onDeathRef.current = () => {
      deadAnimRef.current = 0;
      spawnParticles(chickenScreenX(), chickenYRef.current, ["#e74c3c","#fff","#f5f5ed"], 22);
    };

    onWinRef.current = () => {
      spawnParticles(chickenScreenX(), chickenYRef.current, ["#ffd700","#22c55e","#fff"], 30);
      objectsRef.current = buildRoadObjects(totalLanes, W);
      targetYRef.current  = H - LANE_H * 1.5;
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync props → refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { laneRef.current  = lane;  }, [lane]);
  useEffect(() => { multRef.current  = mult;  }, [mult]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: "pointer" }}
    />
  );
}

// ── Canvas roundRect polyfill ─────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}