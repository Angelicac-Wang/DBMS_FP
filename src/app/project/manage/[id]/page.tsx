'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Application {
  appli_id: number;
  applicant_id: number;
  target_seq: number;
  applied_time: string;
  status: string;
  applicant_name?: string;
  applicant_skills?: any[];
  applicant_portfolios?: any[];
  idol_name?: string;
}

interface PracticeSchedule {
  date: string;
  start_time: string;
  end_time: string;
}

export default function ManageProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [practiceSchedules, setPracticeSchedules] = useState<PracticeSchedule[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ date: '', start_time: '', end_time: '' });
  const [songInfo, setSongInfo] = useState<{ title: string; group_name?: string } | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    if (projectId) {
      fetchProjectData(projectId, id);
    }
  }, [projectId, router]);

  const fetchProjectData = async (id: string, creatorId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/projects/${id}/manage?userId=${creatorId}`);
      if (!response.ok) {
        if (response.status === 403) {
          setError('您不是此專案的創建者');
          return;
        }
        throw new Error('Failed to fetch project data');
      }

      const data = await response.json();

      setProject(data.project);
      setSongInfo(data.songInfo);
      setPracticeSchedules(data.practiceSchedules || []);
      setTargets(data.targets || []);
      setMembers(data.members || []);
      setApplications(data.applications || []);
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (appliId: number, status: 'A' | 'R') => {
    try {
      const response = await fetch(`/api/projects/${projectId}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appli_id: appliId, status }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '操作失敗');
      }

      // 重新載入資料
      if (userId) {
        fetchProjectData(projectId, userId);
      }
    } catch (err: any) {
      setError('操作失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.date || !newSchedule.start_time || !newSchedule.end_time) {
      setError('請填寫完整的時間資訊');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          date: newSchedule.date,
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '新增失敗');
      }

      setNewSchedule({ date: '', start_time: '', end_time: '' });
      setShowScheduleForm(false);
      if (userId) {
        fetchProjectData(projectId, userId);
      }
    } catch (err: any) {
      setError('新增失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleDeleteSchedule = async (date: string) => {
    if (!confirm('確定要刪除此練習時間嗎？')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          schedule_date: date,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '刪除失敗');
      }

      if (userId) {
        fetchProjectData(projectId, userId);
      }
    } catch (err: any) {
      setError('刪除失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('確定要刪除此專案嗎？此操作無法復原，所有相關資料（練習時間、成員、申請等）都將被刪除。')) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/manage`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '刪除失敗');
      }

      // 刪除成功，返回專案列表
      alert('專案已成功刪除');
      router.push('/profile/projects');
    } catch (err: any) {
      setError('刪除失敗：' + (err.message || '未知錯誤'));
      setLoading(false);
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

  if (!project || error) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">{error || '專案不存在或無權限訪問'}</p>
            <button
              onClick={() => router.push('/profile/projects')}
              className="mt-4 px-4 py-2 bg-[#eca382] text-white rounded-lg hover:bg-[#e08f6f]"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6ec] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eca382]">專案管理</h1>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              刪除專案
            </button>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 返回
            </button>
          </div>
        </div>

        {/* 專案資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{project.porject_title}</h2>
          {songInfo && (
            <p className="text-sm text-gray-600 mb-4">
              歌曲：{songInfo.title}
              {songInfo.group_name && ` (${songInfo.group_name})`}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">狀態：</span>
              <span className="font-medium text-gray-800">
                {project.status === 'A' ? '招募中' : project.status === 'D' ? '進行中' : '已完成'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">目標人數：</span>
              <span className="font-medium text-gray-800">{project.target_cnt}</span>
            </div>
            <div>
              <span className="text-gray-600">練習地點：</span>
              <span className="font-medium text-gray-800">{project.practice_location}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 練習時間管理 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">練習時間</h2>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
            >
              + 新增時間
            </button>
          </div>

          {showScheduleForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
                <input
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
                <input
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-[#eca382] text-white rounded-lg text-sm hover:bg-[#e08f6f]"
                >
                  確認
                </button>
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    setNewSchedule({ date: '', start_time: '', end_time: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {practiceSchedules.map((schedule, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  {new Date(schedule.date).toLocaleDateString('zh-TW')} {schedule.start_time.substring(0, 5)}-{schedule.end_time.substring(0, 5)}
                </span>
                <button
                  onClick={() => handleDeleteSchedule(schedule.date)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  刪除
                </button>
              </div>
            ))}
            {practiceSchedules.length === 0 && (
              <p className="text-gray-500 text-center py-4">尚未設定練習時間</p>
            )}
          </div>
        </div>

        {/* 成員列表 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">專案成員</h2>
          <div className="space-y-2">
            {members.map((member, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{(member.users as any)?.name}</span>
                  <span className="text-gray-500 text-sm ml-2">位置 {member.target_seq}</span>
                </div>
                <span className="text-sm text-gray-600">
                  加入日期：{new Date(member.join_date).toLocaleDateString('zh-TW')}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-gray-500 text-center py-4">尚未有成員</p>
            )}
          </div>
        </div>

        {/* 申請審核 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">待審核申請</h2>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">目前沒有待審核的申請</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.appli_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{app.applicant_name}</h3>
                      <p className="text-sm text-gray-600">
                        申請位置：{app.idol_name ? `${app.idol_name} (位置 ${app.target_seq})` : `位置 ${app.target_seq}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        申請時間：{new Date(app.applied_time).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewApplication(app.appli_id, 'A')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleReviewApplication(app.appli_id, 'R')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        拒絕
                      </button>
                    </div>
                  </div>

                  {app.applicant_skills && app.applicant_skills.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">技能：</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {app.applicant_skills.map((skill: any, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {skill.skill_type} ({skill.proficiency_level}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.applicant_portfolios && app.applicant_portfolios.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">作品集：</span>
                      <div className="mt-1 space-y-1">
                        {app.applicant_portfolios.map((portfolio: any, idx: number) => (
                          <a
                            key={idx}
                            href={portfolio.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-[#eca382] hover:text-[#e08f6f]"
                          >
                            {portfolio.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

