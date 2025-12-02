import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from './stores/useUserStore';

export default function App() {
  const user = useUserStore((s) => s.user);
  const nav = useNavigate();
  React.useEffect(() => {
    if (!user) nav('/login');
    else nav('/chat');
  }, [user]);

  return <div>Redirecting...</div>;
}
