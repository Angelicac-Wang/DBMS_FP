'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Song {
  song_id: number;
  title: string;
  title_kr: string;
  release_date: string;
  duration: number;
  spotify_url?: string;
  youtube_original_url: string;
}

interface Group {
  group_id: number;
  group_name: string;
}

interface Idol {
  idol_id: number;
  stage_name: string;
  stage_name_kr: string;
}

export default function SongDetailPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState<Song | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    if (isAdmin && songId) {
      fetchSongDetail();
    }
  }, [isAdmin, songId]);

  const fetchSongDetail = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/songs/${songId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setSong(null);
          return;
        }
        throw new Error('Failed to fetch song');
      }

      const songData = await response.json();
      setSong(songData);
      setGroups(songData.groups || []);
      setIdols(songData.idols || []);

      // 獲取相關專案統計
      const projectCountResponse = await fetch(`/api/admin/songs/${songId}/project-count`);
      if (projectCountResponse.ok) {
        const countData = await projectCountResponse.json();
        setProjectCount(countData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching song detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (!song) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">歌曲不存在</p>
        <button
          onClick={() => router.push('/admin/songs')}
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
        <h1 className="text-3xl font-bold text-gray-900">歌曲詳情</h1>
        <div className="flex gap-3">
          <Link
            href={`/admin/songs/${songId}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            編輯
          </Link>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>
      </div>

      {/* 基本資訊 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">基本資訊</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm text-gray-600">歌曲名稱（英文）</span>
            <p className="text-lg font-medium text-gray-900">{song.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">歌曲名稱（韓文）</span>
            <p className="text-lg font-medium text-gray-900">{song.title_kr}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">發行日期</span>
            <p className="text-lg font-medium text-gray-900">
              {new Date(song.release_date).toLocaleDateString('zh-TW')}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">時長</span>
            <p className="text-lg font-medium text-gray-900">{formatDuration(song.duration)}</p>
          </div>
          {song.spotify_url && (
            <div>
              <span className="text-sm text-gray-600">Spotify</span>
              <p className="text-lg">
                <a
                  href={song.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#eca382] hover:text-[#e08f6f]"
                >
                  開啟連結
                </a>
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <span className="text-sm text-gray-600">YouTube 原始影片</span>
            <p className="text-lg">
              <a
                href={song.youtube_original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eca382] hover:text-[#e08f6f]"
              >
                開啟連結
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 演唱團體 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">演唱團體</h2>
        {groups.length === 0 ? (
          <p className="text-gray-500">尚無團體資料</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {groups.map((group) => (
              <Link
                key={group.group_id}
                href={`/admin/groups/${group.group_id}`}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {group.group_name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 演唱偶像 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">演唱偶像</h2>
        {idols.length === 0 ? (
          <p className="text-gray-500">尚無偶像資料</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idols.map((idol) => (
              <Link
                key={idol.idol_id}
                href={`/admin/idols/${idol.idol_id}`}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{idol.stage_name}</div>
                {idol.stage_name_kr && (
                  <div className="text-sm text-gray-600">{idol.stage_name_kr}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 相關專案統計 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">相關專案統計</h2>
        <div className="text-lg text-gray-900">
          使用此歌曲的專案數：<span className="font-bold">{projectCount}</span>
        </div>
      </div>
    </div>
  );
}

