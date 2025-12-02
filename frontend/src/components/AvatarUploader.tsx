import React from 'react';
import api from '../api/api';
import { useUserStore } from '../stores/useUserStore';

export default function AvatarUploader() {
  const inputRef = React.useRef<HTMLInputElement|null>(null);
  const setUser = useUserStore(s => s.setUser);
  const user = useUserStore(s => s.user);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
    // update store
    setUser(res.data.user);
  }

  return (
    <div>
      <img src={user?.avatar ? `/api/upload/download?key=${user.avatar}` : `https://ui-avatars.com/api/?name=${user?.displayName||user?.username}`} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
      <div>
        <button className="text-xs text-slate-500" onClick={() => inputRef.current?.click()}>Change</button>
      </div>
    </div>
  );
}
