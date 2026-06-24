"use client"
import { setUser } from "@/app/store/features/userSlice";
import { fetchWallet } from "@/app/store/features/walletSlice";
import { LOGIN } from "@/lib/APIROTES";
import axios from "axios";
import { AlertCircle, ChevronDown, Eye, EyeOff, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";



const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "SG" },
];

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [showDD, setShowDD] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const [error, setError] = useState<{ phone: string | null; password: string | null; api: string | null }>({ phone: null, password: null, api: null });
  const [isLoading, setIsloading] = useState(false);

  function handlePhone(v: string) {
    setPhone(v.replace(/\D/g, "").slice(0, 10));
    setError(prev=>({...prev, phone:null}));
  }
  function handlePass(v: string) {
    setPassword(v);
    setError(prev=>({...prev, password:null}));
  }

  async function onSubmit(
    phone: string,
    code: string,
    password: string
  ) {

    // clear previous api error
    setError((prev) => ({
      ...prev,
      api: null
    }));


    // phone validation
    if (phone.trim().length !== 10) {
      setError((prev) => ({
        ...prev,
        phone: "Invalid mobile number"
      }));
      return;
    }

    // password validation
    if (password.trim().length < 6) {
      setError((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters"
      }));
      return;
    }

    try {
      setIsloading(true);
      const { data: res } = await axios.post(
        LOGIN,
        {
          phone,
          password
        },
        {
          withCredentials: true
        }
      );

      // save user in redux
      dispatch(setUser(res.data?.user));
      dispatch(fetchWallet());
      console.log(res);
      const {name, _id} = res.data?.user;
      localStorage.setItem("user", JSON.stringify({name, id:_id}) )

      // optional success log
      console.log("Login successful");
      // redirect
      router.push("/home");

    } catch (error: any) {
      console.log(error.response || error);
      setError((prev) => ({
        ...prev,
        api:
          error.response?.data?.message ||
          "Something went wrong"
      }));

    } finally {
      setIsloading(false);
    }
  }

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
            {"Welcome Back"}
          </h1>

          {error.api && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl border  border-red-500/30  bg-red-500/10 px-4 py-3  text-red-400 animate-in fade-in duration-300"
            >
              <AlertCircle size={18} />

              <p className="text-sm font-medium">
                {error.api}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* mobile no */}
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", display: "block", marginBottom: 10 }}>
              Mobile Number
            </label>

            <div className="flex gap-2">
              {/* Country picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDD((v) => !v)}
                  className="flex items-center gap-1.5 h-12 px-3 rounded-xl border font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", whiteSpace: "nowrap" }}
                >
                  <span>{country.flag}</span>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11 }}>{country.code}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {showDD && (
                  <div
                    className="absolute top-14 left-0 z-50 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#1a1d2e", border: "1px solid rgba(255,255,255,0.12)", minWidth: 160 }}
                  >
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setCountry(c); setShowDD(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: country.code === c.code ? "#fbbf24" : "rgba(255,255,255,0.75)" }}
                      >
                        <span>{c.flag}</span>
                        <span className="font-semibold">{c.name}</span>
                        <span className="ml-auto opacity-50" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11 }}>{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone input */}
              <div className="flex-1 relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => handlePhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && onSubmit(phone, country.code, password)}
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  className="w-full h-12 rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: error.phone ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "1px",
                  }}
                />
                {phone.length > 0 && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif" }}>
                    {phone.length}/10
                  </span>
                )}
              </div>
            </div>

            {error.phone ? (
              <p className="mt-2 text-xs font-semibold" style={{ color: "#f87171" }}>{error.phone}</p>
            ) : ""}
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", display: "block", marginBottom: 10 }}>
              Password
            </label>
            <div className="relative">
              <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePass(e.target.value)}

                onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && onSubmit(phone, country.code, password)}
                placeholder="Password"
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm font-semibold outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: error.password ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              />

              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold "
                style={{ color: "rgba(255,255,255,0.6" }}
              >
                {!showPassword ? <Eye className={`size-5`} onClick={() => setShowPassword(true)} /> : <EyeOff className={`size-5`} onClick={() => setShowPassword(false)} />}
              </span>

            </div>
            {error.password ? (
              <p className="mt-2 text-xs font-semibold" style={{ color: "#f87171" }}>{error.password}</p>) : ""
            }
          </div>


          <button
            type="button"
            onClick={() => onSubmit(phone, country.code, password)}
            disabled={isLoading || (phone.length !== 10 || password.length < 6)}
            className="w-full h-12 rounded-xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: "1px",
              background: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
              color: "#1a0a00",
              boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                logining...
              </span>
            ) : (
              "LOGIN →"
            )}
          </button>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.5 }}>
            By continuing, you agree to our{" "}
            <span style={{ color: "rgba(251,191,36,0.6)", cursor: "pointer" }}>Terms of Service</span>{" "}
            and{" "}
            <span style={{ color: "rgba(251,191,36,0.6)", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>


      </div>
    </div>
  );
}
