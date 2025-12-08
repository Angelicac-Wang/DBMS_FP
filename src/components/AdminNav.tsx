'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminNav() {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchAdminName(userId);
    }
  }, []);

  const fetchAdminName = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = response.ok ? await response.json() : null;
      
      if (data) {
        setAdminName(data.name);
      }
    } catch (error) {
      console.error('Error fetching admin name:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    router.push('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-[#eca382]">
              管理後台
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/admin"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                儀表板
              </Link>
              <Link
                href="/admin/groups"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                團體管理
              </Link>
              <Link
                href="/admin/songs"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                歌曲管理
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                使用者管理
              </Link>
              <Link
                href="/admin/projects"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                專案管理
              </Link>
              <Link
                href="/admin/statistics"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                統計數據
              </Link>
              <Link
                href="/admin/analytics"
                className="text-gray-700 hover:text-[#eca382] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                行為分析
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">管理員：{adminName || '載入中...'}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

