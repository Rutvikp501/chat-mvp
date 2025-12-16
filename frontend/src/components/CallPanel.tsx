
export function CallPanel({ socket, currentRoom, peerUser }) {
  const {
    initCall,
    handleIncomingOffer,
    handleAnswer,
    addIceCandidate,
    endCall,
    remoteStream,
    localStreamRef,
  } = useWebRTCPeer(socket.current, /* localUserId */ '');

  // bind socket listeners similar to MDN example

  // UI: local + remote video, mute/camera/end buttons
}
