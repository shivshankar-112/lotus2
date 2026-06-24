export interface User {
  id: string;
  phone: string;
  displayName: string;
  balance?:number;
  // username: string;
  avatar: string;         // emoji or url

  joinedAt: string;       // ISO date string
  kycVerified: boolean;
  // vipLevel: number;       // 0–5
  // referralCode: string;
  // lastSeen: string;
}

export interface Wallet {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  pnl: number;
}

export type AuthStep =
  | "phone"          // enter mobile number
  | "otp"            // enter OTP
  | "register"       // new user — fill username + optional referral
  | "done";          // authenticated

export interface AuthState {
  step: AuthStep;
  phone: string;
  isNewUser: boolean;
  isLoading: boolean;
  error: string | null;

  receivedOtp?: string;
}
