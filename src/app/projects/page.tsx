'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import CreateProjectModal from '@/components/CreateProjectModal';

interface ProjectItem {
  p_id: string;
  porject_title: string;
  practice_location: string;
  status: string;
  creator_id?: string;
  creator_name?: string;
  is_member?: boolean;
  song_id?: string;
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
  const [totalFilteredCount, setTotalFilteredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ regions: [], months: [], groupTypes: [] });
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  
  const ITEMS_PER_PAGE = 50; // 每页加载50个项目

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

    fetchProjects(true);
    fetchTopRegions();
    // 初始載入時獲取總數（無篩選條件）
    fetchFilteredCount();
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

  // 獲取篩選後的總數
  const fetchFilteredCount = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
      if (filters.months.length > 0) params.append('months', filters.months.join(','));
      if (filters.groupTypes.length > 0) params.append('groupTypes', filters.groupTypes.join(','));

      const response = await fetch(`/api/projects/count?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTotalFilteredCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching filtered count:', error);
    }
  }, [filters, searchQuery]);

  // 檢查是否有篩選條件
  const hasFilters = useMemo(() => {
    return searchQuery.trim() !== '' || 
           filters.regions.length > 0 || 
           filters.months.length > 0 || 
           filters.groupTypes.length > 0;
  }, [searchQuery, filters]);

  // 當篩選條件改變時，重新載入專案
  useEffect(() => {
    // 無論是否有篩選條件，都重新載入（確保取消篩選時也能正確顯示）
    setCurrentPage(0);
    setHasMore(true);
    fetchProjects(true);
    fetchFilteredCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, hasFilters]);


  const fetchTopRegions = async () => {
    try {
      const response = await fetch('/api/projects/locations');
      if (!response.ok) return;
      
      const locations = await response.json();
      setRegionOptions(locations.slice(0, 6));
    } catch (err) {
      console.error('Error fetching top practice locations:', err);
      setRegionOptions([]);
    }
  };

  const fetchProjects = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      const page = reset ? 0 : currentPage;
      const userId = localStorage.getItem('userId');
      const offset = page * ITEMS_PER_PAGE;
      
      // 構建 API URL，如果有篩選條件則加入參數
      const params = new URLSearchParams();
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', offset.toString());
      if (userId) params.append('userId', userId);
      
      // 檢查是否有篩選條件（在函數內部重新計算，避免閉包問題）
      const currentHasFilters = searchQuery.trim() !== '' || 
                                filters.regions.length > 0 || 
                                filters.months.length > 0 || 
                                filters.groupTypes.length > 0;
      
      // 如果有篩選條件，加入篩選參數
      if (currentHasFilters) {
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
        if (filters.months.length > 0) params.append('months', filters.months.join(','));
        if (filters.groupTypes.length > 0) params.append('groupTypes', filters.groupTypes.join(','));
      }
      
      const response = await fetch(`/api/projects/list?${params.toString()}`);
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const projectsData = await response.json();

      // 檢查是否還有更多數據
      if (!projectsData || projectsData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      if (!projectsData || projectsData.length === 0) {
        if (reset) {
          setProjects([]);
          setFilteredProjects([]);
        }
        setCurrentPage(page + 1);
        return;
      }

      // 組裝專案資料
      const projectsWithDetails = projectsData.map((project: any) => {
        const schedules = project.practice_schedules || [];
        const missingPositions = project.missing_positions || [];
        
        // 直接使用 API 返回的縮圖和 logo，如果沒有則嘗試生成
        let songThumbnail = project.songThumbnail || '';
        let groupLogoUrl = project.groupLogoUrl || '';
        
        // 如果 API 沒有返回縮圖，嘗試從歌曲的 YouTube URL 生成
        if (!songThumbnail && project.song?.youtube_original_url) {
          const youtubeIdMatch = project.song.youtube_original_url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
          if (youtubeIdMatch) {
            songThumbnail = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/hqdefault.jpg`;
          }
        }

        const region = getRegionFromLocation(project.practice_location);

        return {
          p_id: project.p_id,
          porject_title: project.porject_title,
          practice_location: project.practice_location,
          status: project.status,
          song_id: project.song_id,
          creator_id: project.creator_id,
          target_cnt: project.target_cnt,
          create_at: project.create_at,
          practice_schedules: schedules,
          practiceMonthRange: formatPracticeMonthRange(schedules),
          missing_positions: missingPositions,
          song: project.song || undefined,
          region,
          creator_name: project.creator_name || '舞者',
          is_member: project.is_member || false,
          songThumbnail: songThumbnail || undefined,
          groupLogoUrl: groupLogoUrl || undefined,
        };
      });

      if (reset) {
        setProjects(projectsWithDetails);
        setFilteredProjects(projectsWithDetails);
        // 獲取總數（無論是否有篩選條件）
        fetchFilteredCount();
      } else {
        setProjects((prev) => [...prev, ...projectsWithDetails]);
        setFilteredProjects((prev) => [...prev, ...projectsWithDetails]);
      }
      
      setCurrentPage(page + 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProjects(false);
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-sm text-black"
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
            <h2 className="text-2xl font-bold text-gray-900">瀏覽專案</h2>
            <span className="text-sm font-semibold text-gray-600">共 {totalFilteredCount} 個專案</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eca382] border-t-transparent" />
            </div>
          ) : filteredProjects.length === 0 && totalFilteredCount === 0 ? (
            <div className="rounded-2xl bg-white py-12 text-center text-gray-600 shadow-sm ring-1 ring-amber-100">
              沒有符合條件的專案，試著調整篩選條件。
            </div>
          ) : (
            <>
              {filteredProjects.length === 0 && totalFilteredCount > 0 && (
                <div className="rounded-2xl bg-white py-8 text-center text-gray-600 shadow-sm ring-1 ring-amber-100 mb-5">
                  <p className="mb-2">正在載入符合條件的專案...</p>
                  <p className="text-sm text-gray-500">共找到 {totalFilteredCount} 個專案，請點擊下方按鈕載入</p>
                </div>
              )}
              {filteredProjects.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                <div
                  key={project.p_id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md h-full"
                >
                  <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-sm font-bold text-white shadow">
                        {project.creator_name ? project.creator_name.charAt(0).toUpperCase() : '舞'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{project.creator_name || '舞者'}</p>
                        <p className="text-xs text-gray-600">
                          {project.create_at ? new Date(project.create_at).toLocaleDateString('zh-TW') : '近期發佈'}
                        </p>
                      </div>
                    </div>
                    {project.practice_location && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {project.practice_location}
                      </span>
                    )}
                  </div>

                  <div className="px-4 pt-4">
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={(() => {
                          // 優先使用 YouTube 縮圖，但如果 groupLogoUrl 是 kprofiles.com，直接使用占位圖
                          if (project.songThumbnail) {
                            return project.songThumbnail;
                          }
                          if (project.groupLogoUrl && !project.groupLogoUrl.includes('kprofiles.com')) {
                            return project.groupLogoUrl;
                          }
                          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
                        })()}
                        alt={project.song?.title || '歌曲縮圖'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
                          
                          // 如果已經是占位圖，不要再嘗試
                          if (currentSrc === placeholder) {
                            return;
                          }
                          
                          // 如果當前是 kprofiles.com 的 URL，直接使用占位圖
                          if (currentSrc.includes('kprofiles.com')) {
                            target.src = placeholder;
                            return;
                          }
                          
                          // 如果當前是 YouTube 縮圖且失敗，嘗試使用團體 logo（但排除 kprofiles.com）
                          if (currentSrc.includes('youtube.com') && project.groupLogoUrl && !project.groupLogoUrl.includes('kprofiles.com')) {
                            target.src = project.groupLogoUrl;
                          } else {
                            // 如果團體 logo 也失敗或沒有，使用占位圖
                            target.src = placeholder;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-5 flex-grow">
                    <div>
                      {/* <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#eca382]">
                          {project.creator_name || '舞者'}
                        </p>
                        {project.region && (
                          <span className="flex-shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap">
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
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-gray-700"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3 border-t border-gray-200 bg-white px-5 py-3 mt-auto">
                    <button
                      onClick={() => router.push(`/project/${project.p_id}`)}
                      className="rounded-full border border-[#eca382] px-4 py-2 text-sm font-semibold text-[#eca382] hover:bg-[#eca382] hover:text-white transition-colors"
                    >
                      詳細資訊
                    </button>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 載入更多按鈕 */}
          {!loading && hasMore && (filteredProjects.length > 0 || totalFilteredCount > 0) && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full bg-[#eca382] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e08f6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    載入中...
                  </span>
                ) : (
                  '載入更多專案'
                )}
              </button>
            </div>
          )}

          {/* 顯示總數 */}
          {!loading && filteredProjects.length > 0 && !hasMore && (
            <div className="mt-8 text-center text-sm text-gray-600">
              已顯示所有 {totalFilteredCount} 個專案
            </div>
          )}
        </section>
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProjects(true);
          fetchTopRegions();
        }}
      />
    </div>
  );
}



