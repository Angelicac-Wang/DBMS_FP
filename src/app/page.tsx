'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

interface NewestProject {
  id: number;
    title: string;
  groupName: string;
  songTitle: string;
  region: string;
  targetCount: number;
  memberCount: number;
  thumbnail: string;
  groupLogoUrl?: string;
  practiceMonthRange: string;
  createdAt?: string;
  creatorName?: string;
}

interface TopPortfolio {
  video_url: string;
  title: string;
  discription?: string;
  created_at?: string;
}

function extractYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
  return match ? match[1] : null;
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

export default function Home() {
  const router = useRouter();
  const { trackPageView, trackClick } = useBehaviorTracking();
  const [activeSlide, setActiveSlide] = useState(0);
  const [newestProjects, setNewestProjects] = useState<NewestProject[]>([]);
  const [loadingNewest, setLoadingNewest] = useState(true);
  const [topPortfolios, setTopPortfolios] = useState<TopPortfolio[]>([]);
  const [loadingTopPortfolios, setLoadingTopPortfolios] = useState(true);

  useEffect(() => {
    trackPageView('/', '舞告Match - 首頁');
    fetchNewestProjects();
    fetchTopPortfolios();
  }, []);

  useEffect(() => {
    if (topPortfolios.length > 0) {
      const timer = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % topPortfolios.length);
      }, 5200);
      return () => clearInterval(timer);
    }
  }, [topPortfolios]);

  const fetchTopPortfolios = async () => {
    try {
      setLoadingTopPortfolios(true);
      const response = await fetch('/api/portfolios/user/angelica');
      if (!response.ok) throw new Error('Failed to fetch portfolios');
      
      const portfoliosData = await response.json();
      setTopPortfolios(portfoliosData || []);
    } catch (err) {
      console.error('Failed to load portfolios', err);
      setTopPortfolios([]);
    } finally {
      setLoadingTopPortfolios(false);
    }
  };

  const fetchNewestProjects = async () => {
    try {
      setLoadingNewest(true);
      const response = await fetch('/api/projects/list?limit=8');
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const projectsData = await response.json();
      
      if (!projectsData || projectsData.length === 0) {
        setNewestProjects([]);
        return;
      }

      // 組裝專案資料
      const projectsWithDetails = projectsData.map((project: any) => {
        let songTitle = '未命名歌曲';
        let groupName = '未知團體';
        
        const schedules = project.practice_schedules || [];
        const practiceMonthRange = schedules.length > 0 ? formatPracticeMonthRange(schedules) : '待定';
        
        const memberCount = project.member_count || 0;

        if (project.song) {
          songTitle = project.song.title || '未命名歌曲';
          if (project.song.group) {
            groupName = project.song.group.group_name || '未知團體';
          }
        }

        // 優先使用 API 返回的縮圖，否則使用占位圖
        const thumbnail = project.songThumbnail || project.groupLogoUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';

        return {
          id: project.p_id,
          title: project.porject_title,
          songTitle,
          groupName,
          region: project.practice_location || '未指定',
          targetCount: project.target_cnt ?? 0,
          memberCount,
          thumbnail,
          groupLogoUrl: project.groupLogoUrl || undefined,
          practiceMonthRange,
          createdAt: project.create_at,
          creatorName: project.creator_name || '舞者',
        };
      });

      setNewestProjects(projectsWithDetails);
    } catch (err) {
      console.error('Failed to load newest projects', err);
    } finally {
      setLoadingNewest(false);
    }
  };

  const progressPercent = (project: NewestProject) => {
    if (!project.targetCount) return 0;
    return Math.min(Math.round((project.memberCount / project.targetCount) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-[#fff6ec] text-gray-900">
      <div className="mx-auto px-4 pb-16" style={{ maxWidth: 'var(--container-7xl)' }}>
        {/* Hero with carousel */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff4e6] via-[#ffe1d2] to-[#ffd2ec] shadow-lg">
          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
            <div className="relative h-64 overflow-hidden rounded-2xl shadow-xl md:h-full">
              {loadingTopPortfolios ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eca382] border-t-transparent" />
                </div>
              ) : topPortfolios.length > 0 ? (
                <>
                  {topPortfolios.map((portfolio, index) => {
                    const youtubeId = extractYoutubeId(portfolio.video_url);
                    const thumbnailUrl = youtubeId
                      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
                    
                    return (
                      <div
                        key={portfolio.video_url}
                        onClick={() => router.push(`/portfolio/${encodeURIComponent(portfolio.video_url)}`)}
                        className={`absolute inset-0 h-full w-full cursor-pointer transition-opacity duration-700 ${
                          index === activeSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={thumbnailUrl}
                          alt={portfolio.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = youtubeId
                              ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-lg font-bold mb-1">{portfolio.title}</h3>
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {topPortfolios.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`h-2 w-8 rounded-full transition-all ${
                          index === activeSlide ? 'bg-white shadow-lg' : 'bg-white/60'
                        }`}
                        aria-label={`slide-${index}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                  <p>暫無熱門作品</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-5">
              <p className="rounded-full bg-white/80 px-4 py-1 text-xs font-semibold text-[#7a2d81] shadow-sm w-fit">
                K-POP Cover Community
              </p>
              <h1 className="text-4xl font-extrabold leading-tight text-[#7a2d81] md:text-5xl">
                找到你的舞台，加入最懂你的 K-POP Cover 團！
              </h1>
              <p className="text-lg text-gray-700">
                用專案快速媒合、一起練習與拍攝，讓每一次 cover 都成為亮點。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    trackClick('cta-browse-projects', '立即開始尋找專案');
                    router.push('/projects');
                  }}
                  className="rounded-full bg-[#eca382] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#e08f6f] transition-transform hover:-translate-y-0.5"
                >
                  立即開始尋找合適專案！
                </button>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#7a2d81]">
                  <span className="h-2 w-2 rounded-full bg-[#eca382]" />
                  隨時更新最新專案
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newest Projects */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#eca382]">Newest Cover Projects</p>
              <h2 className="text-2xl font-bold text-gray-900">最新招募中的專案</h2>
            </div>
            <button
              onClick={() => router.push('/projects')}
              className="text-sm font-semibold text-[#7a2d81] hover:text-[#eca382]"
            >
              瀏覽全部 &rarr;
            </button>
          </div>
          {loadingNewest ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eca382] border-t-transparent" />
            </div>
          ) : newestProjects.length === 0 ? (
            <div className="rounded-2xl bg-white py-12 text-center text-gray-600 shadow-sm ring-1 ring-amber-100">
              尚未有新的 cover 專案，快來成為第一個發起人吧！
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newestProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-100 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.songTitle}
                      className="h-full w-full object-cover"
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
                    <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#7a2d81] shadow-sm">
                      {project.groupName}
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#eca382]">
                          {project.creatorName || '舞者'}
                        </p>
                        <span className="flex-shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-[#7a2d81] whitespace-nowrap">
                          {project.region}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-black">
                        {project.songTitle} · {project.groupName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff2e6] text-[#eca382]">
                        🗓️
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">練習時間</p>
                        <p>{project.practiceMonthRange}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span>進度 {project.memberCount}/{project.targetCount}</span>
                        <span>{progressPercent(project)}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#f0b89a] to-[#eca382] transition-all"
                          style={{ width: `${progressPercent(project)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
