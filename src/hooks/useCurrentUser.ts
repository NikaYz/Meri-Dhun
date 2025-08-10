// hooks/useCurrentUser.ts
import { useEffect, useState } from 'react';

export const useCurrentUser = () => {
  const [user, setUser] = useState<{ userId: string; organizationId: string, token: string, role: string} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/getCurrentUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const data = await res.json();
          setUser({ ...data, token });
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchUser();
  }, []);

  return user;
};
