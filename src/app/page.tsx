'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProjectCard from '@/components/ProjectCard';
import BottomNav from '@/components/BottomNav';

interface Project {
  p_id: number;
  porject_title: string;
  practice_location: string;
  performance_location: string;
  status: string;
  creator_id?: number;
  is_member?: boolean;
  song_id?: number;
  song?: {
    title: string;
    difficulty_level?: number;
    group?: {
      group_name: string;
    };
  };
  practice_schedules?: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>;
  missing_positions?: string[];
  region?: string;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    group: '',
    song: '',
    difficulty: '',
    region: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    groups: [] as Array<{ group_id: number; group_name: string }>,
    songs: [] as Array<{ song_id: number; title: string; difficulty_level: number }>,
    regions: [] as string[],
  });

  useEffect(() => {
    // 檢查是否已登入
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth');
      return;
    }

    fetchFilterOptions();
    fetchProjects();
  }, [router]);

  const fetchFilterOptions = async () => {
    // 獲取所有團體
    const { data: groupsData } = await supabase
      .from('kpop_groups')
      .select('group_id, group_name')
      .order('group_name');

    // 獲取所有歌曲
    const { data: songsData } = await supabase
      .from('kpop_songs')
      .select('song_id, title, difficulty_level')
      .order('title');

    setFilterOptions({
      groups: groupsData || [],
      songs: songsData || [],
      regions: ['雙北', '台中', '高雄', '桃園', '新竹', '台南'],
    });
  };

  useEffect(() => {
    // 搜尋和篩選邏輯
    let filtered = projects;

    // 搜尋專案標題
    if (searchQuery) {
      filtered = filtered.filter((project) =>
        project.porject_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.song?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.song?.group?.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 篩選團體
    if (filters.group) {
      filtered = filtered.filter((project) =>
        project.song?.group?.group_name === filters.group
      );
    }

    // 篩選歌曲
    if (filters.song) {
      filtered = filtered.filter((project) =>
        project.song?.title === filters.song
      );
    }

    // 篩選難度
    if (filters.difficulty) {
      const difficultyLevel = parseInt(filters.difficulty);
      filtered = filtered.filter((project) => {
        if (!project.song?.difficulty_level) return false;
        const level = project.song.difficulty_level;
        if (difficultyLevel === 1) return level >= 1 && level <= 3;
        if (difficultyLevel === 2) return level >= 4 && level <= 6;
        if (difficultyLevel === 3) return level >= 7 && level <= 10;
        return true;
      });
    }

    // 篩選地區
    if (filters.region) {
      filtered = filtered.filter((project) =>
        project.region === filters.region
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, filters, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // 獲取所有活躍的專案
      const { data: projectsData, error: projectsError } = await supabase
        .from('project')
        .select(`
          p_id,
          porject_title,
          practice_location,
          performance_location,
          status,
          song_id,
          creator_id
        `)
        .eq('status', 'A')
        .order('create_at', { ascending: false })
        .limit(100);

      if (projectsError) throw projectsError;

      // 獲取每個專案的詳細資訊
      const projectsWithDetails = await Promise.all(
        (projectsData || []).map(async (project) => {
          // 獲取練習時間
          const { data: schedules } = await supabase
            .from('practice_schedule')
            .select('date, start_time, end_time')
            .eq('p_id', project.p_id)
            .order('date', { ascending: true });

          // 獲取缺少的位置
          const { data: targets } = await supabase
            .from('project_target')
            .select('target_seq, idol_id, status')
            .eq('project_id', project.p_id)
            .eq('status', 'I');

          // 獲取對應的偶像名稱
          const missingPositions: string[] = [];
          if (targets && targets.length > 0) {
            for (const target of targets) {
              if (target.idol_id) {
                const { data: idol } = await supabase
                  .from('kpop_idols')
                  .select('stage_name')
                  .eq('idol_id', target.idol_id)
                  .single();
                
                if (idol) {
                  missingPositions.push(idol.stage_name);
                } else {
                  missingPositions.push(`位置 ${target.target_seq}`);
                }
              } else {
                // idol_id 為 NULL 代表是伴舞
                missingPositions.push(`伴舞 ${target.target_seq}`);
              }
            }
          }

          // 獲取歌曲資訊
          let songInfo = null;
          if (project.song_id) {
            const { data: song } = await supabase
              .from('kpop_songs')
              .select('title, difficulty_level')
              .eq('song_id', project.song_id)
              .single();

            if (song) {
              // 獲取歌曲對應的團體
              const { data: songGroups } = await supabase
                .from('song_group')
                .select('group_id')
                .eq('song_id', project.song_id)
                .limit(1);

              let groupName = null;
              if (songGroups && songGroups.length > 0) {
                const { data: group } = await supabase
                  .from('kpop_groups')
                  .select('group_name')
                  .eq('group_id', songGroups[0].group_id)
                  .single();
                
                if (group) {
                  groupName = group.group_name;
                }
              }

              songInfo = {
                title: song.title,
                difficulty_level: song.difficulty_level,
                group: groupName ? { group_name: groupName } : undefined,
              };
            }
          }

          // 從 practice_location 推斷地區
          const region = project.practice_location.includes('雙連') || project.practice_location.includes('台北') || project.practice_location.includes('新北')
            ? '雙北'
            : project.practice_location.includes('台中')
            ? '台中'
            : project.practice_location.includes('高雄')
            ? '高雄'
            : project.practice_location.includes('桃園')
            ? '桃園'
            : project.practice_location.includes('新竹')
            ? '新竹'
            : project.practice_location.includes('台南')
            ? '台南'
            : '';

          // 檢查用戶是否為專案成員
          let userIsMember = false;
          const userId = localStorage.getItem('userId');
          if (userId) {
            const { data: memberCheck } = await supabase
              .from('project_members')
              .select('member_id')
              .eq('p_id', project.p_id)
              .eq('member_id', userId)
              .eq('status', 'Y')
              .single();
            userIsMember = !!memberCheck;
          }

          return {
            ...project,
            practice_schedules: schedules || [],
            missing_positions: missingPositions,
            song: songInfo || undefined,
            region,
            creator_id: project.creator_id,
            is_member: userIsMember,
          };
        })
      );

      setProjects(projectsWithDetails);
      setFilteredProjects(projectsWithDetails);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-purple-600 mb-4 flex items-center justify-center gap-4">
            <span className="text-4xl">👨</span>
            <span>舞告Match</span>
            <span className="text-4xl">👩</span>
          </h1>
          <button
            onClick={() => router.push('/project/create')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            + 建立新專案
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* 搜尋欄 */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋團名、歌曲..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 篩選器 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">全部團體</option>
              {filterOptions.groups.map((group) => (
                <option key={group.group_id} value={group.group_name}>
                  {group.group_name}
                </option>
              ))}
            </select>

            <select
              value={filters.song}
              onChange={(e) => setFilters({ ...filters, song: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">全部歌曲</option>
              {filterOptions.songs.map((song) => (
                <option key={song.song_id} value={song.title}>
                  {song.title}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">全部難度</option>
              <option value="1">難度 1-3</option>
              <option value="2">難度 4-6</option>
              <option value="3">難度 7-10</option>
            </select>

            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">全部地區</option>
              {filterOptions.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* 清除篩選 */}
          {(filters.group || filters.song || filters.difficulty || filters.region || searchQuery) && (
            <button
              onClick={() => {
                setFilters({ group: '', song: '', difficulty: '', region: '' });
                setSearchQuery('');
              }}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              清除所有篩選
            </button>
          )}

          <div className="flex justify-end items-center gap-2">
            <span className="text-gray-600">✨</span>
            <span className="text-gray-700 font-medium">找到 {filteredProjects.length} 個團體</span>
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">載入中...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">目前沒有找到符合條件的專案</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.p_id} project={project} />
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
