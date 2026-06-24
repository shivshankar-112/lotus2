"use client";

import { ChevronRight } from "lucide-react";
import GameCard from "./GameCard";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  title: string;
  provider?: string;
  rtp?: number;
  badge?: string;

  bannerUrl?:string;
  gameLink?:string;
}

interface GameSectionProps {
  title: string;
  games: Game[];
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  cardSize?: "sm" | "md" | "lg";
  className?: string;
}

export default function GameSection({
  title,
  games,
  showSeeAll = false,
  onSeeAll,
  cardSize = "sm",
  className,
}: GameSectionProps) {
  return (
    <section className={cn("pt-4 pb-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-white font-bold text-base">{title}</h3>
        {showSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-[#f5a623] text-sm font-semibold hover:text-[#e09410] transition-colors"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable row */}
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory">
        {games.map((game) => (
          <div key={game.id} className="snap-start">
            <GameCard
              title={game.title}
              provider={game.provider}
              rtp={game.rtp}
              imageUrl={game?.bannerUrl || ""}
              badge={game.badge}
              size={cardSize}

              gameLink={game.gameLink}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
