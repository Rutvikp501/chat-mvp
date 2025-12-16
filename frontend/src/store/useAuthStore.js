import { create } from "zustand";
import { axiosInstance } from "../api/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useCallStore } from "./useCallStore";
// import { useWebRTCAudio } from "../hooks/useWebRTCCall";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },

 connectSocket: () => {
//   const {
//   handleOffer,
//   handleAnswer,
//   handleCandidate,
// } = useWebRTCAudio();
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

const socket = io(BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  path: "/socket.io",   // 🔥 MUST BE HERE
});



  socket.connect();

  set({ socket });
  window.socket = socket;   // 🔥 GLOBAL SOCKET FIX

// existing event listeners
socket.on("getOnlineUsers", (userIds) => {
  set({ onlineUsers: userIds });
});

// 🔔 Incoming call
socket.on("call:incoming", (payload) => {
  console.log("📞 Incoming call:", payload);
  useCallStore.getState().setIncomingCall(payload);
});

// 📡 WebRTC signaling (FORWARD ONLY)
socket.on("call:offer", (payload) => {
  useCallStore.getState().onRemoteOffer(payload);
});

socket.on("call:answer", (payload) => {
  useCallStore.getState().onRemoteAnswer(payload);
});

socket.on("call:candidate", (payload) => {
  useCallStore.getState().onRemoteCandidate(payload);
});

socket.on("call:ended", () => {
  useCallStore.getState().endCall();
});

},


  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));



