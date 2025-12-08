'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Statistics {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  todayProjects: number;
}

export default function AdminDashboard() {
  const { isAdmin, loading } = useAdminAuth();
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    todayProjects: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchStatistics();
    }
  }, [isAdmin]);

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true);

      const response = await fetch('/api/admin/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const statsData = await response.json();
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalProjects: statsData.totalProjects || 0,
        activeProjects: statsData.activeProjects || 0,
        todayProjects: statsData.todayProjects || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !isAdmin) {
    return null; // useAdminAuth 會處理導向
  }

  const quickLinks = [
    {
      title: '團體管理',
      description: '管理 Kpop 團體資料',
      href: '/admin/groups',
      icon: '👥',
      color: 'bg-[#eca382]',
    },
    {
      title: '歌曲管理',
      description: '管理歌曲資料',
      href: '/admin/songs',
      icon: '🎵',
      color: 'bg-[#f0b89a]',
    },
    {
      title: '使用者管理',
      description: '查詢使用者資訊',
      href: '/admin/users',
      icon: '👤',
      color: 'bg-[#eca382]',
    },
    {
      title: '專案管理',
      description: '查詢專案資訊',
      href: '/admin/projects',
      icon: '📋',
      color: 'bg-[#f0b89a]',
    },
    {
      title: '統計數據',
      description: '查看平台統計',
      href: '/admin/statistics',
      icon: '📊',
      color: 'bg-[#eca382]',
    },
    {
      title: '行為分析',
      description: '查看用戶行為數據',
      href: '/admin/analytics',
      icon: '📈',
      color: 'bg-[#f0b89a]',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理員儀表板</h1>
        <p className="mt-2 text-gray-600">歡迎使用管理後台</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總使用者數</p>
              {loadingStats ? (
                <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              )}
            </div>
            <div className="bg-[#fff2e6] rounded-full p-3">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總專案數</p>
              {loadingStats ? (
                <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              )}
            </div>
            <div className="bg-[#fff2e6] rounded-full p-3">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活躍專案數</p>
              {loadingStats ? (
                <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              )}
            </div>
            <div className="bg-[#fff2e6] rounded-full p-3">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今日新增專案</p>
              {loadingStats ? (
                <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.todayProjects}</p>
              )}
            </div>
            <div className="bg-[#fff2e6] rounded-full p-3">
              <span className="text-2xl">🆕</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快速連結 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">快速連結</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`${link.color} rounded-full w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0`}>
                  {link.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

