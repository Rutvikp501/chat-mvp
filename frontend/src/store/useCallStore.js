import { create } from "zustand";
console.log("🔥 useCallStore loaded");
export const useCallStore = create((set, get) => ({
__version: "callstore-v3",
  // ===== CALL STATE =====
endCall: () => {
  set({
    activeCall: null,
    incomingCall: null,
    outgoingCall: null,
  });
},


  // ===== INITIATE DIRECT CALL (1-1) =====
initiateDirectCall: async (user, type) => {
  try {
    // Step 1: Create call entry in backend
    const res = await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: user._id,
        type,
      }),
    });

    const call = await res.json();

    // Step 2: Set outgoing UI
    set({ outgoingCall: { ...call, receiver: user } });

    // Step 3: Emit REAL signaling event
    window.socket.emit("call:offer", {
      calleeId: user._id,
      roomId: null,  
      sdp: null,
    });

    console.log("Outgoing call started:", call);

  } catch (err) {
    console.error("Failed to start call:", err);
  }
},


  // ===== INCOMING CALL HANDLERS =====

acceptIncomingCall: () => {
  const call = get().incomingCall;
  if (!call) return;

  // callerId = user who initiated the call
  const callerId = call.from;

  // For now sdp is null – WebRTC SDP will be added later
  window.socket.emit("call:answer", {
    callerId,
    sdp: null,
  });

  set({ activeCall: call, incomingCall: null });
},

  declineIncomingCall: () => {
    const call = get().incomingCall;
    if (!call) return;

    window.socket.emit("call:decline", { callId: call._id });

    set({ incomingCall: null });
  },


  // ===== OUTGOING CALL HANDLERS =====
  setOutgoingCall: (call) => set({ outgoingCall: call }),

  cancelOutgoingCall: () => {
    const call = get().outgoingCall;
    if (!call) return;

    window.socket.emit("call:end", { callId: call._id });

    set({ outgoingCall: null });
  },


  // ===== END CALL (any type) =====
  endCall: () => {
    const call = get().activeCall || get().outgoingCall;
    if (!call) return;

    window.socket.emit("call:end", { callId: call._id });

    set({
      incomingCall: null,
      outgoingCall: null,
      activeCall: null,
    });
  },


  // ===== SOCKET: when someone calls you =====
setIncomingCall: async (callPayload) => {
  try {
    const { from } = callPayload;

    // Fetch caller info from correct backend URL
    const res = await fetch(`/api/auth/user/${from}`, {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to fetch caller info", res.status);
      return set({
        incomingCall: {
          ...callPayload,
          callerInfo: { fullName: "Unknown", profilePic: null },
        }
      });
    }

    const caller = await res.json();

    set({
      incomingCall: {
        ...callPayload,
        callerInfo: {
          fullName: caller.fullName,
          profilePic: caller.profilePic,
          _id: caller._id,
        },
      },
    });
  } catch (err) {
    console.error("Failed to load caller info:", err);
  }
},


setActiveCall: (payload) => {
  set({
    activeCall: payload,
    outgoingCall: null,
    incomingCall: null,
  });
},
  remoteOffer: null,
  remoteAnswer: null,
  remoteCandidate: null,

  onRemoteOffer: (payload) => {
    set({ remoteOffer: payload });
  },

  onRemoteAnswer: (payload) => {
    set({ remoteAnswer: payload });
  },

  onRemoteCandidate: (payload) => {
    set({ remoteCandidate: payload });
  },
}));

// Note: authUser is expected to be set in a separate store (e.g., useAuthStore)
