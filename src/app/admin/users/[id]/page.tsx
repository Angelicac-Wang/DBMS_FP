'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface User {
  u_id: number;
  name: string;
  email: string;
  birthdate?: string;
  gender?: string;
  region?: string;
  phone?: string;
  status: string;
  create_at: string;
  last_login?: string;
}

interface Project {
  p_id: number;
  porject_title: string;
  status: string;
  create_at: string;
}

interface ParticipatedProject {
  p_id: number;
  porject_title: string;
  target_seq: number;
  join_date: string;
}

interface Portfolio {
  portfolio_id: number;
  title: string;
  video_url: string;
  discription?: string;
}

interface Skill {
  skill_id: number;
  skill_type: string;
  proficiency_level: number;
  experience_years: number;
}

interface SocialLink {
  link_id: number;
  platform: string;
  url: string;
  follower_count?: number;
}

interface Application {
  application_id: number;
  p_id: number;
  porject_title: string;
  target_seq: number;
  status: string;
  applied_time: string;
}

export default function UserDetailPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [participatedProjects, setParticipatedProjects] = useState<ParticipatedProject[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (isAdmin && userId) {
      fetchUserDetail();
    }
  }, [isAdmin, userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);

      // 獲取使用者基本資料
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('u_id', parseInt(userId))
        .single();

      if (userError) throw userError;
      setUser(userData);

      // 獲取發起的專案
      const { data: createdProjectsData } = await supabase
        .from('project')
        .select('p_id, porject_title, status, create_at')
        .eq('creator_id', parseInt(userId))
        .order('create_at', { ascending: false });

      if (createdProjectsData) setCreatedProjects(createdProjectsData);

      // 獲取參與的專案
      const { data: membersData } = await supabase
        .from('project_members')
        .select('p_id, target_seq, join_date')
        .eq('member_id', parseInt(userId))
        .eq('status', 'Y');

      if (membersData && membersData.length > 0) {
        const projectIds = membersData.map(m => m.p_id);
        const { data: projectsData } = await supabase
          .from('project')
          .select('p_id, porject_title')
          .in('p_id', projectIds);

        if (projectsData) {
          const participated = membersData.map(m => {
            const project = projectsData.find(p => p.p_id === m.p_id);
            return {
              p_id: m.p_id,
              porject_title: project?.porject_title || '未知專案',
              target_seq: m.target_seq,
              join_date: m.join_date,
            };
          });
          setParticipatedProjects(participated);
        }
      }

      // 獲取作品集
      const { data: portfoliosData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('u_id', parseInt(userId))
        .order('portfolio_id', { ascending: false });

      if (portfoliosData) setPortfolios(portfoliosData);

      // 獲取技能
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('u_id', parseInt(userId));

      if (skillsData) setSkills(skillsData);

      // 獲取社群連結
      const { data: socialLinksData } = await supabase
        .from('user_social_link')
        .select('*')
        .eq('u_id', parseInt(userId));

      if (socialLinksData) setSocialLinks(socialLinksData);

      // 獲取申請記錄
      const { data: applicationsData } = await supabase
        .from('project_applications')
        .select('application_id, p_id, target_seq, status, applied_time')
        .eq('applicant_id', parseInt(userId))
        .order('applied_time', { ascending: false });

      if (applicationsData && applicationsData.length > 0) {
        const projectIds = applicationsData.map(a => a.p_id);
        const { data: projectsData } = await supabase
          .from('project')
          .select('p_id, porject_title')
          .in('p_id', projectIds);

        if (projectsData) {
          const applicationsWithTitle = applicationsData.map(a => {
            const project = projectsData.find(p => p.p_id === a.p_id);
            return {
              ...a,
              porject_title: project?.porject_title || '未知專案',
            };
          });
          setApplications(applicationsWithTitle);
        }
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'B':
        return '男';
      case 'G':
        return '女';
      default:
        return '未知';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A':
        return '啟用';
      case 'D':
        return '進行中';
      case 'F':
        return '已完成';
      case 'N':
        return '停用';
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">使用者不存在</p>
        <button
          onClick={() => router.push('/admin/users')}
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
        <h1 className="text-3xl font-bold text-gray-900">使用者詳情</h1>
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
            <span className="text-sm text-gray-600">使用者 ID</span>
            <p className="text-lg font-medium text-gray-900">{user.u_id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">名稱</span>
            <p className="text-lg font-medium text-gray-900">{user.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Email</span>
            <p className="text-lg font-medium text-gray-900">{user.email}</p>
          </div>
          {user.birthdate && (
            <div>
              <span className="text-sm text-gray-600">生日</span>
              <p className="text-lg font-medium text-gray-900">
                {new Date(user.birthdate).toLocaleDateString('zh-TW')}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">性別</span>
            <p className="text-lg font-medium text-gray-900">{getGenderText(user.gender)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">地區</span>
            <p className="text-lg font-medium text-gray-900">{user.region || '-'}</p>
          </div>
          {user.phone && (
            <div>
              <span className="text-sm text-gray-600">電話</span>
              <p className="text-lg font-medium text-gray-900">{user.phone}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">狀態</span>
            <p className="text-lg font-medium text-gray-900">{getStatusText(user.status)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">註冊日期</span>
            <p className="text-lg font-medium text-gray-900">
              {new Date(user.create_at).toLocaleDateString('zh-TW')}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">最後登入</span>
            <p className="text-lg font-medium text-gray-900">
              {user.last_login
                ? new Date(user.last_login).toLocaleDateString('zh-TW')
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 發起的專案 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">發起的專案 ({createdProjects.length})</h2>
        {createdProjects.length === 0 ? (
          <p className="text-gray-500">尚無發起的專案</p>
        ) : (
          <div className="space-y-2">
            {createdProjects.map((project) => (
              <Link
                key={project.p_id}
                href={`/admin/projects/${project.p_id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{project.porject_title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(project.create_at).toLocaleDateString('zh-TW')}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'A'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'D'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {getStatusText(project.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 參與的專案 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">參與的專案 ({participatedProjects.length})</h2>
        {participatedProjects.length === 0 ? (
          <p className="text-gray-500">尚無參與的專案</p>
        ) : (
          <div className="space-y-2">
            {participatedProjects.map((project) => (
              <Link
                key={`${project.p_id}-${project.target_seq}`}
                href={`/admin/projects/${project.p_id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{project.porject_title}</div>
                <div className="text-sm text-gray-500">
                  位置：{project.target_seq} · 加入日期：{new Date(project.join_date).toLocaleDateString('zh-TW')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 作品集 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">作品集 ({portfolios.length})</h2>
        {portfolios.length === 0 ? (
          <p className="text-gray-500">尚無作品集</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.portfolio_id} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900">{portfolio.title}</div>
                {portfolio.discription && (
                  <div className="text-sm text-gray-600 mt-1">{portfolio.discription}</div>
                )}
                <a
                  href={portfolio.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#eca382] hover:text-[#e08f6f] text-sm mt-2 inline-block"
                >
                  查看影片 →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 技能 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">技能 ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="text-gray-500">尚無技能資料</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill.skill_id} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900">{skill.skill_type}</div>
                <div className="text-sm text-gray-600 mt-1">
                  熟練度：{skill.proficiency_level}/10 · 經驗：{skill.experience_years} 年
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 社群連結 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">社群連結 ({socialLinks.length})</h2>
        {socialLinks.length === 0 ? (
          <p className="text-gray-500">尚無社群連結</p>
        ) : (
          <div className="space-y-2">
            {socialLinks.map((link) => (
              <div key={link.link_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{link.platform}</div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#eca382] hover:text-[#e08f6f] text-sm"
                    >
                      {link.url}
                    </a>
                  </div>
                  {link.follower_count !== null && link.follower_count !== undefined && (
                    <div className="text-sm text-gray-600">
                      {link.follower_count.toLocaleString()} 追蹤者
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 申請記錄 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">申請記錄 ({applications.length})</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">尚無申請記錄</p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <Link
                key={app.application_id}
                href={`/admin/projects/${app.p_id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{app.porject_title}</div>
                    <div className="text-sm text-gray-500">
                      位置：{app.target_seq} · 申請時間：{new Date(app.applied_time).toLocaleDateString('zh-TW')}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

