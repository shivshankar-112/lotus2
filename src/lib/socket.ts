// lib/socket.ts
import { io } from "socket.io-client";
import { BASE_URL } from "./APIROTES";

export const socket = io(
  process.env.NEXT_PUBLIC_API_URL! || BASE_URL,
  {
    withCredentials: true,
  }
);