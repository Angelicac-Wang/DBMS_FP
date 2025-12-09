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
  application_count?: number;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'created' | 'joined'>('all');
  const [membershipMap, setMembershipMap] = useState<Record<number, { target_seq: number }>>({});

  const mergeUniqueProjects = (existing: Project[], incoming: Project[]) => {
    const map = new Map<number, Project>();
    [...existing, ...incoming].forEach((p) => map.set(p.p_id, p));
    return Array.from(map.values());
  };

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
        .from('project_agg_view')
        .select('*')
        .eq('creator_id', id)
        .order('create_at', { ascending: false });

      // 獲取我參與的專案
      const { data: membersData } = await supabase
        .from('project_members')
        .select('p_id, target_seq')
        .eq('member_id', id)
        .eq('status', 'Y');

      let joinedData: any[] = [];
      if (membersData && membersData.length > 0) {
        const projectIds = membersData.map((m) => m.p_id);
        const { data } = await supabase
          .from('project_agg_view')
          .select('*')
          .in('p_id', projectIds)
          .order('create_at', { ascending: false });
        joinedData = data || [];
        const membershipInfo: Record<number, { target_seq: number }> = {};
        membersData.forEach((m) => {
          membershipInfo[Number(m.p_id)] = { target_seq: Number(m.target_seq) };
        });
        setMembershipMap(membershipInfo);
      } else {
        setMembershipMap({});
      }

      // 合併所有專案
      const allProjects = [
        ...(createdData || []),
        ...joinedData
      ];
      const uniqueProjectIds = [
        ...new Set(allProjects.map((p) => Number(p.p_id)).filter((id) => !Number.isNaN(id)))
      ];

      if (uniqueProjectIds.length === 0) {
        setProjects([]);
        return;
      }

      // 從已獲取的專案資料中提取歌曲 ID
      const songIds = [...new Set(
        allProjects.map(p => p.song_id).filter(Boolean)
      )];

      // 批次查詢所有專案的詳細資訊（包含待審核申請）
      const [
        songGroupsData,
        groupsData,
        membersDataBatch,
        applicationsDataBatch
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
          .in('p_id', uniqueProjectIds)
          .eq('status', 'Y'),
        
        // 批次查詢所有待審核申請
        uniqueProjectIds.length > 0
          ? (() => {
              console.log('準備查詢待審核申請，專案 IDs:', uniqueProjectIds.slice(0, 5), '... (共', uniqueProjectIds.length, '個)');
              // 嘗試選擇所有欄位，看看實際的表結構
              return supabase
                .from('project_applications')
                .select('*')
                .in('p_id', uniqueProjectIds)
                .eq('status', 'W');
            })()
          : Promise.resolve({ data: [], error: null })
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
        allProjects
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
      
      // 處理待審核申請查詢結果
      const applicationsCountMap = new Map<number, number>();
      if (applicationsDataBatch.error) {
        console.error('待審核申請查詢錯誤:', applicationsDataBatch.error);
        // 如果查詢失敗，嘗試逐個查詢（作為備用方案）
        if (uniqueProjectIds.length > 0 && uniqueProjectIds.length <= 10) {
          console.log('嘗試逐個查詢待審核申請...');
          try {
            const individualQueries = await Promise.all(
              uniqueProjectIds.map(async (pid) => {
                const { count, error } = await supabase
                  .from('project_applications')
                  .select('appli_id', { count: 'exact', head: true })
                  .eq('p_id', pid)
                  .eq('status', 'W');
                return { pid, count: error ? 0 : (count || 0), error };
              })
            );
            individualQueries.forEach(({ pid, count }) => {
              if (count > 0) {
                applicationsCountMap.set(pid, count);
              }
            });
            console.log('逐個查詢結果:', Array.from(applicationsCountMap.entries()));
          } catch (err) {
            console.error('逐個查詢也失敗:', err);
          }
        }
      } else if (applicationsDataBatch.data && Array.isArray(applicationsDataBatch.data)) {
        console.log('處理待審核申請查詢結果，共', applicationsDataBatch.data.length, '筆');
        console.log('第一筆資料範例:', applicationsDataBatch.data[0]);
        applicationsDataBatch.data.forEach((a) => {
          // 嘗試多種可能的欄位名稱
          const pid = a.p_id || a.P_ID || a.project_id || a.project_Id;
          if (pid !== undefined && pid !== null) {
            const pidNum = typeof pid === 'string' ? Number(pid) : Number(pid);
            if (!Number.isNaN(pidNum) && pidNum > 0) {
              applicationsCountMap.set(pidNum, (applicationsCountMap.get(pidNum) || 0) + 1);
            }
          }
        });
        console.log('待審核申請統計結果:', Array.from(applicationsCountMap.entries()));
      } else {
        console.log('待審核申請查詢結果為空:', applicationsDataBatch);
      }
      
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

        // 優先使用查詢結果，如果沒有則使用聚合視圖的資料
        let applicationCount = 0;
        if (applicationsCountMap.has(projectId)) {
          applicationCount = applicationsCountMap.get(projectId) || 0;
        } else if (project.application_count !== undefined && project.application_count !== null) {
          applicationCount = Number(project.application_count);
        }
        
        // 調試：檢查專案 ID 和待審核數（僅在開發時顯示）
        if (process.env.NODE_ENV === 'development' && project.creator_id?.toString() === id && applicationCount > 0) {
          console.log(`專案 ${projectId} 待審核數:`, {
            projectId,
            hasInMap: applicationsCountMap.has(projectId),
            mapValue: applicationsCountMap.get(projectId),
            finalCount: applicationCount
          });
        }

        return {
          song: songInfo,
          member_count: memberCount || 0,
          application_count: applicationCount || 0,
        };
      };

      // 組裝創建的專案
      if (createdData) {
        createdProjects = createdData.map((project) => {
          const details = getProjectDetails(project);
          return { ...project, ...details };
        });

        createdProjects.sort((a, b) => {
          const aPending = (a.application_count || 0) > 0 ? 1 : 0;
          const bPending = (b.application_count || 0) > 0 ? 1 : 0;
          if (aPending !== bPending) return bPending - aPending;
          return new Date(b.create_at).getTime() - new Date(a.create_at).getTime();
        });
      }

      // 組裝參與的專案
      if (joinedData.length > 0) {
        joinedProjects = joinedData.map((project) => {
          const details = getProjectDetails(project);
          return { ...project, ...details };
        });
      }

      // 根據篩選條件合併專案，並用 p_id 去重
      if (filter === 'all') {
        setProjects(mergeUniqueProjects(createdProjects, joinedProjects));
      } else if (filter === 'created') {
        setProjects(createdProjects);
      } else if (filter === 'joined') {
        setProjects(joinedProjects);
      }
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
  }, [filter, userId]);

  const handleLeaveProject = async (projectId: number) => {
    if (!userId) return;
    const membership = membershipMap[projectId];
    if (!membership) {
      alert('未找到您的成員資料，無法退出專案');
      return;
    }

    if (!confirm('確定要退出此專案嗎？')) return;

    try {
      // 標記為離開，保留紀錄
      const { error: updateMemberError } = await supabase
        .from('project_members')
        .update({ status: 'N' })
        .eq('p_id', projectId)
        .eq('member_id', userId);

      if (updateMemberError) throw updateMemberError;

      await supabase
        .from('project_target')
        .update({ status: 'I' })
        .eq('project_id', projectId)
        .eq('target_seq', membership.target_seq);

      const { count: memberCount, error: countError } = await supabase
        .from('project_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('p_id', projectId)
        .eq('status', 'Y');

      if (countError) throw countError;

      const { data: projectInfo, error: projectError } = await supabase
        .from('project')
        .select('target_cnt, status')
        .eq('p_id', projectId)
        .single();

      if (projectError) throw projectError;

      if (
        memberCount !== null &&
        projectInfo?.target_cnt !== undefined &&
        memberCount < projectInfo.target_cnt &&
        projectInfo.status === 'F'
      ) {
        await supabase
          .from('project')
          .update({ status: 'A', update_at: new Date().toISOString() })
          .eq('p_id', projectId);
      }

      fetchProjects(userId);
    } catch (err: any) {
      alert('退出失敗：' + (err.message || '未知錯誤'));
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
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-800">{project.porject_title}</h2>
                        {project.creator_id.toString() === userId && (project.application_count || 0) > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" title="有待審核申請"></span>
                        )}
                      </div>
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
                      <>
                        <button
                          onClick={() => router.push(`/project/${project.p_id}`)}
                          className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
                        >
                          查看
                        </button>
                        {membershipMap[project.p_id] && (
                          <button
                            onClick={() => handleLeaveProject(project.p_id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                          >
                            退出專案
                          </button>
                        )}
                      </>
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

