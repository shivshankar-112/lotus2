"use client";

export default function WalletSkeleton() {
  return (
    <div className="animate-pulse px-4 space-y-4 pt-4">
      {/* Balance hero skeleton */}
      <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="h-3 w-20 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-10 w-40 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>
      </div>

      {/* P&L card */}
      <div className="h-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="h-24 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }} />
        ))}
      </div>
    </div>
  );
}
