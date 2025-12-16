import { useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTCAudio() {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const { socket } = useAuthStore.getState();

  const createPeer = (peerId) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("call:candidate", {
          peerId,
          candidate: e.candidate,
        });
      }
    };

 pc.ontrack = (e) => {
  const audio = remoteAudioRef.current;
  if (!audio) return;

  audio.srcObject = e.streams[0];
  audio.muted = false;

  // 🔥 HARD FIX: force play after user gesture
  setTimeout(() => {
    audio.play().catch(() => {});
  }, 100);
};

    pcRef.current = pc;
    return pc;
  };

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  };

  const addTracks = async (pc) => {
    const stream = await getLocalStream();
    stream.getTracks().forEach((track) => {
      if (!pc.getSenders().find((s) => s.track === track)) {
        pc.addTrack(track, stream);
      }
    });
    console.log(
  "🎤 Local tracks:",
  stream.getAudioTracks().map(t => t.enabled)
);
  };

  // ✅ CALLER ONLY
  const startCall = async (peerId) => {
    const pc = createPeer(peerId);
    await addTracks(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", {
      calleeId: peerId,
      sdp: offer,
    });
  };

  // ✅ RECEIVER ONLY
  const handleOffer = async (from, sdp) => {
    const pc = createPeer(from);
    await addTracks(pc);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:answer", {
      callerId: from,
      sdp: answer,
    });
  };

  const handleAnswer = async (sdp) => {
    if (!pcRef.current) return;
    await pcRef.current.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );
  };

  const handleCandidate = async (candidate) => {
    if (!pcRef.current || !candidate) return;
    await pcRef.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  };

  // ✅ FIXED: peerId passed in
 const cleanup = ({ toUserId }) => {
  if (toUserId) {
    socket.emit("call:ended", { toUserId });
  }

  pcRef.current?.close();
  pcRef.current = null;

  localStreamRef.current?.getTracks().forEach((t) => t.stop());
  localStreamRef.current = null;
};

const unlockAudio = () => {
  const AudioContext =
    window.AudioContext || window.webkitAudioContext;

  const ctx = new AudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
};

  return {
    remoteAudioRef,
    startCall,
    handleOffer,
    handleAnswer,
    handleCandidate,
    toggleMute,
    cleanup,
    unlockAudio,
  };
}
