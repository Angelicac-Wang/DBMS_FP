'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

interface UserProfile {
  u_id: number;
  name: string;
  email: string;
  birthdate: string;
  gender: string;
  region: string;
  phone: string;
  create_at: string;
  last_login: string;
}

interface UserSkill {
  skill_type: string;
  proficiency_level: number;
  years_of_experience: number;
  discription: string;
}

interface SocialLink {
  url: string;
  platform: string;
  follower_cnt: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // formatDate 在 profile 頁面有不同用途，使用本地函數
  const formatDateLocal = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW');
  };

  useEffect(() => {
    // 檢查是否已登入
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth');
      return;
    }

    fetchUserProfile(userId);
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);

      // 獲取用戶基本資料
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('u_id, name, email, birthdate, gender, region, phone, create_at, last_login')
        .eq('u_id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // 獲取用戶技能
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('skill_type, proficiency_level, years_of_experience, discription')
        .eq('u_id', userId);

      if (!skillsError && skillsData) {
        setSkills(skillsData);
      }

      // 獲取社群連結
      const { data: linksData, error: linksError } = await supabase
        .from('user_social_link')
        .select('url, platform, follower_cnt')
        .eq('u_id', userId);

      if (!linksError && linksData) {
        setSocialLinks(linksData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.push('/auth');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderText = (gender: string) => {
    return gender === 'B' ? '男' : '女';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">無法載入用戶資料</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">個人檔案</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/profile/edit')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              編輯資料
            </button>
            <button
              onClick={() => router.push('/profile/portfolio')}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors"
            >
              作品集
            </button>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/profile/projects')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold">我的專案</div>
            <div className="text-sm opacity-90">查看所有專案記錄</div>
          </button>
          <button
            onClick={() => router.push('/project/create')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-bold">建立專案</div>
            <div className="text-sm opacity-90">發起新的翻跳專案</div>
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">用戶ID: {user.u_id}</p>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">Email:</span>
              <span className="text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">電話:</span>
              <span className="text-gray-800">{user.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">性別:</span>
              <span className="text-gray-800">{getGenderText(user.gender)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">生日:</span>
              <span className="text-gray-800">{formatDateLocal(user.birthdate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">地區:</span>
              <span className="text-gray-800">{user.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">註冊日期:</span>
              <span className="text-gray-800">{formatDateLocal(user.create_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-20">最後登入:</span>
              <span className="text-gray-800">{formatDateLocal(user.last_login)}</span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">技能</h3>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{skill.skill_type}</span>
                    <span className="text-sm text-gray-600">經驗 {skill.years_of_experience} 年</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>熟練度</span>
                      <span>{skill.proficiency_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${skill.proficiency_level}%` }}
                      ></div>
                    </div>
                  </div>
                  {skill.discription && (
                    <p className="text-sm text-gray-600 mt-2">{skill.discription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">社群連結</h3>
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {link.platform === 'Instagram' ? '📷' : link.platform === 'YouTube' ? '📺' : '🔗'}
                    </span>
                    <div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {link.platform}
                      </a>
                      <p className="text-sm text-gray-500">{link.follower_cnt.toLocaleString()} 追蹤者</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

