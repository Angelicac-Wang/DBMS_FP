'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Project {
  p_id: number;
  porject_title: string;
  creator_id: number;
  creator_name: string;
  song_id?: number;
  song_title?: string;
  status: string;
  target_cnt: number;
  create_at: string;
}

export default function ProjectsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCreator, setFilterCreator] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
    }
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let query = supabase.from('project').select('p_id, porject_title, creator_id, song_id, status, target_cnt, create_at');

      // 搜尋
      if (searchQuery) {
        query = query.ilike('porject_title', `%${searchQuery}%`);
      }

      // 篩選狀態
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      query = query.order('create_at', { ascending: false });

      const { data: projectsData, error } = await query;

      if (error) throw error;

      // 獲取創建者名稱和歌曲名稱
      const projectsWithDetails = await Promise.all(
        (projectsData || []).map(async (project) => {
          // 獲取創建者名稱
          const { data: creator } = await supabase
            .from('users')
            .select('name')
            .eq('u_id', project.creator_id)
            .single();

          // 獲取歌曲名稱
          let songTitle = undefined;
          if (project.song_id) {
            const { data: song } = await supabase
              .from('kpop_songs')
              .select('title')
              .eq('song_id', project.song_id)
              .single();
            songTitle = song?.title;
          }

          return {
            ...project,
            creator_name: creator?.name || '未知',
            song_title: songTitle,
          };
        })
      );

      // 如果有篩選創建者，過濾結果
      let filteredProjects = projectsWithDetails;
      if (filterCreator) {
        filteredProjects = projectsWithDetails.filter(p =>
          p.creator_name.toLowerCase().includes(filterCreator.toLowerCase())
        );
      }

      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
    }
  }, [searchQuery, filterStatus, filterCreator, isAdmin]);

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">專案管理</h1>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋專案標題或歌曲名稱</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入專案標題..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">狀態</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">全部</option>
              <option value="A">招募中</option>
              <option value="D">進行中</option>
              <option value="F">已完成</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">創建者</label>
            <input
              type="text"
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              placeholder="輸入創建者名稱..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 專案列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">沒有找到專案</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  專案標題
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  創建者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  歌曲名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  目標人數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建立日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.p_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.porject_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.creator_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.song_title || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'A'
                          ? 'bg-blue-100 text-blue-800'
                          : project.status === 'D'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.target_cnt} 人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(project.create_at).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/projects/${project.p_id}`}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      查看詳情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

