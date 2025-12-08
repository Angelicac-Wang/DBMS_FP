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
  application_count?: number;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'created' | 'joined'>('all');

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
      const response = await fetch(`/api/users/${id}/projects?filter=${filter}`);

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProjects(userId);
    }
  }, [filter, userId]);


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
          <h1 className="text-3xl font-bold text-[#eca382]">我的專案</h1>
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
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'created'
                ? 'bg-[#eca382] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            我創建的
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'joined'
                ? 'bg-[#eca382] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            我參與的
          </button>
        </div>

        {/* 專案列表 */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">目前沒有專案記錄</p>
              <button
                onClick={() => router.push('/project/create')}
                className="px-6 py-2 bg-[#eca382] text-white rounded-lg hover:bg-[#e08f6f]"
              >
                建立新專案
              </button>
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
                    </div>
                    {project.song && (
                      <p className="text-sm text-gray-600 mb-1">
                        歌曲：{project.song.title}
                        {project.song.group_name && ` (${project.song.group_name})`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span>成員：{project.member_count}/{project.target_cnt}</span>
                      {project.creator_id.toString() === userId && (
                        <span>待審核：{project.application_count || 0}</span>
                      )}
                      <span>建立時間：{new Date(project.create_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {project.creator_id.toString() === userId ? (
                      <button
                        onClick={() => router.push(`/project/manage/${project.p_id}`)}
                        className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
                      >
                        管理
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/project/${project.p_id}`)}
                        className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
                      >
                        查看
                      </button>
                    )}
                    {project.status === 'F' && project.creator_id.toString() === userId && (
                      <button
                        onClick={() => router.push(`/project/${project.p_id}/upload`)}
                        className="px-4 py-2 bg-[#f0b89a] text-white rounded-lg text-sm hover:bg-[#eca382]"
                      >
                        上傳作品
                      </button>
                    )}
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

