'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { formatDate, formatTime, getStatusText, getStatusColor, inferRegionFromLocation } from '@/lib/utils';

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
    difficulty_level?: number;
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
  region?: string;
  creator_name?: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const userId = localStorage.getItem('userId');
  const [isMember, setIsMember] = useState(false);

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

      // 獲取歌曲資訊
      let songInfo = null;
      if (projectData.song_id) {
        const { data: song } = await supabase
          .from('kpop_songs')
          .select('title, difficulty_level')
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
            difficulty_level: song.difficulty_level,
            group: groupInfo,
          };
        }
      }

      // 從 practice_location 推斷地區
      const region = inferRegionFromLocation(projectData.practice_location);

      // 檢查用戶是否已在專案中
      let userIsMember = false;
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
        region,
        creator_name: creator?.name,
      });
      setIsMember(userIsMember);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };


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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">專案不存在</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              返回首頁
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">{project.porject_title}</h1>
            <div className="flex items-center gap-3">
              {project.region && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {project.region}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            ← 返回
          </button>
        </div>

        {/* 專案描述 */}
        {project.discription && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">專案描述</h2>
            <p className="text-gray-700 leading-relaxed">{project.discription}</p>
          </div>
        )}

        {/* 歌曲資訊 */}
        {project.song && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">翻跳歌曲</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-24">歌曲名稱：</span>
                {project.song_id ? (
                  <Link
                    href={`/song/${project.song_id}`}
                    className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    {project.song.title}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800">{project.song.title}</span>
                )}
              </div>
              {project.song.group && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-24">團體：</span>
                  {project.song.group.group_id ? (
                    <Link
                      href={`/group/${project.song.group.group_id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {project.song.group.group_name}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-800">{project.song.group.group_name}</span>
                  )}
                </div>
              )}
              {project.song.difficulty_level !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 w-24">難度：</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{project.song.difficulty_level}/10</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(project.song.difficulty_level / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 發起人資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">專案資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-24">發起人：</span>
              <span className="font-medium text-gray-800">{project.creator_name || '未知'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-24">目標人數：</span>
              <span className="font-medium text-gray-800">
                {project.filled_positions?.length || 0}/{project.target_cnt}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-24">建立時間：</span>
              <span className="font-medium text-gray-800">
                {new Date(project.create_at).toLocaleString('zh-TW')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-24">更新時間：</span>
              <span className="font-medium text-gray-800">
                {new Date(project.update_at).toLocaleString('zh-TW')}
              </span>
            </div>
          </div>
        </div>

        {/* 練習時間 */}
        {project.practice_schedules && project.practice_schedules.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">練習時間</h2>
            </div>
            <div className="space-y-2">
              {project.practice_schedules.map((schedule, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800 min-w-[120px]">
                    {formatDate(schedule.date)}
                  </span>
                  <span className="text-gray-700">
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 練習地點 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">練習地點</h2>
          </div>
          <p className="text-gray-700 text-lg font-medium pl-10">{project.practice_location}</p>
        </div>

        {/* 拍攝地點 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">拍攝地點</h2>
          </div>
          <p className="text-gray-700 text-lg font-medium pl-10">{project.performance_location}</p>
        </div>

        {/* 目前缺的人 */}
        {project.missing_positions && project.missing_positions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">目前缺的位置</h2>
            </div>
            <div className="flex flex-wrap gap-3 pl-10">
              {project.missing_positions.map((position, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium border border-pink-200"
                >
                  {position.idol_id ? `位置 ${position.target_seq}` : `伴舞 ${position.target_seq}`}
                  {position.idol_name && (
                    position.idol_id ? (
                      <Link
                        href={`/idol/${position.idol_id}`}
                        className="ml-1 hover:underline"
                      >
                        ({position.idol_name})
                      </Link>
                    ) : (
                      ` (${position.idol_name})`
                    )
                  )}
                </div>
              ))}
            </div>
            {userId && project.status === 'A' && project.creator_id.toString() !== userId && !isMember && (
              <div className="mt-4 pl-10">
                <button
                  onClick={() => router.push(`/project/${projectId}/apply`)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  申請加入
                </button>
              </div>
            )}
          </div>
        )}

        {/* 已加入的成員 */}
        {project.filled_positions && project.filled_positions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">已加入的成員</h2>
            </div>
            <div className="space-y-2 pl-10">
              {project.filled_positions.map((position, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800 min-w-[80px]">
                    {position.idol_id ? `位置 ${position.target_seq}` : `伴舞 ${position.target_seq}`}
                  </span>
                  {position.idol_name && (
                    position.idol_id ? (
                      <Link
                        href={`/idol/${position.idol_id}`}
                        className="text-gray-600 text-sm hover:text-pink-600 hover:underline"
                      >
                        ({position.idol_name})
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-sm">({position.idol_name})</span>
                    )
                  )}
                  <span className="text-gray-700 font-medium ml-auto">{position.member_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        {userId && project.creator_id.toString() === userId && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              onClick={() => router.push(`/project/manage/${projectId}`)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              管理專案
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

