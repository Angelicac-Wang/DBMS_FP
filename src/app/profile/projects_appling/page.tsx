'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

      // 獲取我申請的專案（只查詢狀態為 'W' 或 'R' 的申請）
      const { data: applicationsData, error: appError } = await supabase
        .from('project_applications')
        .select('appli_id, p_id, target_seq, status, applied_time')
        .eq('applicant_id', id)
        .in('status', ['W', 'R'])
        .order('applied_time', { ascending: false });

      if (appError) {
        console.error('Error fetching applications:', appError);
        setProjects([]);
        return;
      }

      if (!applicationsData || applicationsData.length === 0) {
        setProjects([]);
        return;
      }

      // 獲取所有申請對應的專案 ID
      const projectIds = [...new Set(applicationsData.map(a => a.p_id))];
      
      // 批次查詢專案資訊
      const { data: projectsData, error: projectsError } = await supabase
        .from('project_agg_view')
        .select('*')
        .in('p_id', projectIds);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setProjects([]);
        return;
      }

      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        return;
      }

      // 建立申請映射表（每個專案對應的申請資訊）
      const applicationMap = new Map<number, {
        appli_id: number;
        status: string;
        target_seq: number;
        applied_time: string;
      }>();
      
      applicationsData.forEach((app) => {
        const pid = Number(app.p_id);
        if (!Number.isNaN(pid)) {
          // 如果同一個專案有多個申請，保留最新的
          const existing = applicationMap.get(pid);
          if (!existing || new Date(app.applied_time) > new Date(existing.applied_time)) {
            applicationMap.set(pid, {
              appli_id: app.appli_id,
              status: app.status,
              target_seq: app.target_seq,
              applied_time: app.applied_time,
            });
          }
        }
      });

      // 從已獲取的專案資料中提取歌曲 ID
      const songIds = [...new Set(
        projectsData.map(p => p.song_id).filter(Boolean)
      )];

      // 批次查詢所有專案的詳細資訊
      const [
        songGroupsData,
        groupsData,
        membersDataBatch
      ] = await Promise.all([
        // 批次查詢所有歌曲-團體關聯
        songIds.length > 0
          ? supabase
              .from('song_group')
              .select('song_id, group_id')
              .in('song_id', songIds)
          : Promise.resolve({ data: [], error: null }),
        
        // 批次查詢所有團體（在獲取 songGroups 後）
        Promise.resolve().then(async () => {
          if (songIds.length === 0) return { data: [], error: null };
          
          const { data: songGroups } = await supabase
            .from('song_group')
            .select('song_id, group_id')
            .in('song_id', songIds);
          
          if (!songGroups || songGroups.length === 0) return { data: [], error: null };
          
          const groupIds = [...new Set(songGroups.map(sg => sg.group_id))];
          return supabase
            .from('kpop_groups')
            .select('group_id, group_name')
            .in('group_id', groupIds);
        }),
        
        // 批次查詢所有成員
        supabase
          .from('project_members')
          .select('p_id, member_id')
          .in('p_id', projectIds)
          .eq('status', 'Y')
      ]);

      // 獲取所有歌曲資訊
      const songsInfoData = songIds.length > 0
        ? await supabase
            .from('kpop_songs')
            .select('song_id, title')
            .in('song_id', songIds)
        : { data: [], error: null };

      // 建立查找映射表
      const projectSongMap = new Map(
        projectsData
          .map((p) => [Number(p.p_id), p.song_id] as const)
          .filter(([id]) => !Number.isNaN(id))
      );
      
      const songsMap = new Map(
        (songsInfoData.data || []).map(s => [s.song_id, s])
      );
      
      const songGroupsMap = new Map<number, number>();
      (songGroupsData.data || []).forEach(sg => {
        if (!songGroupsMap.has(sg.song_id)) {
          songGroupsMap.set(sg.song_id, sg.group_id);
        }
      });
      
      const groupsMap = new Map(
        (groupsData.data || []).map(g => [g.group_id, g])
      );
      
      const membersCountMap = new Map<number, number>();
      (membersDataBatch.data || []).forEach(m => {
        const pid = Number(m.p_id);
        if (!Number.isNaN(pid)) {
          membersCountMap.set(pid, (membersCountMap.get(pid) || 0) + 1);
        }
      });
      
      // 組裝專案詳細資訊的函數
      const getProjectDetails = (project: any) => {
        const projectId = Number(project.p_id);
        const songId = projectSongMap.get(projectId);
        let songInfo = null;

        if (songId) {
          const song = songsMap.get(songId);
          if (song) {
            const groupId = songGroupsMap.get(songId);
            const group = groupId ? groupsMap.get(groupId) : null;
            songInfo = {
              title: song.title,
              group_name: group?.group_name || null
            };
          }
        }

        const memberCount =
          membersCountMap.get(projectId) ??
          Number(project.member_count ?? 0);

        // 獲取申請資訊
        const applicationInfo = applicationMap.get(projectId);

        return {
          song: songInfo,
          member_count: memberCount || 0,
          application_status: applicationInfo?.status || '',
          application_id: applicationInfo?.appli_id,
          target_seq: applicationInfo?.target_seq,
          applied_time: applicationInfo?.applied_time,
        };
      };

      // 組裝所有申請的專案
      const allProjects = projectsData.map((project) => {
        const details = getProjectDetails(project);
        return { ...project, ...details };
      });

      // 排序：待回覆的優先，然後按申請時間降序
      const sortedProjects = allProjects.sort((a, b) => {
        const aIsWaiting = a.application_status === 'W' ? 1 : 0;
        const bIsWaiting = b.application_status === 'W' ? 1 : 0;
        if (aIsWaiting !== bIsWaiting) return bIsWaiting - aIsWaiting;
        const aTime = a.applied_time ? new Date(a.applied_time).getTime() : 0;
        const bTime = b.applied_time ? new Date(b.applied_time).getTime() : 0;
        return bTime - aTime;
      });

      setAllProjects(sortedProjects);
      
      // 根據篩選條件過濾專案
      applyFilter(sortedProjects, filter);
    } catch (err) {
      console.error('Error fetching projects:', err);
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
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'C' })
        .eq('appli_id', applicationId);

      if (error) throw error;

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

