'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

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

      // 獲取專案資訊
      const { data: projectData, error: projectError } = await supabase
        .from('project')
        .select('*')
        .eq('p_id', id)
        .single();

      if (projectError) throw projectError;

      // 檢查是否為專案創建者
      if (projectData.creator_id.toString() !== creatorId) {
        setError('您不是此專案的創建者');
        return;
      }

      setProject(projectData);

      // 獲取練習時間表
      const { data: schedules } = await supabase
        .from('practice_schedule')
        .select('*')
        .eq('p_id', id)
        .order('date', { ascending: true });

      if (schedules) setPracticeSchedules(schedules);

      // 獲取目標位置
      const { data: targetsData } = await supabase
        .from('project_target')
        .select(`
          target_seq,
          idol_id,
          status,
          kpop_idols(stage_name)
        `)
        .eq('project_id', id)
        .order('target_seq');

      if (targetsData) {
        setTargets(targetsData);
      }

      // 獲取成員
      const { data: membersData } = await supabase
        .from('project_members')
        .select(`
          member_id,
          target_seq,
          join_date,
          status,
          users(name)
        `)
        .eq('p_id', id);

      if (membersData) {
        setMembers(membersData);
      }

      // 獲取申請列表
      const { data: applicationsData, error: appError } = await supabase
        .from('project_applications')
        .select('appli_id, applicant_id, target_seq, applied_time, status')
        .eq('p_id', id)
        .eq('status', 'W') // 只顯示等待審核的申請
        .order('applied_time', { ascending: false });

      if (applicationsData) {
        // 獲取申請者詳細資訊
        const applicationsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            const { data: user } = await supabase
              .from('users')
              .select('name')
              .eq('u_id', app.applicant_id)
              .single();

            const { data: skills } = await supabase
              .from('user_skills')
              .select('*')
              .eq('u_id', app.applicant_id);

            const { data: portfolios } = await supabase
              .from('portfolios')
              .select('*')
              .eq('u_id', app.applicant_id)
              .limit(3);

            const target = targetsData?.find((t) => t.target_seq === app.target_seq);
            const idolName = target?.kpop_idols && !Array.isArray(target.kpop_idols) ? (target.kpop_idols as any).stage_name : undefined;

            return {
              ...app,
              applicant_name: user?.name,
              applicant_skills: skills || [],
              applicant_portfolios: portfolios || [],
              idol_name: idolName,
            };
          })
        );

        setApplications(applicationsWithDetails);
      }
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (appliId: number, status: 'A' | 'R') => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({
          status,
          reviewed_time: new Date().toISOString(),
        })
        .eq('appli_id', appliId);

      if (error) throw error;

      if (status === 'A') {
        // 如果接受申請，需要將申請者加入專案成員
        const application = applications.find((app) => app.appli_id === appliId);
        if (application) {
          // 更新目標狀態為已填滿
          await supabase
            .from('project_target')
            .update({ status: 'F' })
            .eq('project_id', projectId)
            .eq('target_seq', application.target_seq);

          // 加入專案成員
          await supabase
            .from('project_members')
            .insert({
              p_id: projectId,
              member_id: application.applicant_id,
              join_date: new Date().toISOString().split('T')[0],
              target_seq: application.target_seq,
              status: 'Y',
            });
        }
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
      const { error } = await supabase
        .from('practice_schedule')
        .insert({
          p_id: projectId,
          date: newSchedule.date,
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('practice_schedule')
        .delete()
        .eq('p_id', projectId)
        .eq('date', date);

      if (error) throw error;

      if (userId) {
        fetchProjectData(projectId, userId);
      }
    } catch (err: any) {
      setError('刪除失敗：' + (err.message || '未知錯誤'));
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

  if (!project || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">{error || '專案不存在或無權限訪問'}</p>
            <button
              onClick={() => router.push('/profile/projects')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              返回
            </button>
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
          <h1 className="text-3xl font-bold text-purple-600">專案管理</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        {/* 專案資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{project.porject_title}</h2>
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
            <div>
              <span className="text-gray-600">拍攝地點：</span>
              <span className="font-medium text-gray-800">{project.performance_location}</span>
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSchedule}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
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
                            className="block text-sm text-purple-600 hover:text-purple-700"
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

      <BottomNav />
    </div>
  );
}

