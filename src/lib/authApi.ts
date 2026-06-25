import type { User } from "@/types/auth";
import axios from "axios";
import { REGISTER_NUMBER, REGISTER_USER, VERIFY_OTP } from "./APIROTES";


// Fixed demo OTP for all numbers in demo mode
export const DEMO_OTP = "123456";

// ── API adapter ───────────────────────────────────────────────────────────────
// Each function has a DEMO block + commented REAL API block.
// Replace demo blocks with real API calls to go live.

/** Step 1: Send OTP to phone number. Returns whether user exists. */
export async function sendOtp(phone: string): Promise<{ isNewUser: boolean, receivedOtp: string }> {
  // DEMO MODE
  // await new Promise((r) => setTimeout(r, 1200));
  // const isNewUser = !DEMO_USERS[phone];
  // console.log(`[Demo] OTP sent to ${phone}: ${DEMO_OTP}`);
  // return { isNewUser };

  // REAL API:
  const { data } = await axios.post(REGISTER_NUMBER, { phone });
  if (!data.success) throw new Error("Failed to send OTP");
  return { isNewUser: false, receivedOtp: data.data?.otp };
}

/** Step 2: Verify OTP. Returns user if existing, null if new. */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ valid: boolean; user: User | null }> {
  // DEMO MODE
  // await new Promise((r) => setTimeout(r, 1000));
  // if (otp !== DEMO_OTP) return { valid: false, user: null };
  // const user = DEMO_USERS[phone] ?? null;
  // return { valid: true, user };

  // REAL API:
  const { data } = await axios.post(VERIFY_OTP, { phone, otp })
  console.log(data)
  if (!data.success) throw new Error("OTP verification failed");

  return { valid: data.data?.isVerified, user: null };

}

/** Step 3 (new users only): Complete registration. */
export async function registerUser(
  phone: string,
  username: string,
  password: string,
  referralCode?: string
): Promise<{ token: string, user: User, wallet: any }> {
  // DEMO MODE
  // await new Promise((r) => setTimeout(r, 1200));
  // const newUser: User = {
  //   id: `u_${Date.now()}`,
  //   phone,
  //   displayName: username,
  //   username: username.toLowerCase().replace(/\s+/g, "_"),
  //   avatar: ["🎲", "🎰", "🃏", "♠️", "🏆"][Math.floor(Math.random() * 5)],
  //   balance: 100,            // welcome bonus
  //   totalDeposited: 0,
  //   totalWithdrawn: 0,
  //   totalBets: 0,
  //   totalWins: 0,
  //   totalLosses: 0,
  //   pnl: 0,
  //   joinedAt: new Date().toISOString(),
  //   kycVerified: false,
  //   vipLevel: 0,
  //   referralCode: phone.slice(-4).toUpperCase() + "NEW",
  //   lastSeen: new Date().toISOString(),
  // };
  // DEMO_USERS[phone] = newUser;
  // return newUser;

  // REAL API:11
  try {
    console.log("pass in api", password)
    const { data: res } = await axios.post(REGISTER_USER, { phone, name: username, password, referralCode }, { withCredentials: true });
    console.log(res)
    if (!res.success) throw new Error(res.message || "Registration failed");
    
    const { name, _id } = res.data.user;
    localStorage.setItem("user", JSON.stringify({ name, id: _id }))

    const { token, wallet, user } = res.data;
    return { token, wallet, user };
  } catch (error: any) {
    throw new Error(error.response?.data.message || error.message || "Registration failed")
  }

}

/** Resend OTP */
export async function resendOtp(phone: string): Promise<void> {
  // DEMO MODE
  await new Promise((r) => setTimeout(r, 800));
  console.log(`[Demo] OTP re-sent to ${phone}: ${DEMO_OTP}`);

  // REAL API:
  // await fetch("/api/auth/resend-otp", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ phone }),
  // });
}

// ── VIP level metadata ────────────────────────────────────────────────────────

export const VIP_LEVELS = [
  { level: 0, name: "Bronze", color: "#cd7f32", minBets: 0 },
  { level: 1, name: "Silver", color: "#9ca3af", minBets: 50 },
  { level: 2, name: "Gold", color: "#fbbf24", minBets: 150 },
  { level: 3, name: "Platinum", color: "#7dd3fc", minBets: 400 },
  { level: 4, name: "Diamond", color: "#c084fc", minBets: 1000 },
  { level: 5, name: "Elite", color: "#ef4444", minBets: 3000 },
];

export function getVipInfo(level: number) {
  return VIP_LEVELS[Math.min(level, 5)];
}
