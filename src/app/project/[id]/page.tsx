'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';

interface ProjectDetail {
  p_id: number;
  porject_title: string;
  practice_location: string;
  status: string;
  target_cnt: number;
  creator_id: number;
  create_at: string;
  update_at: string;
  description?: string;
  song_id?: number;
  song?: {
    title: string;
    duration?: number;
    youtube_original_url?: string;
    group?: {
      group_id?: number;
      group_name: string;
    };
  };
  practice_schedules?: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>;
  missing_positions?: Array<{
    target_seq: number;
    idol_id?: number;
    idol_name?: string;
  }>;
  filled_positions?: Array<{
    target_seq: number;
    member_name: string;
    idol_id?: number;
    idol_name?: string;
  }>;
  creator_name?: string;
}

function formatDurationToMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}秒`;
  }
  if (secs === 0) {
    return `${mins}分鐘`;
  }
  return `${mins}分${secs}秒`;
}

function extractYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const logPrefix = `[ProjectDetail:${projectId}]`;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const userId = localStorage.getItem('userId');
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [pendingApplication, setPendingApplication] = useState<{ appli_id: number; target_seq: number } | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId]);

  const fetchProjectDetail = async (id: string) => {
    try {
      setLoading(true);
      console.info(`${logPrefix} start fetchProjectDetail`, { id });
      
      // 使用 BigInt 以避免長數字精度損失
      let projectIdNum: bigint;
      try {
        projectIdNum = BigInt(id);
      } catch {
        console.error(`${logPrefix} invalid project ID (BigInt parse failed)`, { id });
        setProject(null);
        return;
      }
      const projectIdStr = projectIdNum.toString();
      console.info(`${logPrefix} parsed projectIdNum`, { projectIdNum: projectIdStr });
      
      // 獲取專案基本資訊 - 這是關鍵查詢，如果失敗則項目不存在
      const { data: projectData, error } = await supabase
        .from('project')
        .select('*')
        .eq('p_id', projectIdStr)
        .maybeSingle();

      if (error) {
        console.error(`${logPrefix} error fetching project base data`, {
          code: (error as any)?.code,
          message: error.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        // 只有項目基本信息查詢失敗才認為項目不存在
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          setProject(null);
          return;
        }
        // 其他錯誤也認為項目不存在（可能是權限問題等）
        setProject(null);
        return;
      }

      if (!projectData) {
        console.warn(`${logPrefix} projectData empty after base query`, {
          projectIdNum,
        });
        setProject(null);
        return;
      }
      console.info(`${logPrefix} base project found`, { projectIdNum, projectData });

      // 以下所有查詢都是關聯數據，失敗不影響項目顯示
      let creatorName: string | undefined = undefined;
      try {
        const { data: creator } = await supabase
          .from('users')
          .select('name')
          .eq('u_id', projectData.creator_id)
          .maybeSingle();
        creatorName = creator?.name;
      } catch (err) {
        console.error('Error fetching creator:', err);
      }

      // 獲取練習時間
      let schedules: Array<{ date: string; start_time: string; end_time: string }> = [];
      try {
        const { data: schedulesData } = await supabase
          .from('practice_schedule')
          .select('date, start_time, end_time')
          .eq('p_id', projectIdStr)
          .order('date', { ascending: true });
        schedules = schedulesData || [];
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }

      // 獲取所有目標位置
      let targets: Array<{ target_seq: number; idol_id?: number; status?: string }> = [];
      try {
        const { data: targetsData } = await supabase
          .from('project_target')
          .select('target_seq, idol_id, status')
          .eq('project_id', projectIdStr)
          .order('target_seq');
        targets = targetsData || [];
      } catch (err) {
        console.error('Error fetching targets:', err);
      }

      // 獲取缺少的位置
      const missingPositions: Array<{ target_seq: number; idol_id?: number; idol_name?: string }> = [];
      const filledPositions: Array<{ target_seq: number; member_name: string; idol_id?: number; idol_name?: string }> = [];

      if (targets && targets.length > 0) {
        for (const target of targets) {
          try {
            let idolName = undefined;
            if (target.idol_id) {
              try {
                const { data: idol } = await supabase
                  .from('kpop_idols')
                  .select('stage_name')
                  .eq('idol_id', target.idol_id)
                  .maybeSingle();
                if (idol) idolName = idol.stage_name;
              } catch (err) {
                console.error(`Error fetching idol ${target.idol_id}:`, err);
              }
            }

            if (target.status === 'I') {
              missingPositions.push({
                target_seq: target.target_seq,
                idol_id: target.idol_id || undefined,
                idol_name: idolName,
              });
            } else if (target.status === 'F') {
              // 獲取該位置的成員
              try {
                const { data: member } = await supabase
                  .from('project_members')
                  .select(`
                    member_id,
                    users(name)
                  `)
                .eq('p_id', projectIdStr)
                  .eq('target_seq', target.target_seq)
                  .eq('status', 'Y')
                  .maybeSingle();

                if (member) {
                  filledPositions.push({
                    target_seq: target.target_seq,
                    member_name: (member.users as any)?.name || '未知',
                    idol_id: target.idol_id || undefined,
                    idol_name: idolName,
                  });
                }
              } catch (err) {
                console.error(`Error fetching member for target ${target.target_seq}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error processing target ${target.target_seq}:`, err);
            // 繼續處理下一個 target
          }
        }
      }

      // 獲取歌曲資訊（包含 YouTube URL 和 duration）
      let songInfo = null;
      if (projectData.song_id) {
        try {
          const { data: song } = await supabase
            .from('kpop_songs')
            .select('title, difficulty_level, youtube_original_url, duration')
            .eq('song_id', projectData.song_id)
            .maybeSingle();

          if (song) {
            let groupInfo = null;
            try {
              const { data: songGroups } = await supabase
                .from('song_group')
                .select('group_id')
                .eq('song_id', projectData.song_id)
                .limit(1);

              if (songGroups && songGroups.length > 0) {
                try {
                  const { data: group } = await supabase
                    .from('kpop_groups')
                    .select('group_id, group_name')
                    .eq('group_id', songGroups[0].group_id)
                    .maybeSingle();
                  
                  if (group) {
                    groupInfo = {
                      group_id: group.group_id,
                      group_name: group.group_name,
                    };
                  }
                } catch (err) {
                  console.error('Error fetching group:', err);
                }
              }
            } catch (err) {
              console.error('Error fetching song groups:', err);
            }

            songInfo = {
              title: song.title,
              duration: song.duration,
              youtube_original_url: song.youtube_original_url,
              group: groupInfo,
            };
          }
        } catch (err) {
          console.error('Error fetching song:', err);
        }
      }

      // 檢查用戶是否已在專案中
      let userIsMember = false;
      const isUserCreator = userId && projectData.creator_id.toString() === userId;
      let pendingApp: { appli_id: number; target_seq: number } | null = null;
      
      if (userId) {
        console.info(`${logPrefix} check membership`, { userId, isUserCreator });
        try {
          const { data: memberCheck } = await supabase
            .from('project_members')
            .select('member_id')
            .eq('p_id', projectIdStr)
            .eq('member_id', userId)
            .eq('status', 'Y')
            .maybeSingle();
          userIsMember = !!memberCheck;
        } catch (err) {
          console.error('Error checking membership:', err);
        }

        // 檢查是否有申請中的申請（status = 'W'）
        if (!userIsMember && !isUserCreator) {
          try {
            const { data: applicationCheck } = await supabase
              .from('project_applications')
              .select('appli_id, target_seq')
              .eq('p_id', projectIdStr)
              .eq('applicant_id', userId)
              .eq('status', 'W')
              .maybeSingle();
            
            if (applicationCheck) {
              pendingApp = {
                appli_id: applicationCheck.appli_id,
                target_seq: applicationCheck.target_seq,
              };
            }
          } catch (err) {
            console.error('Error checking pending application:', err);
          }
        }
      }

      // 只有當項目基本信息查詢成功時才設置項目數據
      // 即使關聯數據查詢失敗，也應該顯示項目基本信息
      console.info(`${logPrefix} set project data`, {
        hasSong: !!songInfo,
        schedulesCount: schedules.length,
        missingCount: missingPositions.length,
        filledCount: filledPositions.length,
        isUserCreator,
        userIsMember,
      });
      setProject({
        ...projectData,
        song: songInfo,
        practice_schedules: schedules,
        missing_positions: missingPositions,
        filled_positions: filledPositions,
        creator_name: creatorName,
      });
      setIsMember(userIsMember);
      setIsCreator(isUserCreator || false);
      setPendingApplication(pendingApp);

      // 獲取專案瀏覽次數（失敗不影響項目顯示）
      try {
        const response = await fetch(`/api/analytics/query?event_type=project_view&limit=1000`);
        const result = await response.json();
        if (result.success && result.events) {
          const projectViews = result.events.filter(
            (event: any) => event.event_data?.project_id?.toString?.() === projectIdStr
          );
          setViewCount(projectViews.length);
        }
      } catch (err) {
        console.error('Error fetching view count:', err);
      }
    } catch (err: any) {
      console.error(`${logPrefix} unexpected error in fetchProjectDetail`, err);
      // 只有在項目基本信息查詢失敗時才設置為 null
      // 這裡的錯誤應該是項目基本信息查詢的錯誤
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="mx-auto px-4 py-6" style={{ maxWidth: 'var(--container-7xl)' }}>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#eca382] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="mx-auto px-4 py-6" style={{ maxWidth: 'var(--container-7xl)' }}>
          <div className="text-center py-12">
            <p className="text-gray-600">專案不存在</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-[#eca382] text-white rounded-lg"
            >
              返回首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCancelApplication = async () => {
    if (!pendingApplication || !userId) return;
    
    if (!confirm('確定要取消申請嗎？')) return;

    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'C' })
        .eq('appli_id', pendingApplication.appli_id);

      if (error) throw error;

      alert('申請已取消');
      setPendingApplication(null);
      // 重新載入專案資料
      if (projectId) {
        fetchProjectDetail(projectId);
      }
    } catch (err: any) {
      alert('取消申請失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleLeaveProject = async () => {
    if (!userId || !project || !projectId) return;

    if (!confirm('確定要退出此專案嗎？')) return;

    try {
      // 將 projectId 轉換為字符串
      const projectIdStr = BigInt(projectId).toString();

      // 獲取使用者的成員資訊
      const { data: memberInfo } = await supabase
        .from('project_members')
        .select('target_seq')
        .eq('p_id', projectIdStr)
        .eq('member_id', userId)
        .eq('status', 'Y')
        .maybeSingle();

      if (!memberInfo) {
        alert('未找到您的成員資料，無法退出專案');
        return;
      }

      // 標記為離開，保留紀錄
      const { error: updateMemberError } = await supabase
        .from('project_members')
        .update({ status: 'N' })
        .eq('p_id', projectIdStr)
        .eq('member_id', userId);

      if (updateMemberError) throw updateMemberError;

      // 更新目標狀態為空缺
      await supabase
        .from('project_target')
        .update({ status: 'I' })
        .eq('project_id', projectIdStr)
        .eq('target_seq', memberInfo.target_seq);

      // 檢查成員人數，如果低於目標人數且專案狀態為已額滿，則改為招募中
      const { count: memberCount, error: countError } = await supabase
        .from('project_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('p_id', projectIdStr)
        .eq('status', 'Y');

      if (countError) throw countError;

      const { data: projectInfo, error: projectError } = await supabase
        .from('project')
        .select('target_cnt, status')
        .eq('p_id', projectIdStr)
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
          .eq('p_id', projectIdStr);
      }

      alert('已成功退出專案');
      setIsMember(false);
      // 重新載入專案資料
      fetchProjectDetail(projectId);
    } catch (err: any) {
      alert('退出失敗：' + (err.message || '未知錯誤'));
    }
  };

  const youtubeId = extractYoutubeId(project.song?.youtube_original_url);
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;

  return (
    <div className="min-h-screen bg-[#fff6ec] pb-20">
      <div className="mx-auto px-4 py-6" style={{ maxWidth: 'var(--container-7xl)' }}>
        {/* 上方一大塊 */}
        <div className="mb-6">
          <div className="grid md:grid-cols-2 gap-10 p-6">
            {/* 左半邊：YouTube 影片和歌曲資訊 */}
            <div className="space-y-4">
              {youtubeEmbedUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={youtubeEmbedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
            </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">無 YouTube 影片</p>
          </div>
        )}

            <div className="space-y-2">
                {project.song?.title && project.song_id ? (
                  <Link href={`/song/${project.song_id}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-[#eca382] hover:underline cursor-pointer transition-colors">
                      {project.song.title}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="text-xl font-bold text-gray-900">{project.song?.title || '未指定歌曲'}</h3>
                )}
                <div className="flex items-center gap-4 text-gray-600">
                  {project.song?.group && (
                    <span className="font-medium">
                      {project.song.group.group_id ? (
                        <Link href={`/group/${project.song.group.group_id}`} className="hover:text-[#eca382] hover:underline">
                          {project.song.group.group_name}
                        </Link>
                      ) : (
                        project.song.group.group_name
                      )}
                    </span>
                  )}
                  {project.song?.duration && (
                    <span className="text-sm">
                      {formatDurationToMinutes(project.song.duration)}
                    </span>
                  )}
                </div>
            </div>
            </div>

            {/* 右半邊：專案資訊 */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.porject_title}</h1>
                {project.description && (
                  <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
                )}
        </div>

        {/* 練習時間 */}
        {project.practice_schedules && project.practice_schedules.length > 0 && (
            <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800">練習時間</h3>
                  <div className="space-y-1">
              {project.practice_schedules.map((schedule, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-[#eca382]"></span>
                        <span>
                          {formatDate(schedule.date).split('(')[0]} {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 練習地點 */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">練習地點</h3>
                <p className="text-sm text-gray-700">{project.practice_location}</p>
        </div>


              {/* 管理專案按鈕（僅創建者） */}
              {isCreator && (
                <button
                  onClick={() => router.push(`/project/manage/${projectId}`)}
                  className="w-full rounded-full bg-[#eca382] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors"
                >
                  管理專案
                </button>
              )}

              {/* 退出專案按鈕（成員但不是創建者） */}
              {userId && isMember && !isCreator && (
                <button
                  onClick={handleLeaveProject}
                  className="w-full rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  退出專案
                </button>
              )}

              {/* 取消申請按鈕（有申請中的申請） */}
              {userId && !isCreator && !isMember && pendingApplication && (
                <button
                  onClick={handleCancelApplication}
                  className="w-full rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 transition-colors"
                >
                  取消申請
                </button>
              )}

              {/* 申請加入按鈕（沒有申請且不是成員） */}
              {userId && !isCreator && !isMember && !pendingApplication && project.status === 'A' && project.missing_positions && project.missing_positions.length > 0 && (
                <button
                  onClick={() => router.push(`/project/${projectId}/apply`)}
                  className="w-full rounded-full bg-[#eca382] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors"
                >
                  申請加入
                </button>
              )}
              </div>
          </div>
        </div>

        {/* 下方兩小塊 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 左邊：專案資訊 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">專案資訊</h2>
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">發起人：</span>
                  <Link
                    href={`/profile?userId=${project.creator_id}`}
                    className="ml-2 text-sm font-medium text-[#eca382] hover:text-[#e08f6f] hover:underline"
                  >
                    {project.creator_name || '未知'}
                  </Link>
                </div>
                <div>
                  <span className="text-sm text-gray-600">目標人數：</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {project.filled_positions?.length || 0}/{project.target_cnt}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">建立時間：</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {new Date(project.create_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">上次修改時間：</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {new Date(project.update_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">瀏覽次數：</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {viewCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右邊：缺的位置和已加入成員 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">目前專案招募進度</h2>
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 space-y-6">
              {/* 缺的位置 */}
              {project.missing_positions && project.missing_positions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">缺的位置</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.missing_positions.map((position, idx) => (
                      <div
                        key={idx}
                        className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-[#7a2d81]"
                      >
                        {position.idol_id ? `位置 ${position.target_seq}` : `伴舞 ${position.target_seq}`}
                        {position.idol_name && ` (${position.idol_name})`}
                </div>
              ))}
            </div>
          </div>
        )}

              {/* 已加入成員 */}
              {project.filled_positions && project.filled_positions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">已加入成員</h3>
                  <div className="space-y-2">
                    {project.filled_positions.map((position, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {position.idol_id ? `位置 ${position.target_seq}` : `伴舞 ${position.target_seq}`}
                          </span>
                          {position.idol_name && (
                            <span className="text-xs text-gray-500">({position.idol_name})</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{position.member_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
