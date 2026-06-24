"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FeaturedGameProps {
  title: string;
  provider: string;
  rtp: number;
  imageUrl: string;
  category?: string;
}

export default function FeaturedGame({
  title,
  provider,
  rtp,
  imageUrl,
  category = "Casino",
}: FeaturedGameProps) {
  const route = useRouter();

  return (
    <section className="pt-3 pb-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Home</span>
        <span className="text-white/30">/</span>
        <span className="text-white/70">{category}</span>
      </div>

      {/* Card */}
      <div className="flex gap-4 items-center bg-white/5 rounded-2xl p-3 border border-white/10">
        {/* Game Thumbnail */}
        <div className="relative w-[130px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-300 font-black text-lg leading-tight drop-shadow-lg">
                {title.split(" ").map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative coin glow */}
          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
            <button className="text-white/30 hover:text-yellow-400 transition-colors ml-2 flex-shrink-0">
              <Star className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/50 text-xs mb-3">
            {provider} · <span className="text-green-400 font-medium">RTP: {rtp}%</span>
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={()=>route.push("/heads-tails")}
              className="flex-1 bg-[#f5a623] hover:bg-[#e09410] text-black font-bold rounded-xl text-sm h-9"
            >
              Play
            </Button>
            {/* <Button
              size="sm"
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl text-sm h-9 bg-transparent"
            >
              Demo
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
