'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useUserAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      router.push('/auth');
      return;
    }

    // 如果是管理員，導向管理頁面
    if (userRole === 'A') {
      router.push('/admin');
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  return { isAuthenticated, loading };
}

