import React, { useState } from 'react';
import api from '../api/api';
import { useUserStore } from '../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const setUser = useUserStore((s) => s.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const nav = useNavigate();

  async function doRegister() {
    const res = await api.post('/auth/register', { username, password, displayName, preferredLang });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    nav('/chat');
  }

  async function doLogin() {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    nav('/chat');
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-white rounded shadow w-96">
        <h2 className="text-xl mb-4">Login / Register</h2>
        <input placeholder="username" className="w-full mb-2 p-2 border" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="password" type="password" className="w-full mb-2 p-2 border" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="display name" className="w-full mb-2 p-2 border" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <select value={preferredLang} onChange={e => setPreferredLang(e.target.value)} className="w-full mb-4 p-2 border">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="es">Spanish</option>
        </select>
        <div className="flex gap-2">
          <button onClick={doLogin} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
          <button onClick={doRegister} className="border px-4 py-2 rounded">Register</button>
        </div>
      </div>
    </div>
  );
}
