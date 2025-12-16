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

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:candidate", {
          peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    pcRef.current = pc;
    return pc;
  };

  const getLocalAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  };

  const startCall = async (peerId, isCaller) => {
    const pc = createPeerConnection(peerId);
    const stream = await getLocalAudio();

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        calleeId: peerId,
        sdp: offer,
      });
    }
  };

  const handleOffer = async (from, sdp) => {
    const pc = createPeerConnection(from);
    const stream = await getLocalAudio();

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:answer", {
      callerId: from,
      sdp: answer,
    });
  };

  const handleAnswer = async (sdp) => {
    await pcRef.current.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );
  };

  const handleCandidate = async (candidate) => {
    if (candidate) {
      await pcRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  };

  const cleanup = () => {
     socket.emit("call:ended", { peerId });

  pcRef.current?.close();
  pcRef.current = null;

  localStreamRef.current?.getTracks().forEach((t) => t.stop());
  localStreamRef.current = null;
  };

  return {
    remoteAudioRef,
    startCall,
    handleOffer,
    handleAnswer,
    handleCandidate,
    cleanup,
  };
}
