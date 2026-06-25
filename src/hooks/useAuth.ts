"use client";

import { useState, useCallback, useRef } from "react";
import type { AuthState, AuthStep, User } from "@/types/auth";
import { sendOtp, verifyOtp, registerUser, resendOtp } from "@/lib/authApi";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/app/store/features/userSlice";
import { RootState } from "@/app/store/store";
import { clearWallet, setWallet } from "@/app/store/features/walletSlice";
import axios from "axios";
import { BASE_URL } from "@/lib/APIROTES";
import { useRouter } from "next/navigation";

interface UseAuthReturn {
  state: AuthState;
  user: User | null;
  submitPhone: (phone: string, countryCode: string) => Promise<void>;
  submitOtp: (otp: string) => Promise<void>;
  submitRegistration: (username: string, password: string, referralCode?: string) => Promise<void>;
  resendCode: () => Promise<void>;
  goBack: () => void;
  logout: () => void;
  otpResendLeft: number;

  verifyUser: () => Promise<{ user: any, authorised: boolean }>
}

export function useAuth(): UseAuthReturn {
  const route = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.data);

  const [state, setState] = useState<AuthState>({
    step: "phone",
    phone: "",
    isNewUser: false,
    isLoading: false,
    error: null,
  });

  const [otpResendLeft, setOtpResendLeft] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const setError = (error: string | null) =>
    setState((s) => ({ ...s, error, isLoading: false }));

  const setLoading = (isLoading: boolean) =>
    setState((s) => ({ ...s, isLoading, error: null }));

  // Start resend countdown (30s)
  const startResendTimer = useCallback(() => {
    setOtpResendLeft(30);
    if (resendTimer.current) clearInterval(resendTimer.current);
    resendTimer.current = setInterval(() => {
      setOtpResendLeft((n) => {
        if (n <= 1) { clearInterval(resendTimer.current!); return 0; }
        return n - 1;
      });
    }, 1000);
  }, []);

  // Step 1: Submit phone
  const submitPhone = useCallback(async (phone: string, countryCode: string) => {
    if (phone.length < 10) { setError("Enter a valid 10-digit mobile number"); return; }
    setLoading(true);
    try {
      const fullPhone = phone.replace(/\D/g, "");

      const { isNewUser, receivedOtp } = await sendOtp(fullPhone);
      console.log(isNewUser, receivedOtp, "-- logo log")
      setState((s) => ({
        ...s,
        step: "otp",
        phone: fullPhone,
        isNewUser,
        isLoading: false,
        error: null,

        receivedOtp
      }));
      startResendTimer();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send OTP. Try again.");
    }
  }, [startResendTimer]);

  // Step 2: Submit OTP
  const submitOtp = useCallback(async (otp: string) => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const { valid, user: existingUser } = await verifyOtp(state.phone, otp);
      if (!valid) { setError("Incorrect OTP. Please try again."); return; }
      if (existingUser) {
        dispatch(setUser(existingUser));
        setState((s) => ({ ...s, step: "done", isLoading: false, error: null }));
      } else {
        setState((s) => ({ ...s, step: "register", isLoading: false, error: null }));
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "OTP verification failed. Try again.");
    }
  }, [state.phone]);

  // Step 3: Complete registration
  const submitRegistration = useCallback(async (username: string, password: string, referralCode?: string) => {
    if (username.trim().length < 3) { setError("Username must be at least 3 characters"); return; }
    setLoading(true);
    try {
      const { token, wallet, user } = await registerUser(state.phone, username.trim(), password, referralCode);
      console.log(wallet,user,token, "lko")
      dispatch(setUser(user));
      dispatch(setWallet(wallet));

      console.log("aft did")

      setState((s) => ({ ...s, step: "done", isLoading: false, error: null }));
      route.push("/home")
    } catch (error: any) {
      console.log(error)
      setError(error.response?.data?.message || "Registration failed. Try again.");
    }
  }, [state.phone]);

  const verifyUser = useCallback(async () => {
    try {
      const { data: res } = await axios.post(`${BASE_URL}/auth/verify-me`, {}, { withCredentials: true });
      const jsonUser = localStorage.getItem("user");
      if (!jsonUser) return { user: null, authorised: false };

      return { user: JSON.parse(jsonUser), authorised: true };
    } catch (error) {
      console.log("error from verify user", error);
      return { user: null, authorised: false }
    }
  }, [])






  // Resend OTP
  const resendCode = useCallback(async () => {
    if (otpResendLeft > 0) return;
    try {
      await resendOtp(state.phone);
      startResendTimer();
    } catch {
      setError("Could not resend OTP.");
    }
  }, [state.phone, otpResendLeft, startResendTimer]);

  // Navigation
  const goBack = useCallback(() => {
    setState((s) => ({
      ...s,
      step: s.step === "otp" || s.step === "register" ? "phone" : s.step,
      error: null,
    }));
  }, []);

  const logout = useCallback(() => {
    dispatch(clearUser());
    dispatch(clearWallet());
    setState({ step: "phone", phone: "", isNewUser: false, isLoading: false, error: null });
  }, []);

  return { state, user, submitPhone, submitOtp, submitRegistration, resendCode, goBack, logout, otpResendLeft, verifyUser };
}
