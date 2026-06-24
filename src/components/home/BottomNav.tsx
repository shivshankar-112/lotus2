"use client";

import { Home, Menu, LayoutGrid, Plane, Trophy, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: Home, link:"/home" },
  // { id: "menu", label: "Menu", Icon: Menu },
  { id: "games", label: "All Games", Icon: LayoutGrid, link:"/home" },
  { id: "aviator", label: "Aviator", Icon: Plane , link:"/aviator"},
  { id: "wallet", label: "Wallet", Icon: Wallet, link:"/wallet" },
];

export default function BottomNav() {
  const route =  useRouter();
  const [active, setActive] = useState("home");

  function handleClick(id:string, link:string){
    route.push(link);

    setActive(id)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1117]/98 backdrop-blur-md border-t border-white/10">
      <div className="flex items-stretch max-w-md mx-auto">
        {NAV_ITEMS.map(({ id, link, label, Icon }) => {
          const isActive = active === id;
          const isAviator = id === "aviator";

          return (
            <button
              key={id}
              onClick={() => handleClick(id,link )}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative",
                isActive && !isAviator && "text-[#f5a623]",
                !isActive && "text-white/40 hover:text-white/70",
                isActive && isAviator && "text-red-500"
              )}
            >
              {/* Active indicator line */}
              {isActive && (
                <span
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full",
                    isAviator ? "bg-red-500" : "bg-[#f5a623]"
                  )}
                />
              )}
              <Icon
                className={cn(
                  "transition-transform",
                  isActive ? "w-5 h-5 scale-110" : "w-5 h-5"
                )}
              />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
