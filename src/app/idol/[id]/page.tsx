'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

interface IdolDetail {
  idol_id: number;
  stage_name: string;
  stage_name_kr: string;
  nationality: string;
  debut_date: string;
  group?: {
    group_id: number;
    group_name: string;
    group_namekr?: string;
  };
  songs?: Array<{ song_id: number; title: string; title_kr: string }>;
}

export default function IdolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idolId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [idol, setIdol] = useState<IdolDetail | null>(null);

  useEffect(() => {
    if (idolId) {
      fetchIdolDetail(idolId);
    }
  }, [idolId]);

  const fetchIdolDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // 獲取偶像基本資訊
      const { data: idolData, error } = await supabase
        .from('kpop_idols')
        .select('*')
        .eq('idol_id', id)
        .single();

      if (error) throw error;

      // 獲取所屬團體
      let groupInfo = null;
      if (idolData.group_id) {
        const { data: group } = await supabase
          .from('kpop_groups')
          .select('group_id, group_name, group_namekr')
          .eq('group_id', idolData.group_id)
          .single();
        if (group) {
          groupInfo = group;
        }
      }

      // 獲取參與的歌曲
      const { data: songIdols } = await supabase
        .from('song_idol')
        .select('song_id')
        .eq('idol_id', id);

      const songs: Array<{ song_id: number; title: string; title_kr: string }> = [];
      if (songIdols) {
        for (const si of songIdols) {
          const { data: song } = await supabase
            .from('kpop_songs')
            .select('song_id, title, title_kr')
            .eq('song_id', si.song_id)
            .single();
          if (song) {
            songs.push({
              song_id: song.song_id,
              title: song.title,
              title_kr: song.title_kr,
            });
          }
        }
      }

      setIdol({
        ...idolData,
        group: groupInfo || undefined,
        songs,
      });
    } catch (err) {
      console.error('Error fetching idol detail:', err);
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

  if (!idol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">偶像不存在</p>
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
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{idol.stage_name}</h1>
          <p className="text-xl text-white/90">{idol.stage_name_kr}</p>
        </div>

        {/* 基本資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm block mb-1">國籍</span>
              <p className="font-medium text-gray-800">{idol.nationality}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">出道日期</span>
              <p className="font-medium text-gray-800">{new Date(idol.debut_date).toLocaleDateString('zh-TW')}</p>
            </div>
          </div>
        </div>

        {/* 所屬團體 */}
        {idol.group && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">所屬團體</h2>
            <Link
              href={`/group/${idol.group.group_id}`}
              className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors block"
            >
              <p className="font-medium text-gray-800 text-lg">{idol.group.group_name}</p>
              {idol.group.group_namekr && (
                <p className="text-sm text-gray-600 mt-1">{idol.group.group_namekr}</p>
              )}
            </Link>
          </div>
        )}

        {/* 參與歌曲 */}
        {idol.songs && idol.songs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">參與歌曲</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {idol.songs.map((song) => (
                <Link
                  key={song.song_id}
                  href={`/song/${song.song_id}`}
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-800">{song.title}</p>
                  {song.title_kr && (
                    <p className="text-sm text-gray-600 mt-1">{song.title_kr}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

