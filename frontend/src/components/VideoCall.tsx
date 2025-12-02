import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

declare global {
  interface Window {
    peerConnection?: RTCPeerConnection | null;
  }
}

export default function VideoCall() {
  const localRef = useRef<HTMLVideoElement|null>(null);
  const remoteRef = useRef<HTMLVideoElement|null>(null);
  const [incoming, setIncoming] = useState<any>(null);
  const socket = (window as any).__socket; // we will set this in useSocket if needed

  useEffect(() => {
    function onIncoming(e: any) {
      setIncoming(e.detail);
    }
    window.addEventListener('incoming_call', onIncoming as any);
    return () => window.removeEventListener('incoming_call', onIncoming as any);
  }, []);

  async function accept() {
    if (!incoming) return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: (import.meta.env.VITE_STUN_SERVERS || 'stun:stun.l.google.com:19302').split(',') }]});
    window.peerConnection = pc;

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: incoming.type === 'video' });
    localRef.current!.srcObject = localStream;
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

    pc.ontrack = (e) => {
      remoteRef.current!.srcObject = e.streams[0];
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        (window as any).__socket?.emit('ice_candidate', { callId: incoming.callId, toUserId: incoming.fromUserId, candidate: ev.candidate });
      }
    };

    await pc.setRemoteDescription(incoming.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    (window as any).__socket?.emit('accept_call', { callId: incoming.callId, answer }, (ack: any) => {
      console.log('accept ack', ack);
    });
    setIncoming(null);
  }

  function reject() {
    if (!incoming) return;
    (window as any).__socket?.emit('reject_call', { callId: incoming.callId }, (ack: any) => console.log('reject ack', ack));
    setIncoming(null);
  }

  async function end() {
    if (window.peerConnection) {
      window.peerConnection.getSenders().forEach(s => s.track?.stop());
      window.peerConnection.close();
      window.peerConnection = null;
      (window as any).__socket?.emit('end_call', { callId: '' }, (ack: any) => console.log(ack));
    }
  }

  if (!incoming) return <div className="fixed bottom-4 right-4"></div>;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded shadow">
      <div>Incoming {incoming.type} call from {incoming.fromUserId}</div>
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={accept}>Accept</button>
        <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={reject}>Reject</button>
      </div>

      <div className="mt-3">
        <video ref={localRef} autoPlay muted playsInline style={{ width: 160 }} />
        <video ref={remoteRef} autoPlay playsInline style={{ width: 160 }} />
        <div className="mt-2">
          <button onClick={end} className="px-3 py-1 bg-slate-200 rounded">End</button>
        </div>
      </div>
    </div>
  );
}
