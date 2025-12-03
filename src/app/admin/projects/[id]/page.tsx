'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Project {
  p_id: number;
  porject_title: string;
  discription?: string;
  creator_id: number;
  song_id?: number;
  target_cnt: number;
  status: string;
  practice_location?: string;
  performance_location?: string;
  create_at: string;
  update_at?: string;
}

interface Position {
  target_seq: number;
  idol_id?: number;
  idol_name?: string;
  member_id?: number;
  member_name?: string;
  is_backup: boolean;
}

interface Application {
  application_id: number;
  applicant_id: number;
  applicant_name: string;
  target_seq: number;
  idol_name?: string;
  status: string;
  applied_time: string;
  review_time?: string;
}

interface PracticeSchedule {
  schedule_id: number;
  practice_date: string;
  start_time: string;
  end_time: string;
}

export default function ProjectDetailPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songGroup, setSongGroup] = useState('');
  const [songDifficulty, setSongDifficulty] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [practiceSchedules, setPracticeSchedules] = useState<PracticeSchedule[]>([]);
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    if (isAdmin && projectId) {
      fetchProjectDetail();
    }
  }, [isAdmin, projectId]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);

      // 獲取專案基本資訊
      const { data: projectData, error: projectError } = await supabase
        .from('project')
        .select('*')
        .eq('p_id', parseInt(projectId))
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // 獲取創建者名稱
      if (projectData.creator_id) {
        const { data: creator } = await supabase
          .from('users')
          .select('name')
          .eq('u_id', projectData.creator_id)
          .single();
        if (creator) setCreatorName(creator.name);
      }

      // 獲取歌曲資訊
      if (projectData.song_id) {
        const { data: song } = await supabase
          .from('kpop_songs')
          .select('title, difficulty_level')
          .eq('song_id', projectData.song_id)
          .single();
        if (song) {
          setSongTitle(song.title);
          setSongDifficulty(song.difficulty_level);

          // 獲取歌曲的團體
          const { data: songGroups } = await supabase
            .from('song_group')
            .select('group_id')
            .eq('song_id', projectData.song_id)
            .limit(1);

          if (songGroups && songGroups.length > 0) {
            const { data: group } = await supabase
              .from('kpop_groups')
              .select('group_name')
              .eq('group_id', songGroups[0].group_id)
              .single();
            if (group) setSongGroup(group.group_name);
          }
        }
      }

      // 獲取成員名單與位置分配
      const { data: targets } = await supabase
        .from('project_target')
        .select('target_seq, idol_id, status')
        .eq('project_id', parseInt(projectId))
        .order('target_seq');

      if (targets) {
        const positionsData = await Promise.all(
          targets.map(async (target) => {
            let idolName: string | undefined;
            if (target.idol_id) {
              const { data: idol } = await supabase
                .from('kpop_idols')
                .select('stage_name')
                .eq('idol_id', target.idol_id)
                .single();
              if (idol) idolName = idol.stage_name;
            }

            // 獲取成員資訊
            const { data: member } = await supabase
              .from('project_members')
              .select('member_id')
              .eq('p_id', parseInt(projectId))
              .eq('target_seq', target.target_seq)
              .eq('status', 'Y')
              .single();

            let memberName: string | undefined;
            if (member) {
              const { data: user } = await supabase
                .from('users')
                .select('name')
                .eq('u_id', member.member_id)
                .single();
              if (user) memberName = user.name;
            }

            return {
              target_seq: target.target_seq,
              idol_id: target.idol_id || undefined,
              idol_name: idolName,
              member_id: member?.member_id,
              member_name: memberName,
              is_backup: !target.idol_id,
            };
          })
        );

        setPositions(positionsData);
        setFilledCount(positionsData.filter(p => p.member_id).length);
      }

      // 獲取所有申請記錄
      const { data: applicationsData } = await supabase
        .from('project_applications')
        .select('application_id, applicant_id, target_seq, status, applied_time, review_time')
        .eq('p_id', parseInt(projectId))
        .order('applied_time', { ascending: false });

      if (applicationsData) {
        const applicationsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            // 獲取申請者名稱
            const { data: applicant } = await supabase
              .from('users')
              .select('name')
              .eq('u_id', app.applicant_id)
              .single();

            // 獲取位置對應的偶像名稱
            const { data: target } = await supabase
              .from('project_target')
              .select('idol_id')
              .eq('project_id', parseInt(projectId))
              .eq('target_seq', app.target_seq)
              .single();

            let idolName: string | undefined;
            if (target?.idol_id) {
              const { data: idol } = await supabase
                .from('kpop_idols')
                .select('stage_name')
                .eq('idol_id', target.idol_id)
                .single();
              if (idol) idolName = idol.stage_name;
            }

            return {
              ...app,
              applicant_name: applicant?.name || '未知',
              idol_name: idolName,
            };
          })
        );
        setApplications(applicationsWithDetails);
      }

      // 獲取練習時間表
      const { data: schedules } = await supabase
        .from('practice_schedule')
        .select('*')
        .eq('p_id', parseInt(projectId))
        .order('practice_date');

      if (schedules) setPracticeSchedules(schedules);
    } catch (error) {
      console.error('Error fetching project detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A':
        return '招募中';
      case 'D':
        return '進行中';
      case 'F':
        return '已完成';
      case 'W':
        return '等待審核';
      case 'R':
        return '已拒絕';
      case 'C':
        return '已取消';
      default:
        return status;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">專案不存在</p>
        <button
          onClick={() => router.push('/admin/projects')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">專案詳情</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 返回
        </button>
      </div>

      {/* 基本資料 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">基本資料</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm text-gray-600">專案 ID</span>
            <p className="text-lg font-medium text-gray-900">{project.p_id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">專案標題</span>
            <p className="text-lg font-medium text-gray-900">{project.porject_title}</p>
          </div>
          {project.discription && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">描述</span>
              <p className="text-lg font-medium text-gray-900 mt-1">{project.discription}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">創建者</span>
            <p className="text-lg font-medium text-gray-900">
              {creatorName} (ID: {project.creator_id})
            </p>
          </div>
          {songTitle && (
            <div>
              <span className="text-sm text-gray-600">歌曲</span>
              <p className="text-lg font-medium text-gray-900">
                {songTitle}
                {songGroup && ` - ${songGroup}`}
                {songDifficulty !== null && ` (難度: ${songDifficulty}/10)`}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">目標人數</span>
            <p className="text-lg font-medium text-gray-900">{project.target_cnt} 人</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">狀態</span>
            <p className="text-lg font-medium text-gray-900">{getStatusText(project.status)}</p>
          </div>
          {project.practice_location && (
            <div>
              <span className="text-sm text-gray-600">練習地點</span>
              <p className="text-lg font-medium text-gray-900">{project.practice_location}</p>
            </div>
          )}
          {project.performance_location && (
            <div>
              <span className="text-sm text-gray-600">拍攝地點</span>
              <p className="text-lg font-medium text-gray-900">{project.performance_location}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">建立時間</span>
            <p className="text-lg font-medium text-gray-900">
              {new Date(project.create_at).toLocaleString('zh-TW')}
            </p>
          </div>
          {project.update_at && (
            <div>
              <span className="text-sm text-gray-600">更新時間</span>
              <p className="text-lg font-medium text-gray-900">
                {new Date(project.update_at).toLocaleString('zh-TW')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 成員名單與位置分配 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          成員名單與位置分配 ({filledCount}/{positions.length})
        </h2>
        {positions.length === 0 ? (
          <p className="text-gray-500">尚無位置資料</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <div
                key={position.target_seq}
                className={`border rounded-lg p-4 ${
                  position.member_id ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {position.is_backup
                    ? `伴舞 ${position.target_seq}`
                    : position.idol_name
                    ? `${position.idol_name} (位置 ${position.target_seq})`
                    : `位置 ${position.target_seq}`}
                </div>
                {position.member_id ? (
                  <div className="text-sm text-green-700 mt-1">
                    成員：{position.member_name}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">空缺</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 所有申請記錄 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">所有申請記錄 ({applications.length})</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">尚無申請記錄</p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {app.applicant_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.is_backup
                        ? `伴舞 ${app.target_seq}`
                        : app.idol_name
                        ? `${app.idol_name} (位置 ${app.target_seq})`
                        : `位置 ${app.target_seq}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      申請時間：{new Date(app.applied_time).toLocaleString('zh-TW')}
                      {app.review_time &&
                        ` · 審核時間：${new Date(app.review_time).toLocaleString('zh-TW')}`}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      app.status === 'W'
                        ? 'bg-yellow-100 text-yellow-800'
                        : app.status === 'A'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'R'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {getStatusText(app.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 練習時間表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">練習時間表 ({practiceSchedules.length})</h2>
        {practiceSchedules.length === 0 ? (
          <p className="text-gray-500">尚無練習時間</p>
        ) : (
          <div className="space-y-2">
            {practiceSchedules.map((schedule) => (
              <div
                key={schedule.schedule_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="font-medium text-gray-900">
                  {new Date(schedule.practice_date).toLocaleDateString('zh-TW')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 專案進度 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">專案進度</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">完成度</span>
              <span className="text-sm font-medium text-gray-900">
                {filledCount} / {positions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${positions.length > 0 ? (filledCount / positions.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">專案狀態</span>
            <p className="text-lg font-medium text-gray-900">{getStatusText(project.status)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

