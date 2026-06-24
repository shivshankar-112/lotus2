"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function Navbar() {
  const route = useRouter();
  const [user, setUser] = useState<any>();
  const [authorised, setAuthorised] = useState<boolean>();

  const { verifyUser } = useAuth();

  const checkUser = async() => {
    const { user, authorised } = await verifyUser();
    if (!authorised) return setAuthorised(false);

    setAuthorised(true);
    setUser(user);
  }

  useEffect(() => {
    checkUser();
  }, [verifyUser])

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f1117]/95 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <span className="text-[#f5a623] font-black text-2xl tracking-tight font-['Orbitron',sans-serif]">
          LOTUS<span className="text-white">24</span>
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-4 text-sm font-semibold relative"
          >
            Bonus
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f1117]" />
          </Button>

          <Button
            variant="outline"
            onClick={() => route.push("/auth/login")}
            size="sm"
            className={`${authorised && "hidden"} border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-black rounded-full px-4 text-sm font-bold bg-transparent`}
          >
            Log In
          </Button>

          <Button
            size="sm"
            onClick={() => route.push("/auth")}
            className={`${authorised && "hidden"} bg-[#f5a623] hover:bg-[#e09410] text-black rounded-full px-4 text-sm font-bold`}
          >
            Join Us
          </Button>

           <Button
            variant="outline"
            onClick={() => route.push("/profile")}
            size="sm"
            className={`${!authorised && "hidden"} border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-black rounded-full px-4 text-sm font-bold bg-transparent`}
          >
            {user?.name || "Profile"}
          </Button>
        </div>
      </div>
    </header>
  );
}
