'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  statusDistribution: { status: string; count: number }[];
  regionDistribution: { region: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  topSongs: { song_id: number; title: string; count: number }[];
  sizeDistribution: { size: number; count: number }[];
  completionRate: number;
}

export default function StatisticsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    statusDistribution: [],
    regionDistribution: [],
    genderDistribution: [],
    topSongs: [],
    sizeDistribution: [],
    completionRate: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchStatistics();
    }
  }, [isAdmin]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/statistics');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();

      setStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalProjects: data.totalProjects || 0,
        activeProjects: data.activeProjects || 0,
        completedProjects: data.completedProjects || 0,
        statusDistribution: data.statusDistribution || [],
        regionDistribution: data.regionDistribution || [],
        genderDistribution: data.genderDistribution || [],
        topSongs: data.topSongs || [],
        sizeDistribution: data.sizeDistribution || [],
        completionRate: data.completionRate || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A':
        return '招募中';
      case 'D':
        return '進行中';
      case 'F':
        return '已完成';
      default:
        return status;
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">平台統計數據</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : (
        <>
          {/* 使用者統計 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">使用者統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-gray-600">總註冊使用者數</span>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">活躍使用者數（最近30天）</span>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>

            {/* 地區分布 */}
            {stats.regionDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">地區分布</h3>
                <div className="space-y-3">
                  {stats.regionDistribution
                    .sort((a, b) => b.count - a.count)
                    .map((item) => {
                      const maxCount = Math.max(...stats.regionDistribution.map(r => r.count));
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item.region}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{item.region}</span>
                            <span className="text-sm font-medium text-gray-900">{item.count} 人</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#eca382] h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 性別分布 */}
            {stats.genderDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">性別分布</h3>
                <div className="space-y-3">
                  {stats.genderDistribution.map((item) => {
                    const maxCount = Math.max(...stats.genderDistribution.map(g => g.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.gender}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{item.gender}</span>
                          <span className="text-sm font-medium text-gray-900">{item.count} 人</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#eca382] h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 專案統計 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">專案統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-gray-600">總專案數</span>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">活躍專案數</span>
                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">已完成專案數</span>
                <p className="text-3xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
            </div>

            {/* 各狀態專案數量 */}
            {stats.statusDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">各狀態專案數量</h3>
                <div className="space-y-2">
                  {stats.statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{getStatusText(item.status)}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count} 個</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 專案完成率 */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">專案完成率</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">完成率</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#eca382] h-2 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* 人數規模分布 */}
            {stats.sizeDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">人數規模分布</h3>
                <div className="space-y-3">
                  {stats.sizeDistribution.map((item) => {
                    const maxCount = Math.max(...stats.sizeDistribution.map(s => s.count));
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <div key={item.size}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{item.size} 人</span>
                          <span className="text-sm font-medium text-gray-900">{item.count} 個專案</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#eca382] h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 熱門翻跳歌曲排行 */}
          {stats.topSongs.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">熱門翻跳歌曲 Top 10</h2>
              <div className="space-y-3">
                {stats.topSongs.map((song, index) => (
                  <Link
                    key={song.song_id}
                    href={`/admin/songs/${song.song_id}`}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-[#eca382] hover:bg-orange-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-[#eca382] w-8">
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium text-gray-900">{song.title}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {song.count} 個專案
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

