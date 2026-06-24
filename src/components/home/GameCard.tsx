"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GameCardProps {
  title: string;
  provider?: string;
  rtp?: number;
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  accentColor?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";

  gameLink?: string;
}

const colorMap: Record<string, string> = {
  egypt: "from-amber-900 via-yellow-800 to-orange-700",
  penalty: "from-green-900 via-emerald-800 to-teal-700",
  magic: "from-purple-900 via-violet-800 to-indigo-700",
  aviator: "from-gray-900 via-red-950 to-gray-800",
  jetx: "from-slate-900 via-blue-950 to-cyan-900",
  default: "from-gray-800 via-gray-700 to-gray-600",
};

function getGradient(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("egypt")) return colorMap.egypt;
  if (lower.includes("penalty")) return colorMap.penalty;
  if (lower.includes("magic")) return colorMap.magic;
  if (lower.includes("aviator")) return colorMap.aviator;
  if (lower.includes("jet")) return colorMap.jetx;
  return colorMap.default;
}

export default function GameCard({
  title,
  provider,
  rtp,
  badge,
  onClick,
  className,
  size = "sm",
  imageUrl,

  gameLink
}: GameCardProps) {
  const gradient = getGradient(title);
  const route = useRouter();

  const navigate = (link: string | undefined) => {
    if (!link) return toast.error("Feature commong soon...")
      
    route.push(link);
  }

  return (
    <button
      onClick={() => onClick || navigate(gameLink)}
      className={cn(
        "group relative flex-0 rounded-sm overflow-hidden cursor-pointer",
        " hover:border border-white/10 hover:border-[#f5a623]/50",
        "transition-all duration-200 active:scale-95",
        size === "sm" && "w-27.25",
        size === "md" && "w-37.5",
        size === "lg" && "w-full",
        className
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "relative w-full bg-linear-to-br",
          // gradient,
          size === "sm" && "h-21.25",
          size === "md" && "h-27.25",
          size === "lg" && "h-35"
        )}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-sm rotate-45" />
            </div>
          </div>
        )}

        {/* Game name overlay */}
        {/* <div className="absolute inset-0 flex items-center justify-center p-2">
          <span
            className={cn(
              "text-white font-black text-center drop-shadow-lg leading-tight",
              size === "sm" && "text-[11px]",
              size === "md" && "text-sm",
              size === "lg" && "text-base"
            )}
          >
            {title}
          </span>
        </div> */}

        <div className="max-h-full rounded-md bg-amber-50 overflow-hidden">
          <Image src={imageUrl || "/games-banner/aviator.jpg"} alt={title} width={100} height={100} className="w-full h-full object-center object-cover" />
        </div>

        {/* Shine overlay on hover */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      {(provider || rtp) && (
        <div className="px-2 py-2 text-left">
          <p className="text-white/90 text-xs font-semibold truncate">{title}</p>
          {provider && (
            <p className="text-white/40 text-[10px] truncate">
              {provider}
              {rtp && (
                <span className="text-green-400 ml-1">· {rtp}%</span>
              )}
            </p>
          )}
        </div>
      )}
    </button>
  );
}
