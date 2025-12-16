import { create } from "zustand";
import { axiosInstance } from "../api/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const socket = create((set, get) => ({
connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.connect();

  set({ socket });
  window.socket = socket;   // 🔥 GLOBAL SOCKET FIX

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });
},
}));
// Note: authUser is expected to be set in a separate store (e.g., useAuthStore)
