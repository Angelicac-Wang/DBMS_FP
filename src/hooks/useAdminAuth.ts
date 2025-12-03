'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      router.push('/auth');
      return;
    }

    if (userRole !== 'A') {
      router.push('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [router]);

  return { isAdmin, loading };
}

