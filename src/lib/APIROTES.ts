export const BASE_URL = process.env.BASE_URL || "http://187.127.186.116:80";

export const REGISTER_NUMBER = `${BASE_URL}/auth/register-number`;
export const VERIFY_OTP = `${BASE_URL}/auth/verify-otp`;
export const REGISTER_USER = `${BASE_URL}/auth/register-user`;
export const LOGIN = `${BASE_URL}/auth/login`;

export const GET_PROFILE = `${BASE_URL}/user/profile`;

export const GET_WALLET = `${BASE_URL}/wallet/my`;

export const DEPOSIT = `${BASE_URL}/wallet/deposit`;
export const MY_DEPOSIT = `${BASE_URL}/wallet/my-deposit`;
export const GET_ALL_DEPOSITS = `${BASE_URL}/wallet/all-deposits`;

