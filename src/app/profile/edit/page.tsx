'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

interface UserProfile {
  name: string;
  region: string;
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

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ name: '', region: '' });
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    fetchData(id);
  }, [router]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      
      // 獲取基本資料
      const { data: userData } = await supabase
        .from('users')
        .select('name, region')
        .eq('u_id', id)
        .single();

      if (userData) {
        setProfile(userData);
      }

      // 獲取技能
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('skill_type, proficiency_level, years_of_experience, discription')
        .eq('u_id', id);

      if (skillsData) {
        setSkills(skillsData);
      }

      // 獲取社群連結
      const { data: linksData } = await supabase
        .from('user_social_link')
        .select('url, platform, follower_cnt')
        .eq('u_id', id);

      if (linksData) {
        setSocialLinks(linksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setError('');

      // 更新基本資料
      await supabase
        .from('users')
        .update({ name: profile.name, region: profile.region })
        .eq('u_id', userId);

      // 更新技能（先刪除再插入）
      await supabase
        .from('user_skills')
        .delete()
        .eq('u_id', userId);

      if (skills.length > 0) {
        await supabase
          .from('user_skills')
          .insert(skills.map(skill => ({ ...skill, u_id: userId })));
      }

      // 更新社群連結（先刪除再插入）
      await supabase
        .from('user_social_link')
        .delete()
        .eq('u_id', userId);

      if (socialLinks.length > 0) {
        await supabase
          .from('user_social_link')
          .insert(socialLinks.map(link => ({ ...link, u_id: userId })));
      }

      router.push('/profile');
    } catch (err: any) {
      setError('儲存失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    setSkills([...skills, { skill_type: '', proficiency_level: 0, years_of_experience: 0, discription: '' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof UserSkill, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { url: '', platform: '', follower_cnt: 0 }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-purple-600">編輯個人資料</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 基本資料 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">基本資料</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">暱稱</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                maxLength={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地區</label>
              <input
                type="text"
                value={profile.region}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="如：雙北、台中"
              />
            </div>
          </div>
        </div>

        {/* 技能 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">技能</h2>
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              + 新增技能
            </button>
          </div>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">技能 {index + 1}</h3>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    刪除
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">技能類型</label>
                    <input
                      type="text"
                      value={skill.skill_type}
                      onChange={(e) => updateSkill(index, 'skill_type', e.target.value)}
                      maxLength={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="如：舞蹈、編舞"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">熟練度 (%)</label>
                      <input
                        type="number"
                        value={skill.proficiency_level}
                        onChange={(e) => updateSkill(index, 'proficiency_level', parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">經驗年資</label>
                      <input
                        type="number"
                        value={skill.years_of_experience}
                        onChange={(e) => updateSkill(index, 'years_of_experience', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={skill.discription || ''}
                      onChange={(e) => updateSkill(index, 'discription', e.target.value)}
                      maxLength={200}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="技能描述..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-gray-500 text-center py-4">尚未新增任何技能</p>
            )}
          </div>
        </div>

        {/* 社群連結 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">社群連結</h2>
            <button
              onClick={addSocialLink}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              + 新增連結
            </button>
          </div>
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">連結 {index + 1}</h3>
                  <button
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    刪除
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">平台</label>
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">請選擇平台</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter">Twitter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">連結網址</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">追蹤者數</label>
                    <input
                      type="number"
                      value={link.follower_cnt}
                      onChange={(e) => updateSocialLink(index, 'follower_cnt', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-gray-500 text-center py-4">尚未新增任何社群連結</p>
            )}
          </div>
        </div>

        {/* 儲存按鈕 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

