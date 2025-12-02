import React from 'react';
import type  { Message } from '../types';

export default function ChatBox({ messages, onSend }: { messages: Message[], onSend: (t:string)=>void }) {
  const [text, setText] = React.useState('');
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-2">
        {messages.map(m => <div key={m._id}>{m.text}</div>)}
      </div>
      <div className="p-2 flex gap-2">
        <input className="flex-1 p-2 border" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ onSend(text); setText(''); } }} />
        <button className="px-4 bg-blue-600 text-white rounded" onClick={()=>{ onSend(text); setText(''); }}>Send</button>
      </div>
    </div>
  );
}
