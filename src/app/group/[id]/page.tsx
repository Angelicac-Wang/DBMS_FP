'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { getGroupTypeText } from '@/lib/utils';

interface GroupDetail {
  group_id: number;
  group_name: string;
  group_namekr?: string;
  debut_date: string;
  company: string;
  group_type: string;
  member_count: number;
  logo_image?: string;
  discription?: string;
  members?: Array<{ idol_id: number; stage_name: string; stage_name_kr: string }>;
  songs?: Array<{ song_id: number; title: string; title_kr: string }>;
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupDetail | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail(groupId);
    }
  }, [groupId]);

  const fetchGroupDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // 獲取團體基本資訊
      const { data: groupData, error } = await supabase
        .from('kpop_groups')
        .select('*')
        .eq('group_id', id)
        .single();

      if (error) throw error;

      // 獲取團體成員
      const { data: idols } = await supabase
        .from('kpop_idols')
        .select('idol_id, stage_name, stage_name_kr')
        .eq('group_id', id)
        .order('idol_id');

      // 獲取團體的歌曲
      const { data: songGroups } = await supabase
        .from('song_group')
        .select('song_id')
        .eq('group_id', id);

      const songs: Array<{ song_id: number; title: string; title_kr: string }> = [];
      if (songGroups) {
        for (const sg of songGroups) {
          const { data: song } = await supabase
            .from('kpop_songs')
            .select('song_id, title, title_kr')
            .eq('song_id', sg.song_id)
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

      setGroup({
        ...groupData,
        members: idols || [],
        songs: songs,
      });
    } catch (err) {
      console.error('Error fetching group detail:', err);
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

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">團體不存在</p>
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{group.group_name}</h1>
          {group.group_namekr && (
            <p className="text-xl text-white/90">{group.group_namekr}</p>
          )}
        </div>

        {/* 基本資訊 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600 text-sm block mb-1">出道日期</span>
              <p className="font-medium text-gray-800">{new Date(group.debut_date).toLocaleDateString('zh-TW')}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">經紀公司</span>
              <p className="font-medium text-gray-800">{group.company}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">團體類型</span>
              <p className="font-medium text-gray-800">{getGroupTypeText(group.group_type)}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-1">成員數量</span>
              <p className="font-medium text-gray-800">{group.member_count} 人</p>
            </div>
          </div>
        </div>

        {/* 團體描述 */}
        {group.discription && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">團體介紹</h2>
            <p className="text-gray-700 leading-relaxed">{group.discription}</p>
          </div>
        )}

        {/* 成員列表 */}
        {group.members && group.members.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">成員列表</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.members.map((member) => (
                <Link
                  key={member.idol_id}
                  href={`/idol/${member.idol_id}`}
                  className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-gray-800">{member.stage_name}</p>
                  {member.stage_name_kr && (
                    <p className="text-sm text-gray-600 mt-1">{member.stage_name_kr}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 歌曲列表 */}
        {group.songs && group.songs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">代表歌曲</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.songs.map((song) => (
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

