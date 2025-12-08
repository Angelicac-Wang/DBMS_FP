'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Project {
  p_id: number;
  porject_title: string;
  description?: string;
  creator_id: number;
  song_id?: number;
  target_cnt: number;
  status: string;
  practice_location?: string;
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

      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setProject(null);
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const projectData = await response.json();
      setProject(projectData);
      setCreatorName(projectData.creator_name || '');
      
      if (projectData.song) {
        setSongTitle(projectData.song.title || '');
        setSongDifficulty(projectData.song.difficulty_level || null);
        setSongGroup(projectData.song.group?.group_name || '');
      }

      // 處理位置資訊
      const positionsData: Position[] = [];
      const allTargets = [
        ...(projectData.missing_positions || []),
        ...(projectData.filled_positions || []),
      ];

      allTargets.forEach((target: any) => {
        positionsData.push({
          target_seq: target.target_seq,
          idol_id: target.idol_id,
          idol_name: target.idol_name,
          member_id: target.member_id,
          member_name: target.member_name,
          is_backup: !target.idol_id,
        });
      });

      setPositions(positionsData);
      setFilledCount(projectData.filled_positions?.length || 0);

      // 獲取所有申請記錄（需要單獨 API）
      const applicationsResponse = await fetch(`/api/admin/projects/${projectId}/applications`);
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      }

      // 處理練習時間表
      const schedulesData = (projectData.practice_schedules || []).map((s: any) => ({
        schedule_id: 0, // API 可能不返回 ID
        practice_date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
      }));
      setPracticeSchedules(schedulesData);
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
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
          className="mt-4 px-4 py-2 bg-[#eca382] text-white rounded-lg"
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
          {project.description && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">描述</span>
              <p className="text-lg font-medium text-gray-900 mt-1">{project.description}</p>
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
                className="bg-[#eca382] h-2 rounded-full"
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

