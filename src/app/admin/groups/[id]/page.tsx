'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Group {
  group_id: number;
  group_name: string;
  group_namekr?: string;
  debut_date: string;
  company: string;
  group_type: string;
  member_count: number;
  logo_image?: string;
  discription?: string;
}

interface Idol {
  idol_id: number;
  stage_name: string;
  stage_name_kr: string;
  nationality: string;
  debut_date: string;
}

interface Song {
  song_id: number;
  title: string;
  title_kr: string;
}

export default function GroupDetailPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    if (isAdmin && groupId) {
      fetchGroupDetail();
    }
  }, [isAdmin, groupId]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);

      // 獲取團體基本資訊
      const { data: groupData, error: groupError } = await supabase
        .from('kpop_groups')
        .select('*')
        .eq('group_id', parseInt(groupId))
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // 獲取成員列表（透過 GROUP_IDOL 關聯表）
      const { data: groupIdols } = await supabase
        .from('group_idol')
        .select('idol_id')
        .eq('group_id', parseInt(groupId));
      
      if (groupIdols && groupIdols.length > 0) {
        const idolIds = groupIdols.map(gi => gi.idol_id);
        const { data: idolsData } = await supabase
          .from('kpop_idols')
          .select('idol_id, stage_name, stage_name_kr, nationality, debut_date')
          .in('idol_id', idolIds)
          .order('idol_id');
        
        if (idolsData) setIdols(idolsData);
      } else {
        setIdols([]);
      }

      // 獲取歌曲列表
      const { data: songGroups } = await supabase
        .from('song_group')
        .select('song_id')
        .eq('group_id', parseInt(groupId));

      if (songGroups && songGroups.length > 0) {
        const songIds = songGroups.map(sg => sg.song_id);
        const { data: songsData } = await supabase
          .from('kpop_songs')
          .select('song_id, title, title_kr')
          .in('song_id', songIds)
          .order('title');

        if (songsData) setSongs(songsData);
      }

      // 獲取相關專案統計
      const { data: projects } = await supabase
        .from('project')
        .select('p_id', { count: 'exact', head: true })
        .eq('song_id', parseInt(groupId));

      // 實際上需要透過 SONG_GROUP 來查詢，這裡簡化處理
      const { count } = await supabase
        .from('song_group')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', parseInt(groupId));

      // 查詢使用此團體歌曲的專案數
      if (songGroups && songGroups.length > 0) {
        const songIds = songGroups.map(sg => sg.song_id);
        const { count: projectCountData } = await supabase
          .from('project')
          .select('*', { count: 'exact', head: true })
          .in('song_id', songIds);

        setProjectCount(projectCountData || 0);
      }
    } catch (error) {
      console.error('Error fetching group detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeText = (type: string) => {
    switch (type) {
      case 'B':
        return '男團';
      case 'G':
        return '女團';
      case 'M':
        return '混團';
      default:
        return type;
    }
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

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">團體不存在</p>
        <button
          onClick={() => router.push('/admin/groups')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">團體詳情</h1>
        <div className="flex gap-3">
          <Link
            href={`/admin/groups/${groupId}/edit`}
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
            <span className="text-sm text-gray-600">團體名稱（英文）</span>
            <p className="text-lg font-medium text-gray-900">{group.group_name}</p>
          </div>
          {group.group_namekr && (
            <div>
              <span className="text-sm text-gray-600">團體名稱（韓文）</span>
              <p className="text-lg font-medium text-gray-900">{group.group_namekr}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">團體類型</span>
            <p className="text-lg font-medium text-gray-900">{getGroupTypeText(group.group_type)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">經紀公司</span>
            <p className="text-lg font-medium text-gray-900">{group.company}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">成員人數</span>
            <p className="text-lg font-medium text-gray-900">{group.member_count} 人</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">出道日期</span>
            <p className="text-lg font-medium text-gray-900">
              {new Date(group.debut_date).toLocaleDateString('zh-TW')}
            </p>
          </div>
          {group.logo_image && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">Logo</span>
              <div className="mt-2">
                <img
                  src={group.logo_image}
                  alt={group.group_name}
                  className="h-32 w-32 object-contain"
                />
              </div>
            </div>
          )}
          {group.discription && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">描述</span>
              <p className="mt-2 text-gray-900">{group.discription}</p>
            </div>
          )}
        </div>
      </div>

      {/* 成員列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">成員列表</h2>
        {idols.length === 0 ? (
          <p className="text-gray-500">尚無成員資料</p>
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
                <div className="text-xs text-gray-500 mt-1">
                  {idol.nationality} · {new Date(idol.debut_date).toLocaleDateString('zh-TW')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 歌曲列表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">歌曲列表</h2>
        {songs.length === 0 ? (
          <p className="text-gray-500">尚無歌曲資料</p>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <Link
                key={song.song_id}
                href={`/admin/songs/${song.song_id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{song.title}</div>
                {song.title_kr && (
                  <div className="text-sm text-gray-600">{song.title_kr}</div>
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
          使用此團體歌曲的專案數：<span className="font-bold">{projectCount}</span>
        </div>
      </div>
    </div>
  );
}

