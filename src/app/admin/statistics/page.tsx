'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/lib/supabase';

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

      // 總使用者數
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 活躍使用者數（最近30天有登入）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', thirtyDaysAgo.toISOString());

      // 總專案數
      const { count: totalProjects } = await supabase
        .from('project')
        .select('*', { count: 'exact', head: true });

      // 活躍專案數
      const { count: activeProjects } = await supabase
        .from('project')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'A');

      // 已完成專案數
      const { count: completedProjects } = await supabase
        .from('project')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'F');

      // 各狀態專案數量
      const { data: statusData } = await supabase
        .from('project')
        .select('status');

      const statusDistribution: { [key: string]: number } = {};
      if (statusData) {
        statusData.forEach((p) => {
          statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
        });
      }

      // 地區分布
      const { data: usersData } = await supabase
        .from('users')
        .select('region');

      const regionDistribution: { [key: string]: number } = {};
      if (usersData) {
        usersData.forEach((u) => {
          const region = u.region || '未知';
          regionDistribution[region] = (regionDistribution[region] || 0) + 1;
        });
      }

      // 性別分布
      const { data: genderData } = await supabase
        .from('users')
        .select('gender');

      const genderDistribution: { [key: string]: number } = {};
      if (genderData) {
        genderData.forEach((u) => {
          const gender = u.gender === 'B' ? '男' : u.gender === 'G' ? '女' : '未知';
          genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
        });
      }

      // 熱門翻跳歌曲排行
      const { data: projectsData } = await supabase
        .from('project')
        .select('song_id');

      const songCounts: { [key: number]: number } = {};
      if (projectsData) {
        projectsData.forEach((p) => {
          if (p.song_id) {
            songCounts[p.song_id] = (songCounts[p.song_id] || 0) + 1;
          }
        });
      }

      const topSongIds = Object.entries(songCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => parseInt(id));

      const topSongs: { song_id: number; title: string; count: number }[] = [];
      if (topSongIds.length > 0) {
        const { data: songsData } = await supabase
          .from('kpop_songs')
          .select('song_id, title')
          .in('song_id', topSongIds);

        if (songsData) {
          songsData.forEach((song) => {
            topSongs.push({
              song_id: song.song_id,
              title: song.title,
              count: songCounts[song.song_id],
            });
          });
          topSongs.sort((a, b) => b.count - a.count);
        }
      }

      // 人數規模分布
      const { data: sizeData } = await supabase
        .from('project')
        .select('target_cnt');

      const sizeDistribution: { [key: number]: number } = {};
      if (sizeData) {
        sizeData.forEach((p) => {
          sizeDistribution[p.target_cnt] = (sizeDistribution[p.target_cnt] || 0) + 1;
        });
      }

      // 專案完成率
      const completionRate =
        totalProjects && totalProjects > 0
          ? ((completedProjects || 0) / totalProjects) * 100
          : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
          status,
          count,
        })),
        regionDistribution: Object.entries(regionDistribution).map(([region, count]) => ({
          region,
          count,
        })),
        genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({
          gender,
          count,
        })),
        topSongs,
        sizeDistribution: Object.entries(sizeDistribution)
          .map(([size, count]) => ({ size: parseInt(size), count }))
          .sort((a, b) => a.size - b.size),
        completionRate,
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                <div className="space-y-2">
                  {stats.regionDistribution
                    .sort((a, b) => b.count - a.count)
                    .map((item) => (
                      <div key={item.region} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.region}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count} 人</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 性別分布 */}
            {stats.genderDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">性別分布</h3>
                <div className="space-y-2">
                  {stats.genderDistribution.map((item) => (
                    <div key={item.gender} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.gender}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count} 人</span>
                    </div>
                  ))}
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
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* 人數規模分布 */}
            {stats.sizeDistribution.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">人數規模分布</h3>
                <div className="space-y-2">
                  {stats.sizeDistribution.map((item) => (
                    <div key={item.size} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.size} 人</span>
                      <span className="text-sm font-medium text-gray-900">{item.count} 個專案</span>
                    </div>
                  ))}
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
                  <div
                    key={song.song_id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-purple-600 w-8">
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium text-gray-900">{song.title}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {song.count} 個專案
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

