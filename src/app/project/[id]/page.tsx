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
  performance_location: string;
  status: string;
  target_cnt: number;
  creator_id: number;
  create_at: string;
  update_at: string;
  discription?: string;
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
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const userId = localStorage.getItem('userId');
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId]);

  const fetchProjectDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // 獲取專案基本資訊
      const { data: projectData, error } = await supabase
        .from('project')
        .select('*')
        .eq('p_id', id)
        .single();

      if (error) throw error;

      // 獲取發起人資訊
      const { data: creator } = await supabase
        .from('users')
        .select('name')
        .eq('u_id', projectData.creator_id)
        .single();

      // 獲取練習時間
      const { data: schedules } = await supabase
        .from('practice_schedule')
        .select('date, start_time, end_time')
        .eq('p_id', id)
        .order('date', { ascending: true });

      // 獲取所有目標位置
      const { data: targets } = await supabase
        .from('project_target')
        .select('target_seq, idol_id, status')
        .eq('project_id', id)
        .order('target_seq');

      // 獲取缺少的位置
      const missingPositions: Array<{ target_seq: number; idol_id?: number; idol_name?: string }> = [];
      const filledPositions: Array<{ target_seq: number; member_name: string; idol_id?: number; idol_name?: string }> = [];

      if (targets) {
        for (const target of targets) {
          let idolName = undefined;
          if (target.idol_id) {
            const { data: idol } = await supabase
              .from('kpop_idols')
              .select('stage_name')
              .eq('idol_id', target.idol_id)
              .single();
            if (idol) idolName = idol.stage_name;
          }

          if (target.status === 'I') {
            missingPositions.push({
              target_seq: target.target_seq,
              idol_id: target.idol_id || undefined,
              idol_name: idolName,
            });
          } else if (target.status === 'F') {
            // 獲取該位置的成員
            const { data: member } = await supabase
              .from('project_members')
              .select(`
                member_id,
                users(name)
              `)
              .eq('p_id', id)
              .eq('target_seq', target.target_seq)
              .eq('status', 'Y')
              .single();

            if (member) {
              filledPositions.push({
                target_seq: target.target_seq,
                member_name: (member.users as any)?.name || '未知',
                idol_id: target.idol_id || undefined,
                idol_name: idolName,
              });
            }
          }
        }
      }

      // 獲取歌曲資訊（包含 YouTube URL 和 duration）
      let songInfo = null;
      if (projectData.song_id) {
        const { data: song } = await supabase
          .from('kpop_songs')
          .select('title, difficulty_level, youtube_original_url, duration')
          .eq('song_id', projectData.song_id)
          .single();

        if (song) {
          const { data: songGroups } = await supabase
            .from('song_group')
            .select('group_id')
            .eq('song_id', projectData.song_id)
            .limit(1);

          let groupInfo = null;
          if (songGroups && songGroups.length > 0) {
            const { data: group } = await supabase
              .from('kpop_groups')
              .select('group_id, group_name')
              .eq('group_id', songGroups[0].group_id)
              .single();
            
            if (group) {
              groupInfo = {
                group_id: group.group_id,
                group_name: group.group_name,
              };
            }
          }

          songInfo = {
            title: song.title,
            duration: song.duration,
            youtube_original_url: song.youtube_original_url,
            group: groupInfo,
          };
        }
      }

      // 檢查用戶是否已在專案中
      let userIsMember = false;
      const isUserCreator = userId && projectData.creator_id.toString() === userId;
      if (userId) {
        const { data: memberCheck } = await supabase
          .from('project_members')
          .select('member_id')
          .eq('p_id', id)
          .eq('member_id', userId)
          .eq('status', 'Y')
          .single();
        userIsMember = !!memberCheck;
      }

      setProject({
        ...projectData,
        song: songInfo,
        practice_schedules: schedules || [],
        missing_positions: missingPositions,
        filled_positions: filledPositions,
        creator_name: creator?.name,
      });
      setIsMember(userIsMember);
      setIsCreator(isUserCreator || false);

      // 獲取專案瀏覽次數
      try {
        const response = await fetch(`/api/analytics/query?event_type=project_view&limit=1000`);
        const result = await response.json();
        if (result.success && result.events) {
          const projectViews = result.events.filter(
            (event: any) => event.event_data?.project_id === parseInt(id)
          );
          setViewCount(projectViews.length);
        }
      } catch (err) {
        console.error('Error fetching view count:', err);
      }
    } catch (err) {
      console.error('Error:', err);
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
                {project.discription && (
                  <p className="text-gray-500 text-sm leading-relaxed">{project.discription}</p>
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

        {/* 拍攝地點 */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">拍攝地點</h3>
                <p className="text-sm text-gray-700">{project.performance_location}</p>
              </div>

              {/* 申請加入按鈕 */}
              {userId && !isCreator && !isMember && project.status === 'A' && project.missing_positions && project.missing_positions.length > 0 && (
                <button
                  onClick={() => router.push(`/project/${projectId}/apply`)}
                  className="w-full rounded-full bg-[#eca382] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors"
                >
                  申請加入
                </button>
              )}

              {/* 管理專案按鈕（僅創建者） */}
              {isCreator && (
                <button
                  onClick={() => router.push(`/project/manage/${projectId}`)}
                  className="w-full rounded-full bg-[#7a2d81] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#641c6c] transition-colors"
                >
                  管理專案
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
                    className="ml-2 text-sm font-medium text-[#7a2d81] hover:text-[#eca382] hover:underline"
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
