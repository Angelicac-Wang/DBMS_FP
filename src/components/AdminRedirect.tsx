'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 檢查是否為管理員
    const userRole = localStorage.getItem('userRole');
    
    // 如果是管理員且不在 /admin 路徑下，導向 /admin
    if (userRole === 'A' && !pathname.startsWith('/admin') && pathname !== '/auth') {
      router.push('/admin');
    }
  }, [pathname, router]);

  return null;
}

