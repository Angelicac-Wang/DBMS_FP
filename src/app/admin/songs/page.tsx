'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Song {
  song_id: number;
  title: string;
  title_kr: string;
  release_date: string;
  duration: number;
  difficulty_level: number;
  spotify_url?: string;
  youtube_original_url: string;
  groups?: string[];
}

export default function SongsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
    }
  }, [isAdmin]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      let query = supabase.from('kpop_songs').select('*');

      // 搜尋
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,title_kr.ilike.%${searchQuery}%`);
      }

      // 篩選難度
      if (filterDifficulty) {
        const level = parseInt(filterDifficulty);
        if (level === 1) {
          query = query.gte('difficulty_level', 1).lte('difficulty_level', 3);
        } else if (level === 2) {
          query = query.gte('difficulty_level', 4).lte('difficulty_level', 6);
        } else if (level === 3) {
          query = query.gte('difficulty_level', 7).lte('difficulty_level', 10);
        }
      }

      query = query.order('title');

      const { data: songsData, error } = await query;

      if (error) throw error;

      if (!songsData || songsData.length === 0) {
        setSongs([]);
        return;
      }

      // 批量獲取所有歌曲的團體資訊（優化：減少查詢次數）
      const songIds = songsData.map(s => s.song_id);
      
      // 一次性獲取所有 song_group 關聯
      const { data: allSongGroups, error: sgError } = await supabase
        .from('song_group')
        .select('song_id, group_id')
        .in('song_id', songIds);

      if (sgError) throw sgError;

      // 獲取所有相關的 group_id
      const groupIds = [...new Set((allSongGroups || []).map(sg => sg.group_id))];
      
      // 一次性獲取所有團體名稱
      let groupsMap = new Map<number, string>();
      if (groupIds.length > 0) {
        const { data: groupsData, error: groupsError } = await supabase
          .from('kpop_groups')
          .select('group_id, group_name')
          .in('group_id', groupIds);

        if (groupsError) throw groupsError;
        
        if (groupsData) {
          groupsMap = new Map(groupsData.map(g => [g.group_id, g.group_name]));
        }
      }

      // 建立 song_id 到 group_names 的映射
      const songGroupsMap = new Map<number, string[]>();
      (allSongGroups || []).forEach(sg => {
        const groupName = groupsMap.get(sg.group_id);
        if (groupName) {
          if (!songGroupsMap.has(sg.song_id)) {
            songGroupsMap.set(sg.song_id, []);
          }
          songGroupsMap.get(sg.song_id)!.push(groupName);
        }
      });

      // 組裝最終結果
      const songsWithGroups = songsData.map(song => ({
        ...song,
        groups: songGroupsMap.get(song.song_id) || [],
      }));

      // 如果有篩選團體，過濾結果
      let filteredSongs = songsWithGroups;
      if (filterGroup) {
        filteredSongs = songsWithGroups.filter(song =>
          song.groups?.some(g => g === filterGroup)
        );
      }

      setSongs(filteredSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
    }
  }, [searchQuery, filterDifficulty, filterGroup, isAdmin]);

  const handleDelete = async (songId: number, songTitle: string) => {
    if (!confirm(`確定要刪除歌曲「${songTitle}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      // 檢查是否有關聯的專案
      const { data: projects } = await supabase
        .from('project')
        .select('p_id')
        .eq('song_id', songId)
        .limit(1);

      if (projects && projects.length > 0) {
        alert('無法刪除：此歌曲有關聯的專案，請先處理相關專案。');
        return;
      }

      const { error } = await supabase
        .from('kpop_songs')
        .delete()
        .eq('song_id', songId);

      if (error) throw error;

      alert('歌曲已成功刪除');
      fetchSongs();
    } catch (error: any) {
      alert('刪除失敗：' + (error.message || '未知錯誤'));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 獲取所有團體選項（用於篩選）
  const [allGroups, setAllGroups] = useState<Array<{ group_id: number; group_name: string }>>([]);

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from('kpop_groups')
        .select('group_id, group_name')
        .order('group_name')
        .then(({ data }) => {
          if (data) setAllGroups(data);
        });
    }
  }, [isAdmin]);

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">歌曲管理</h1>
        <Link
          href="/admin/songs/create"
          className="bg-[#eca382] text-white px-4 py-2 rounded-lg hover:bg-[#e08f6f] transition-colors"
        >
          + 新增歌曲
        </Link>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋歌曲名稱</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入歌曲名稱..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">演唱團體</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            >
              <option value="">全部</option>
              {allGroups.map((group) => (
                <option key={group.group_id} value={group.group_name}>
                  {group.group_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">難度等級</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            >
              <option value="">全部</option>
              <option value="1">難度 1-3</option>
              <option value="2">難度 4-6</option>
              <option value="3">難度 7-10</option>
            </select>
          </div>
        </div>
      </div>

      {/* 歌曲列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">沒有找到歌曲</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  歌曲名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  演唱團體
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  發行日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  難度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時長
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {songs.map((song) => (
                <tr key={song.song_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{song.title}</div>
                    {song.title_kr && (
                      <div className="text-sm text-gray-500">{song.title_kr}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {song.groups && song.groups.length > 0
                        ? song.groups.join(', ')
                        : '無'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(song.release_date).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#fff2e6] text-gray-700">
                      {song.difficulty_level}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(song.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/songs/${song.song_id}`}
                      className="text-[#eca382] hover:text-[#e08f6f]"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/admin/songs/${song.song_id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(song.song_id, song.title)}
                      className="text-red-600 hover:text-red-900"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

