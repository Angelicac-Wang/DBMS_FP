'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  video_url: string;
  title: string;
  discription?: string;
  cover_song_id?: number;
  created_at?: string;
  view_cnt?: number;
}

interface Skill {
  skill_type: string;
  proficiency_level: number;
  experience_years: number;
}

interface SocialLink {
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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setUser(null);
          setError('使用者不存在');
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch user detail`);
      }

      const data = await response.json();
      
      if (!data.user) {
        setUser(null);
        setError('使用者資料格式錯誤');
        return;
      }
      
      setUser(data.user);
      setCreatedProjects(data.createdProjects || []);
      setParticipatedProjects(data.participatedProjects || []);
      setPortfolios(data.portfolios || []);
      setSkills(data.skills || []);
      setSocialLinks(data.socialLinks || []);
      setApplications(data.applications || []);
    } catch (error: any) {
      console.error('Error fetching user detail:', error);
      setError(error.message || '載入使用者資料時發生錯誤');
      setUser(null);
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
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 max-w-md mx-auto">
            <p className="font-semibold">錯誤</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        <p className="text-gray-600">{error || '使用者不存在'}</p>
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-[#eca382] text-white rounded-lg hover:bg-[#e08f6f]"
          >
            返回列表
          </button>
          <button
            onClick={fetchUserDetail}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            重新載入
          </button>
        </div>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          <p className="font-semibold">錯誤</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

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
              <div key={portfolio.video_url} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900">{portfolio.title}</div>
                {portfolio.discription && (
                  <div className="text-sm text-gray-600 mt-1">{portfolio.discription}</div>
                )}
                {portfolio.view_cnt !== undefined && portfolio.view_cnt !== null && (
                  <div className="text-xs text-gray-500 mt-1">
                    瀏覽次數：{portfolio.view_cnt.toLocaleString()}
                  </div>
                )}
                {portfolio.created_at && (
                  <div className="text-xs text-gray-500 mt-1">
                    建立時間：{new Date(portfolio.created_at).toLocaleDateString('zh-TW')}
                  </div>
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
            {skills.map((skill, index) => (
              <div key={`${skill.skill_type}-${index}`} className="border border-gray-200 rounded-lg p-4">
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
              <div key={link.url} className="border border-gray-200 rounded-lg p-4">
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

