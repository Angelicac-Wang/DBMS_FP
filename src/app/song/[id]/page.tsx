'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

interface SongDetail {
  song_id: number;
  title: string;
  title_kr: string;
  release_date: string;
  duration: number;
  difficulty_level: number;
  spotify_url?: string;
  youtube_original_url: string;
  groups?: Array<{ group_id: number; group_name: string; group_namekr?: string }>;
  idols?: Array<{ idol_id: number; stage_name: string; stage_name_kr: string }>;
}

export default function SongDetailPage() {
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState<SongDetail | null>(null);

  useEffect(() => {
    if (songId) {
      fetchSongDetail(songId);
    }
  }, [songId]);

  const fetchSongDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // 獲取歌曲基本資訊
      const { data: songData, error } = await supabase
        .from('kpop_songs')
        .select('*')
        .eq('song_id', id)
        .single();

      if (error) throw error;

      // 獲取關聯的團體
      const { data: songGroups } = await supabase
        .from('song_group')
        .select('group_id')
        .eq('song_id', id);

      const groups: Array<{ group_id: number; group_name: string; group_namekr?: string }> = [];
      if (songGroups) {
        for (const sg of songGroups) {
          const { data: group } = await supabase
            .from('kpop_groups')
            .select('group_id, group_name, group_namekr')
            .eq('group_id', sg.group_id)
            .single();
          if (group) {
            groups.push({
              group_id: group.group_id,
              group_name: group.group_name,
              group_namekr: group.group_namekr || undefined,
            });
          }
        }
      }

      // 獲取關聯的偶像
      const { data: songIdols } = await supabase
        .from('song_idol')
        .select('idol_id')
        .eq('song_id', id);

      const idols: Array<{ idol_id: number; stage_name: string; stage_name_kr: string }> = [];
      if (songIdols) {
        for (const si of songIdols) {
          const { data: idol } = await supabase
            .from('kpop_idols')
            .select('idol_id, stage_name, stage_name_kr')
            .eq('idol_id', si.idol_id)
            .single();
          if (idol) {
            idols.push({
              idol_id: idol.idol_id,
              stage_name: idol.stage_name,
              stage_name_kr: idol.stage_name_kr,
            });
          }
        }
      }

      setSong({
        ...songData,
        groups,
        idols,
      });
    } catch (err) {
      console.error('Error fetching song detail:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">歌曲不存在</p>
            <button
              onClick={() => router.back()}
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        {/* 標題區 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
          {song.title_kr && (
            <p className="text-xl text-white/90">{song.title_kr}</p>
          )}
        </div>

        {/* 基本資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600 text-sm block mb-1">發行日期</span>
              <p className="font-medium text-gray-800">{new Date(song.release_date).toLocaleDateString('zh-TW')}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">時長</span>
              <p className="font-medium text-gray-800">{formatDuration(song.duration)}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">難度等級</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{song.difficulty_level}/10</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(song.difficulty_level / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 關聯團體 */}
        {song.groups && song.groups.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">演唱團體</h2>
            <div className="flex flex-wrap gap-3">
              {song.groups.map((group) => (
                <Link
                  key={group.group_id}
                  href={`/group/${group.group_id}`}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {group.group_name}
                  {group.group_namekr && ` (${group.group_namekr})`}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 關聯偶像 */}
        {song.idols && song.idols.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">參與偶像</h2>
            <div className="flex flex-wrap gap-3">
              {song.idols.map((idol) => (
                <Link
                  key={idol.idol_id}
                  href={`/idol/${idol.idol_id}`}
                  className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                  {idol.stage_name}
                  {idol.stage_name_kr && ` (${idol.stage_name_kr})`}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 外部連結 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">外部連結</h2>
          <div className="flex gap-4">
            {song.youtube_original_url && (
              <a
                href={song.youtube_original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube MV
              </a>
            )}
            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.84 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

