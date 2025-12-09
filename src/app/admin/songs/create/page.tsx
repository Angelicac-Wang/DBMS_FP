'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    try {
      const response = await fetch('/api/admin/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchIdols = async () => {
    try {
      const response = await fetch('/api/admin/idols');
      if (response.ok) {
        const data = await response.json();
        setIdols(data);
      }
    } catch (error) {
      console.error('Error fetching idols:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          title_kr: formData.title_kr,
          release_date: formData.release_date,
          duration: parseInt(formData.duration),
          spotify_url: formData.spotify_url || null,
          youtube_original_url: formData.youtube_original_url,
          groups: selectedGroups,
          idols: selectedIdols,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '建立失敗');
        return;
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
                {groups.map((group, index) => (
                  <label key={`group-${group.group_id}-${index}`} className="flex items-center space-x-2 cursor-pointer">
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
                {idols.map((idol, index) => (
                  <label key={`idol-${idol.idol_id}-${idol.group_name || ''}-${index}`} className="flex items-center space-x-2 cursor-pointer">
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

