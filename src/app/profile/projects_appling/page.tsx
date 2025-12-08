'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStatusText, getStatusColor } from '@/lib/utils';

interface Project {
  p_id: number;
  porject_title: string;
  status: string;
  create_at: string;
  update_at: string;
  practice_location: string;
  target_cnt: number;
  creator_id: number;
  song?: {
    title: string;
    group_name?: string;
  };
  member_count?: number;
  application_status?: string; // 'W' = 待回覆, 'R' = 已被拒絕
  application_id?: number;
  target_seq?: number;
  applied_time?: string;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'rejected'>('all');

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    fetchProjects(id);
  }, [router]);

  const fetchProjects = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}/applications?filter=${filter}`);

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setAllProjects(data);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProjects(userId);
    }
  }, [userId]);

  const applyFilter = (projectsList: Project[], filterType: 'all' | 'waiting' | 'rejected') => {
    if (filterType === 'all') {
      setProjects(projectsList);
    } else if (filterType === 'waiting') {
      setProjects(projectsList.filter(p => p.application_status === 'W'));
    } else if (filterType === 'rejected') {
      setProjects(projectsList.filter(p => p.application_status === 'R'));
    }
  };

  useEffect(() => {
    if (allProjects.length > 0) {
      applyFilter(allProjects, filter);
    }
  }, [filter, allProjects]);

  const getApplicationStatusText = (status: string) => {
    if (status === 'W') return '待回覆';
    if (status === 'R') return '已被拒絕';
    return '';
  };

  const getApplicationStatusColor = (status: string) => {
    if (status === 'W') return 'bg-yellow-100 text-yellow-800';
    if (status === 'R') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleCancelApplication = async (applicationId: number, projectId: number) => {
    if (!confirm('確定要取消申請嗎？')) return;

    try {
      const response = await fetch(`/api/applications/${applicationId}/cancel`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '取消申請失敗');
      }

      alert('申請已取消');
      
      // 重新載入資料（取消的申請不會再顯示，因為查詢條件是 status IN ('W', 'R')）
      if (userId) {
        fetchProjects(userId);
      }
    } catch (err: any) {
      alert('取消申請失敗：' + (err.message || '未知錯誤'));
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6ec] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eca382]">申請中的專案</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        {/* 篩選器 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#eca382] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'waiting'
                ? 'bg-[#eca382] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            申請中
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-[#eca382] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            已被拒絕
          </button>
        </div>

        {/* 專案列表 */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">目前沒有申請中或被拒絕的專案記錄</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.p_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{project.porject_title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      {project.application_status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(project.application_status)}`}>
                          {getApplicationStatusText(project.application_status)}
                        </span>
                      )}
                    </div>
                    {project.song && (
                      <p className="text-sm text-gray-600 mb-1">
                        歌曲：{project.song.title}
                        {project.song.group_name && ` (${project.song.group_name})`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span>成員：{project.member_count}/{project.target_cnt}</span>
                      {project.applied_time && (
                        <span>申請時間：{new Date(project.applied_time).toLocaleString('zh-TW')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {project.application_status === 'W' && project.application_id && (
                      <button
                        onClick={() => handleCancelApplication(project.application_id!, project.p_id)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                      >
                        取消申請
                      </button>
                    )}
                        <button
                          onClick={() => router.push(`/project/${project.p_id}`)}
                          className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
                        >
                      查看專案
                      </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">練習地點：</span>
                    <span className="text-gray-800">{project.practice_location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

