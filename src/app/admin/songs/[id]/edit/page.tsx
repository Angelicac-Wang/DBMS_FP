'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditSongPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (isAdmin && songId) {
      fetchGroups();
      fetchIdols();
      fetchSong();
    }
  }, [isAdmin, songId]);

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

  const fetchSong = async () => {
    try {
      setLoading(true);
      const { data: songData, error: songError } = await supabase
        .from('kpop_songs')
        .select('*')
        .eq('song_id', parseInt(songId))
        .single();

      if (songError) throw songError;

      if (songData) {
        setFormData({
          title: songData.title,
          title_kr: songData.title_kr,
          release_date: songData.release_date,
          duration: songData.duration.toString(),
          difficulty_level: songData.difficulty_level.toString(),
          spotify_url: songData.spotify_url || '',
          youtube_original_url: songData.youtube_original_url,
        });

        // 獲取現有的團體關聯
        const { data: songGroups } = await supabase
          .from('song_group')
          .select('group_id')
          .eq('song_id', parseInt(songId));

        if (songGroups) {
          setSelectedGroups(songGroups.map(sg => sg.group_id));
        }

        // 獲取現有的偶像關聯
        const { data: songIdols } = await supabase
          .from('song_idol')
          .select('idol_id')
          .eq('song_id', parseInt(songId));

        if (songIdols) {
          setSelectedIdols(songIdols.map(si => si.idol_id));
        }
      }
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // 更新歌曲
      const { error: updateError } = await supabase
        .from('kpop_songs')
        .update({
          title: formData.title,
          title_kr: formData.title_kr,
          release_date: formData.release_date,
          duration: parseInt(formData.duration),
          difficulty_level: parseInt(formData.difficulty_level),
          spotify_url: formData.spotify_url || null,
          youtube_original_url: formData.youtube_original_url,
        })
        .eq('song_id', parseInt(songId));

      if (updateError) throw updateError;

      // 更新團體關聯（先刪除再新增）
      await supabase.from('song_group').delete().eq('song_id', parseInt(songId));
      if (selectedGroups.length > 0) {
        const songGroups = selectedGroups.map(groupId => ({
          song_id: parseInt(songId),
          group_id: groupId,
        }));
        const { error: groupError } = await supabase.from('song_group').insert(songGroups);
        if (groupError) throw groupError;
      }

      // 更新偶像關聯（先刪除再新增）
      await supabase.from('song_idol').delete().eq('song_id', parseInt(songId));
      if (selectedIdols.length > 0) {
        const songIdols = selectedIdols.map(idolId => ({
          song_id: parseInt(songId),
          idol_id: idolId,
        }));
        const { error: idolError } = await supabase.from('song_idol').insert(songIdols);
        if (idolError) throw idolError;
      }

      alert('歌曲已成功更新');
      router.push(`/admin/songs/${songId}`);
    } catch (err: any) {
      setError('更新失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除此歌曲嗎？此操作無法復原。')) {
      return;
    }

    try {
      // 檢查是否有關聯的專案
      const { data: projects } = await supabase
        .from('project')
        .select('p_id')
        .eq('song_id', parseInt(songId))
        .limit(1);

      if (projects && projects.length > 0) {
        alert('無法刪除：此歌曲有關聯的專案，請先處理相關專案。');
        return;
      }

      const { error: deleteError } = await supabase
        .from('kpop_songs')
        .delete()
        .eq('song_id', parseInt(songId));

      if (deleteError) throw deleteError;

      alert('歌曲已成功刪除');
      router.push('/admin/songs');
    } catch (err: any) {
      alert('刪除失敗：' + (err.message || '未知錯誤'));
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">編輯歌曲</h1>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            刪除歌曲
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  );
}

