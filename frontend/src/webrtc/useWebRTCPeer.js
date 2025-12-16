import { useRef, useState } from "react";

export function useWebRTCCall() {
  const pc = useRef(null);
  const localStream = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const createPC = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    peer.onicecandidate = (e) => {
      if (e.candidate)
        window.socket.emit("call:ice-candidate", e.candidate);
    };

    return peer;
  };

  const startLocalStream = async (type) => {
    localStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video"
    });
  };

  return {
    pc,
    localStream,
    remoteStream,
    createPC,
    startLocalStream
  };
}
