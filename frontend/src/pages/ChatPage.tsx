import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import VideoCall from '../components/VideoCall';
import AvatarUploader from '../components/AvatarUploader';
import LanguageSelector from '../components/LanguageSelector';
import FileUploader from '../components/FileUploader';
import { useSocket } from '../hooks/useSocket';
import { useUserStore } from '../stores/useUserStore';
import api from '../api/api';
import type { Message, Conversation } from '../types';
import dayjs from 'dayjs';

export default function ChatPage() {
  const socketRef = useSocket();
  const user = useUserStore(s => s.user);
  const [activeConv, setActiveConv] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  const socket = socketRef.current;

  React.useEffect(() => {
    if (!socket) return;
    // conversation-level message
    socket.on('message', (msg: Message) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('direct_message', (payload: any) => {
      // if current user receives a direct message for current conversation, show it
      if (activeConv && payload.conversationId === activeConv._id) {
        const m: Message = { _id: payload._id, conversationId: payload.conversationId, sender: payload.sender, text: payload.translatedText, translations: { [payload.lang]: payload.translatedText }, createdAt: payload.createdAt };
        setMessages(prev => [...prev, m]);
      }
    });

    socket.on('typing', ({ userId }) => {
      // show typing indicator (simple)
      console.log('typing', userId);
    });

    socket.on('stop_typing', ({ userId }) => {
      console.log('stop_typing', userId);
    });

    socket.on('user_online', ({ userId }) => console.log('online', userId));
    socket.on('user_offline', ({ userId }) => console.log('offline', userId));

    // incoming call (opens VideoCall UI)
    socket.on('incoming_call', (payload) => {
      console.log('incoming_call', payload);
      // pass to VideoCall via state or global event
      window.dispatchEvent(new CustomEvent('incoming_call', { detail: payload }));
    });

    return () => {
      socket.off('message');
      socket.off('direct_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('incoming_call');
    };
  }, [socket, activeConv]);

  // load messages when activeConv changes
  React.useEffect(() => {
    if (!activeConv) return;
    setLoading(true);
    api.get(`/conversations/${activeConv._id}/messages?limit=50`).then(res => {
      setMessages(res.data.messages.reverse()); // API returned descending — reverse for UI
      setLoading(false);
      // join conv room
      socketRef.current?.emit('join_conversation', { conversationId: activeConv._id });
    });
  }, [activeConv]);

  async function sendMessage(text: string, attachments = []) {
    const s = socketRef.current;
    if (!s || !activeConv) return;
    s.emit('send_message', { conversationId: activeConv._id, text, attachments }, (ack: any) => {
      if (ack?.error) console.error('send failed', ack.error);
    });
  }

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div>
              <AvatarUploader />
            </div>
            <div>
              <div className="font-bold">{user?.displayName || user?.username}</div>
              <div className="text-sm text-slate-500">{user?.preferredLang}</div>
            </div>
          </div>
          <div className="mt-4">
            <LanguageSelector lang={user?.preferredLang || 'en'} onChange={async (l) => {
              await api.post('/me/preferred-lang', { preferredLang: l });
              // refresh user
              const me = await api.get('/me'); useUserStore.getState().setUser(me.data.user);
            }} />
          </div>
        </div>
        <Sidebar onSelect={(c) => setActiveConv(c)} />
      </aside>
      <main className="main flex flex-col">
        {!activeConv ? <div className="m-auto">Select a conversation</div> : (
          <>
            <div className="flex gap-4 items-center mb-2">
              <h3 className="text-lg">{activeConv.title || 'Conversation'}</h3>
              <div className="text-sm text-slate-500">{activeConv.isGroup ? 'Group' : 'Direct'}</div>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-3">
              {loading ? <div>Loading...</div> : messages.map(m => (
                <div key={m._id} className={`flex ${m.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`message-bubble ${m.sender === user?.id ? 'message-from-me' : 'message-from-other'}`}>
                    <div className="text-sm">{m.text}</div>
                    <div className="text-xs text-slate-400 mt-1">{dayjs(m.createdAt).format('HH:mm')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t bg-white">
              <div className="flex gap-2 items-center">
                <FileUploader onUpload={(attachment) => {
                  // send empty text with attachment
                  sendMessage('', [attachment]);
                }} />
                <input id="msg" className="flex-1 p-2 border rounded" placeholder="Type a message" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    sendMessage(val);
                    (e.target as HTMLInputElement).value = '';
                  } else {
                    // emit typing
                    socketRef.current?.emit('typing', { conversationId: activeConv._id });
                  }
                }} />
                <button onClick={() => {
                  // call user example: pick other member
                  const other = activeConv.members.find(m => m !== user?.id);
                  if (!other) return alert('No other member');
                  // create offer on client-side via VideoCall component (not here). For now send invite without offer
                  socketRef.current?.emit('call_user', { toUserId: other, type: 'audio', conversationId: activeConv._id }, (ack) => console.log('call ack', ack));
                }} className="px-4 py-2 bg-green-600 text-white rounded">Call</button>
              </div>
            </div>
          </>
        )}
      </main>

      <VideoCall />
    </div>
  );
}
