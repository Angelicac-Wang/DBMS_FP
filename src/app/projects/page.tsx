'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import CreateProjectModal from '@/components/CreateProjectModal';

interface ProjectItem {
  p_id: number;
  porject_title: string;
  practice_location: string;
  performance_location: string;
  status: string;
  creator_id?: number;
  creator_name?: string;
  is_member?: boolean;
  song_id?: number;
  song?: {
    title: string;
    difficulty_level?: number;
    group?: {
      group_name: string;
      group_type?: string;
    };
  };
  practice_schedules?: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>;
  missing_positions?: string[];
  region?: string;
  practiceMonthRange?: string;
  create_at?: string;
  songThumbnail?: string;
  groupLogoUrl?: string;
}

type FilterState = {
  regions: string[];
  months: string[];
  groupTypes: string[];
};

// regionOptions will be dynamically fetched

function formatPracticeMonthRange(dates: Array<{ date: string }>): string {
  if (!dates || dates.length === 0) return '待定';
  const parsed = dates
    .map((d) => new Date(d.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!parsed.length) return '待定';
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const toLabel = (dt: Date) => `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
  const firstLabel = toLabel(first);
  const lastLabel = toLabel(last);
  return firstLabel === lastLabel ? firstLabel : `${firstLabel} ~ ${lastLabel}`;
}

function extractMonths(dates: Array<{ date: string }>): string[] {
  const labels = new Set<string>();
  dates.forEach((d) => {
    const dt = new Date(d.date);
    if (!Number.isNaN(dt.getTime())) {
      labels.add(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}`);
    }
  });
  return Array.from(labels);
}

function getRegionFromLocation(location?: string): string {
  if (!location) return '未指定';
  if (location.includes('雙連') || location.includes('台北') || location.includes('新北')) return '雙北';
  if (location.includes('台中')) return '台中';
  if (location.includes('高雄')) return '高雄';
  if (location.includes('桃園')) return '桃園';
  if (location.includes('新竹')) return '新竹';
  if (location.includes('台南')) return '台南';
  return '未指定';
}

