import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '../stores/useUserStore';

const WS_BASE = import.meta.env.VITE_WS_BASE || 'http://localhost:5000';

export function useSocket() {
  const { user } = useUserStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const socket = io(WS_BASE, {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
    });
    socketRef.current = socket;
(window as any).__socket = socket;
(window as any).__socket = null;


    socket.on('disconnect', () => console.log('socket disconnected'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketRef;
}
