'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Group {
  group_id: number;
  group_name: string;
}

interface Idol {
  idol_id: number;
  stage_name: string;
  group_name: string;
}

export default function CreateSongPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [idols, setIdols] = useState<Idol[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    title_kr: '',
    release_date: '',
    duration: '',
    difficulty_level: '',
    spotify_url: '',
    youtube_original_url: '',
  });

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedIdols, setSelectedIdols] = useState<number[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchGroups();
      fetchIdols();
    }
  }, [isAdmin]);

  const fetchGroups = async () => {
    const { data } = await supabase
      .from('kpop_groups')
      .select('group_id, group_name')
      .order('group_name');
    if (data) setGroups(data);
  };

  const fetchIdols = async () => {
    const { data } = await supabase
      .from('kpop_idols')
      .select(`
        idol_id,
        stage_name,
        kpop_groups!inner(group_name)
      `)
      .limit(1000);

    if (data) {
      const idolsData = data.map((item: any) => ({
        idol_id: item.idol_id,
        stage_name: item.stage_name,
        group_name: item.kpop_groups?.group_name || '',
      }));
      setIdols(idolsData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 生成唯一的 song_id
      const generateSongId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return timestamp * 10000 + random;
      };

      let newSongId = generateSongId();
      let attempts = 0;
      while (attempts < 10) {
        const { data: checkId } = await supabase
          .from('kpop_songs')
          .select('song_id')
          .eq('song_id', newSongId)
          .single();

        if (!checkId) break;
        newSongId = generateSongId();
        attempts++;
      }

      if (attempts >= 10) {
        setError('系統繁忙，請稍後再試');
        setLoading(false);
        return;
      }

      // 插入歌曲
      const { error: insertError } = await supabase.from('kpop_songs').insert({
        song_id: newSongId,
        title: formData.title,
        title_kr: formData.title_kr,
        release_date: formData.release_date,
        duration: parseInt(formData.duration),
        difficulty_level: parseInt(formData.difficulty_level),
        spotify_url: formData.spotify_url || null,
        youtube_original_url: formData.youtube_original_url,
      });

      if (insertError) throw insertError;

      // 建立團體關聯
      if (selectedGroups.length > 0) {
        const songGroups = selectedGroups.map(groupId => ({
          song_id: newSongId,
          group_id: groupId,
        }));
        const { error: groupError } = await supabase.from('song_group').insert(songGroups);
        if (groupError) throw groupError;
      }

      // 建立偶像關聯
      if (selectedIdols.length > 0) {
        const songIdols = selectedIdols.map(idolId => ({
          song_id: newSongId,
          idol_id: idolId,
        }));
        const { error: idolError } = await supabase.from('song_idol').insert(songIdols);
        if (idolError) throw idolError;
      }

      alert('歌曲已成功建立');
      router.push('/admin/songs');
    } catch (err: any) {
      setError('建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleIdol = (idolId: number) => {
    setSelectedIdols(prev =>
      prev.includes(idolId)
        ? prev.filter(id => id !== idolId)
        : [...prev, idolId]
    );
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">新增歌曲</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 返回
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              歌曲名稱（英文） *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              歌曲名稱（韓文） *
            </label>
            <input
              type="text"
              value={formData.title_kr}
              onChange={(e) => setFormData({ ...formData, title_kr: e.target.value })}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              發行日期 *
            </label>
            <input
              type="date"
              value={formData.release_date}
              onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時長（秒） *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              難度等級 (0-10) *
            </label>
            <input
              type="number"
              value={formData.difficulty_level}
              onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
              min="0"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spotify URL
            </label>
            <input
              type="url"
              value={formData.spotify_url}
              onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube 原始影片 URL *
            </label>
            <input
              type="url"
              value={formData.youtube_original_url}
              onChange={(e) => setFormData({ ...formData, youtube_original_url: e.target.value })}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>
        </div>

        {/* 選擇演唱團體 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            演唱團體（可多選）
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-gray-500">載入中...</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <label key={group.group_id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.group_id)}
                      onChange={() => toggleGroup(group.group_id)}
                      className="rounded border-gray-300 text-[#eca382] focus:ring-[#eca382]"
                    />
                    <span className="text-sm text-gray-900">{group.group_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 選擇演唱偶像 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            演唱偶像（可多選）
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
            {idols.length === 0 ? (
              <p className="text-gray-500">載入中...</p>
            ) : (
              <div className="space-y-2">
                {idols.map((idol) => (
                  <label key={idol.idol_id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdols.includes(idol.idol_id)}
                      onChange={() => toggleIdol(idol.idol_id)}
                      className="rounded border-gray-300 text-[#eca382] focus:ring-[#eca382]"
                    />
                    <span className="text-sm text-gray-900">
                      {idol.stage_name} ({idol.group_name})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#eca382] text-white py-3 rounded-lg font-medium hover:bg-[#e08f6f] disabled:opacity-50"
          >
            {loading ? '建立中...' : '建立歌曲'}
          </button>
        </div>
      </form>
    </div>
  );
}