function nextFiveMonths(): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < 5; i += 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { trackPageView } = useBehaviorTracking();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ regions: [], months: [], groupTypes: [] });
  const [regionOptions, setRegionOptions] = useState<string[]>([]);

  const monthOptions = useMemo(() => nextFiveMonths(), []);

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId) {
      router.push('/auth');
      return;
    }
    if (userRole === 'A') {
      router.push('/admin');
      return;
    }

    fetchProjects();
    fetchTopRegions();
    trackPageView('/projects', '舞告Match - 專案列表');

    // 檢查 URL 參數或監聽事件來打開 modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openCreateModal') === 'true') {
      setShowCreateModal(true);
      // 清除 URL 參數
      window.history.replaceState({}, '', '/projects');
    }

    const handleOpenModal = () => setShowCreateModal(true);
    window.addEventListener('openCreateProjectModal', handleOpenModal);
    return () => window.removeEventListener('openCreateProjectModal', handleOpenModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    let filtered = projects;

    // 搜尋功能
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const matchesTitle = p.porject_title.toLowerCase().includes(query);
        const matchesGroup = p.song?.group?.group_name?.toLowerCase().includes(query);
        const matchesSong = p.song?.title?.toLowerCase().includes(query);
        return matchesTitle || matchesGroup || matchesSong;
      });
    }

    if (filters.regions.length) {
      filtered = filtered.filter((p) => p.practice_location && filters.regions.includes(p.practice_location));
    }

    if (filters.months.length) {
      filtered = filtered.filter((p) => {
        if (!p.practice_schedules || p.practice_schedules.length === 0) return false;
        const months = extractMonths(p.practice_schedules);
        return months.some((m) => filters.months.includes(m));
      });
    }

    if (filters.groupTypes.length) {
      filtered = filtered.filter((p) => {
        const groupType = p.song?.group?.group_type;
        if (!groupType) return false;
        // 將資料庫的類型代碼轉換為顯示文字
        const typeMap: { [key: string]: string } = { 'B': '男團', 'G': '女團', 'M': '混團' };
        const displayType = typeMap[groupType];
        return displayType && filters.groupTypes.includes(displayType);
      });
    }

    setFilteredProjects(filtered);
  }, [filters, projects, searchQuery]);

  const fetchTopRegions = async () => {
    try {
      // 獲取所有專案的 practice_location
      const { data: projectsData } = await supabase
        .from('project')
        .select('practice_location')
        .eq('status', 'A');

      if (!projectsData) return;

      // 統計各練習地點的數量
      const locationCounts: { [key: string]: number } = {};
      projectsData.forEach((project) => {
        if (project.practice_location) {
          locationCounts[project.practice_location] = (locationCounts[project.practice_location] || 0) + 1;
        }
      });

      // 排序並取前六熱門的練習地點
      const sortedLocations = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([location]) => location);

      setRegionOptions(sortedLocations);
    } catch (err) {
      console.error('Error fetching top practice locations:', err);
      setRegionOptions([]);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('project')
        .select(`
          p_id,
          porject_title,
          practice_location,
          performance_location,
          status,
          song_id,
          creator_id,
          target_cnt,
          create_at
        `)
        .eq('status', 'A')
        .order('create_at', { ascending: false })
        .limit(120);

      if (projectsError) throw projectsError;

      const projectsWithDetails = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: creator } = await supabase
            .from('users')
            .select('name')
            .eq('u_id', project.creator_id)
            .single();

          const { data: schedules } = await supabase
            .from('practice_schedule')
            .select('date, start_time, end_time')
            .eq('p_id', project.p_id)
            .order('date', { ascending: true });

          const { data: targets } = await supabase
            .from('project_target')
            .select('target_seq, idol_id, status')
            .eq('project_id', project.p_id)
            .eq('status', 'I');

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
                missingPositions.push(`伴舞 ${target.target_seq}`);
              }
            }
          }

          let songInfo = null;
          let songThumbnail = '';
          let groupLogoUrl = '';
          if (project.song_id) {
            const { data: song } = await supabase
              .from('kpop_songs')
              .select('title, difficulty_level, youtube_original_url')
              .eq('song_id', project.song_id)
              .single();

            if (song) {
              // 提取 YouTube 縮圖
              if (song.youtube_original_url) {
                const youtubeIdMatch = song.youtube_original_url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
                if (youtubeIdMatch) {
                  songThumbnail = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/hqdefault.jpg`;
                }
              }

              const { data: songGroups } = await supabase
                .from('song_group')
                .select('group_id')
                .eq('song_id', project.song_id)
                .limit(1);

              let groupName = null;
              let groupType = null;
              if (songGroups && songGroups.length > 0) {
                const { data: group } = await supabase
                  .from('kpop_groups')
                  .select('group_name, group_type, logo_image')
                  .eq('group_id', songGroups[0].group_id)
                  .single();
                
                if (group) {
                  groupName = group.group_name;
                  groupType = group.group_type;
                  if (group.logo_image) {
                    groupLogoUrl = group.logo_image;
                  }
                }
              }

              songInfo = {
                title: song.title,
                difficulty_level: song.difficulty_level,
                group: groupName ? { group_name: groupName, group_type: groupType || undefined } : undefined,
              };
            }
          }

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

          const region = getRegionFromLocation(project.practice_location);

          return {
            ...project,
            practice_schedules: schedules || [],
            practiceMonthRange: formatPracticeMonthRange(schedules || []),
            missing_positions: missingPositions,
            song: songInfo || undefined,
            region,
            practice_location: project.practice_location,
            creator_id: project.creator_id,
            creator_name: creator?.name || '舞者',
            is_member: userIsMember,
            songThumbnail: songThumbnail || undefined,
            groupLogoUrl: groupLogoUrl || undefined,
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

  const toggleRegion = (value: string) => {
    setFilters((prev) => {
      const exists = prev.regions.includes(value);
      return { ...prev, regions: exists ? prev.regions.filter((r) => r !== value) : [...prev.regions, value] };
    });
  };

  const toggleMonth = (value: string) => {
    setFilters((prev) => {
      const exists = prev.months.includes(value);
      return { ...prev, months: exists ? prev.months.filter((m) => m !== value) : [...prev.months, value] };
    });
  };

  const toggleGroupType = (value: string) => {
    setFilters((prev) => {
      const exists = prev.groupTypes.includes(value);
      return { ...prev, groupTypes: exists ? prev.groupTypes.filter((g) => g !== value) : [...prev.groupTypes, value] };
    });
  };

  const clearFilters = () => {
    setFilters({ regions: [], months: [], groupTypes: [] });
    setSearchQuery('');
  };

  const groupTypeOptions = ['男團', '女團', '混團'];

  return (
    <div className="min-h-screen bg-[#fff6ec] text-gray-900">
      <main className="mx-auto flex px-4 pb-14 pt-6" style={{ maxWidth: 'var(--container-7xl)' }}>
        {/* Sidebar filters */}
        <aside className="sticky top-24 h-fit w-64 pr-6 border-r border-gray-300">
          <div className="space-y-6">
            {/* 搜尋框 */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋專案、團體或歌曲..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-sm"
              />
            </div>

            {/* 篩選條件標題 */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <h3 className="text-lg font-bold text-gray-900">篩選條件</h3>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-[#eca382] hover:text-[#e08f6f]"
              >
                清除
              </button>
            </div>

            <div className="space-y-3 border-b border-gray-300 pb-4">
              <p className="text-sm font-semibold text-gray-800">練習地點</p>
              <div className="space-y-2">
                {regionOptions.map((location) => (
                  <label key={location} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(location)}
                      onChange={() => toggleRegion(location)}
                      className="h-4 w-4 accent-[#eca382]"
                    />
                    {location}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-b border-gray-300 pb-4">
              <p className="text-sm font-semibold text-gray-800">團體類型</p>
              <div className="space-y-2">
                {groupTypeOptions.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filters.groupTypes.includes(type)}
                      onChange={() => toggleGroupType(type)}
                      className="h-4 w-4 accent-[#eca382]"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">練習時間（未來5個月）</p>
              <div className="space-y-2">
                {monthOptions.map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={filters.months.includes(m)}
                      onChange={() => toggleMonth(m)}
                      className="h-4 w-4 accent-[#eca382]"
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Projects list */}
        <section className="flex-1 pl-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Browse Projects</h2>
            <span className="text-sm font-semibold text-gray-600">共 {filteredProjects.length} 個專案</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eca382] border-t-transparent" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl bg-white py-12 text-center text-gray-600 shadow-sm ring-1 ring-amber-100">
              沒有符合條件的專案，試著調整篩選條件。
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.p_id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-sm font-bold text-white shadow">
                        舞
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{project.creator_name || '舞者'}</p>
                        <p className="text-xs text-gray-600">
                          {project.create_at ? new Date(project.create_at).toLocaleDateString('zh-TW') : '近期發佈'}
                        </p>
                      </div>
                    </div>
                    {project.practice_location && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[#7a2d81]">
                        {project.practice_location}
                      </span>
                    )}
                  </div>

                  <div className="px-4 pt-4">
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={project.songThumbnail || project.groupLogoUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+'}
                        alt={project.song?.title || '歌曲縮圖'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          // 如果當前是 YouTube 縮圖且失敗，嘗試使用團體 logo
                          if (currentSrc.includes('youtube.com') && project.groupLogoUrl) {
                            target.src = project.groupLogoUrl;
                          } else {
                            // 如果團體 logo 也失敗或沒有，使用全黑圖片
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div>
                      {/* <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#eca382]">
                          {project.creator_name || '舞者'}
                        </p>
                        {project.region && (
                          <span className="flex-shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-[#7a2d81] whitespace-nowrap">
                            {project.region}
                          </span>
                        )}
                      </div> */}
                      <h3 className="mt-1 text-lg font-bold text-black">
                        {project.song?.title || '未指定歌曲'} · {project.song?.group?.group_name || '未指定團體'}
                      </h3>
                    </div>

                    {project.practiceMonthRange && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff2e6] text-[#eca382]">
                          🗓️
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">練習時間</p>
                          <p>{project.practiceMonthRange}</p>
                        </div>
                      </div>
                    )}

                    {project.missing_positions && project.missing_positions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800">缺的位置</p>
                        <div className="flex flex-wrap gap-2">
                          {project.missing_positions.map((pos, idx) => (
                            <span
                              key={`${pos}-${idx}`}
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-[#7a2d81]"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-3">
                    <button
                      onClick={() => router.push(`/project/${project.p_id}`)}
                      className="rounded-full border border-[#7a2d81] px-4 py-2 text-sm font-semibold text-[#7a2d81] hover:bg-[#7a2d81] hover:text-white transition-colors"
                    >
                      詳細資訊
                    </button>
                    <button
                      onClick={() => router.push(`/project/${project.p_id}/apply`)}
                      className="rounded-full bg-[#eca382] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors"
                    >
                      申請加入
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProjects();
          fetchTopRegions();
        }}
      />
    </div>
  );
}

