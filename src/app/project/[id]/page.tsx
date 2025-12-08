'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const [userId, setUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [pendingApplication, setPendingApplication] = useState<{ appli_id: number; target_seq: number } | null>(null);

  useEffect(() => {
    // 在客户端获取 userId
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId, userId]);

  const fetchProjectDetail = async (id: string) => {
    try {
      setLoading(true);
      console.info(`${logPrefix} start fetchProjectDetail`, { id });
      
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setProject(null);
          return;
        }
        throw new Error('Failed to fetch project');
      }
      
      const projectData = await response.json();
      
      // 檢查用戶狀態
      let userIsCreator = false;
      let userIsMember = false;
      let userPendingApplication: { appli_id: number; target_seq: number } | null = null;

      if (userId) {
        const statusResponse = await fetch(`/api/projects/${id}/user-status?userId=${userId}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          userIsCreator = statusData.isCreator;
          userIsMember = statusData.isMember && statusData.memberStatus === 'Y';
          userPendingApplication = statusData.pendingApplication;
        }
      }

      setProject(projectData);
      setIsMember(userIsMember);
      setIsCreator(userIsCreator);
      setPendingApplication(userPendingApplication);

      // 獲取專案瀏覽次數
      try {
        const analyticsResponse = await fetch(`/api/analytics/query?event_type=project_view&limit=1000`);
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success && analyticsResult.events) {
          const projectViews = analyticsResult.events.filter(
            (event: any) => event.event_data?.project_id?.toString?.() === id
          );
          setViewCount(projectViews.length);
        }
    } catch (err) {
        console.error('Error fetching view count:', err);
      }
    } catch (err: any) {
      console.error(`${logPrefix} unexpected error in fetchProjectDetail`, err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!userId || !projectId) return;

    if (!confirm('確定要退出此專案嗎？')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '退出失敗');
      }

      alert('已成功退出專案');
      setIsMember(false);
      // 重新載入專案資料
      fetchProjectDetail(projectId);
    } catch (err: any) {
      alert('退出失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleCancelApplication = async () => {
    if (!pendingApplication || !userId) return;
    
    if (!confirm('確定要取消申請嗎？')) return;

    try {
      const response = await fetch(`/api/applications/${pendingApplication.appli_id}/cancel`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '取消申請失敗');
      }

      alert('申請已取消');
      setPendingApplication(null);
      // 重新載入專案資料
      fetchProjectDetail(projectId);
    } catch (err: any) {
      alert('取消申請失敗：' + (err.message || '未知錯誤'));
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
              {userId && isCreator && (
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

              {/* 申請加入按鈕（不在專案中、不是創建者、也沒有申請中） */}
              {userId && !isCreator && !isMember && !pendingApplication && (
                <>
                  {project.status === 'F' ? (
                    <div className="w-full rounded-full bg-gray-400 px-6 py-3 text-sm font-semibold text-white text-center cursor-not-allowed">
                      該專案已招募完成
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push(`/project/${projectId}/apply`)}
                      className="w-full rounded-full bg-[#eca382] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors"
                    >
                      申請加入
                    </button>
                  )}
                </>
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
