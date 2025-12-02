import React from 'react';
import api from '../api/api';
import type { Conversation } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ onSelect }: { onSelect: (c: Conversation) => void }) {
  const [convs, setConvs] = React.useState<Conversation[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await api.get('/conversations');
      setConvs(res.data.conversations || []);
    })();
  }, []);

  return (
    <div className="sidebar p-4">
      <h3 className="font-bold mb-3">Conversations</h3>
      <div className="flex flex-col gap-2">
        {convs.map(c => (
          <div key={c._id} className="p-2 rounded hover:bg-slate-50 cursor-pointer" onClick={() => onSelect(c)}>
            <div className="font-semibold">{c.title || (c.isGroup ? 'Group' : 'Direct')}</div>
            <div className="text-sm text-slate-500">{c.members.length} members</div>
          </div>
        ))}
      </div>
    </div>
  );
}
