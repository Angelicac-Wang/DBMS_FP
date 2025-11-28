'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { getStatusText, getStatusColor } from '@/lib/utils';

interface Project {
  p_id: number;
  porject_title: string;
  status: string;
  create_at: string;
  update_at: string;
  practice_location: string;
  performance_location: string;
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

      let createdProjects: Project[] = [];
      let joinedProjects: Project[] = [];

      // 獲取我創建的專案
      const { data: createdData } = await supabase
        .from('project')
        .select('*')
        .eq('creator_id', id)
        .order('create_at', { ascending: false });

      if (createdData) {
        createdProjects = await Promise.all(
          createdData.map(async (project) => {
            const details = await getProjectDetails(project.p_id);
            return { ...project, ...details };
          })
        );
      }

      // 獲取我參與的專案
      const { data: membersData } = await supabase
        .from('project_members')
        .select('p_id')
        .eq('member_id', id);

      if (membersData && membersData.length > 0) {
        const projectIds = membersData.map((m) => m.p_id);
        const { data: joinedData } = await supabase
          .from('project')
          .select('*')
          .in('p_id', projectIds)
          .order('create_at', { ascending: false });

        if (joinedData) {
          joinedProjects = await Promise.all(
            joinedData.map(async (project) => {
              const details = await getProjectDetails(project.p_id);
              return { ...project, ...details };
            })
          );
        }
      }

      // 根據篩選條件合併專案
      let allProjects: Project[] = [];
      if (filter === 'all') {
        // 合併並去重
        const projectMap = new Map();
        [...createdProjects, ...joinedProjects].forEach((p) => {
          projectMap.set(p.p_id, p);
        });
        allProjects = Array.from(projectMap.values());
      } else if (filter === 'created') {
        allProjects = createdProjects;
      } else if (filter === 'joined') {
        allProjects = joinedProjects;
      }

      setProjects(allProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProjectDetails = async (projectId: number) => {
    // 獲取歌曲資訊
    let songInfo = null;
    const { data: projectData } = await supabase
      .from('project')
      .select('song_id')
      .eq('p_id', projectId)
      .single();

    if (projectData?.song_id) {
      const { data: song } = await supabase
        .from('kpop_songs')
        .select('title')
        .eq('song_id', projectData.song_id)
        .single();

      if (song) {
        const { data: songGroups } = await supabase
          .from('song_group')
          .select('group_id')
          .eq('song_id', projectData.song_id)
          .limit(1);

        let groupName = null;
        if (songGroups && songGroups.length > 0) {
          const { data: group } = await supabase
            .from('kpop_groups')
            .select('group_name')
            .eq('group_id', songGroups[0].group_id)
            .single();

          if (group) groupName = group.group_name;
        }

        songInfo = { title: song.title, group_name: groupName };
      }
    }

    // 獲取成員數量
    const { data: members } = await supabase
      .from('project_members')
      .select('member_id')
      .eq('p_id', projectId);

    // 獲取申請數量
    const { data: applications } = await supabase
      .from('project_applications')
      .select('appli_id')
      .eq('p_id', projectId)
      .eq('status', 'W');

    return {
      song: songInfo,
      member_count: members?.length || 0,
      application_count: applications?.length || 0,
    };
  };

  useEffect(() => {
    if (userId) {
      fetchProjects(userId);
    }
  }, [filter, userId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">我的專案</h1>
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
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'created'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            我創建的
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'joined'
                ? 'bg-purple-600 text-white'
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                      >
                        管理
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/project/${project.p_id}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        查看
                      </button>
                    )}
                    {project.status === 'F' && project.creator_id.toString() === userId && (
                      <button
                        onClick={() => router.push(`/project/${project.p_id}/upload`)}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600"
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
                  <div>
                    <span className="text-gray-600">拍攝地點：</span>
                    <span className="text-gray-800">{project.performance_location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

