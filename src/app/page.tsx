'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

const heroSlides = [
  {
    title: 'Find Your Stage',
    subtitle: 'Join dancers who love K-POP covers as much as you do.',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'From Practice Room to Spotlight',
    subtitle: 'Connect with crews, rehearse, and shine on stage together.',
    image:
      'https://images.unsplash.com/photo-1486591038957-19e7c73bdc41?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Cover Your Favorite Tracks',
    subtitle: 'Match with projects that fit your style and schedule.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80',
  },
];

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

  useEffect(() => {
    trackPageView('/', '舞告Match - 首頁');
    fetchNewestProjects();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  const fetchNewestProjects = async () => {
    try {
      setLoadingNewest(true);
      const { data: projectsData, error } = await supabase
        .from('project')
        .select('p_id, porject_title, target_cnt, practice_location, performance_location, song_id, create_at, creator_id')
        .eq('status', 'A')
        .order('create_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      const projectsWithDetails = await Promise.all(
        (projectsData || []).map(async (project) => {
          let songTitle = '未命名歌曲';
          let groupName = '未知團體';
          let thumbnail = '';
          let groupLogoUrl = '';
          let practiceMonthRange = '待定';

          if (project.song_id) {
            const { data: song } = await supabase
              .from('kpop_songs')
              .select('title, youtube_original_url')
              .eq('song_id', project.song_id)
              .single();

            if (song?.title) songTitle = song.title;
            const youtubeId = extractYoutubeId(song?.youtube_original_url);
            if (youtubeId) {
              thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
            }

              const { data: songGroups } = await supabase
                .from('song_group')
                .select('group_id')
                .eq('song_id', project.song_id)
                .limit(1);

            if (songGroups?.length) {
                const { data: group } = await supabase
                  .from('kpop_groups')
                .select('group_name, logo_image')
                  .eq('group_id', songGroups[0].group_id)
                  .single();
              if (group?.group_name) groupName = group.group_name;
              if (group?.logo_image) {
                groupLogoUrl = group.logo_image;
              }
              // 如果沒有 YouTube 縮圖，使用團體 logo
              if (!thumbnail && groupLogoUrl) {
                thumbnail = groupLogoUrl;
              }
            }
          }

          const { data: schedules } = await supabase
            .from('practice_schedule')
            .select('date')
            .eq('p_id', project.p_id);

          if (schedules) {
            practiceMonthRange = formatPracticeMonthRange(schedules);
          }

          const { count: memberCount } = await supabase
              .from('project_members')
            .select('*', { count: 'exact', head: true })
              .eq('p_id', project.p_id)
            .eq('status', 'Y');

          // 獲取發文者名稱
          let creatorName = '舞者';
          if (project.creator_id) {
            const { data: creator } = await supabase
              .from('users')
              .select('name')
              .eq('u_id', project.creator_id)
              .single();
            if (creator?.name) {
              creatorName = creator.name;
            }
          }

          return {
            id: project.p_id,
            title: project.porject_title,
            songTitle,
            groupName,
            region: project.practice_location || '未指定',
            targetCount: project.target_cnt ?? 0,
            memberCount: memberCount || 0,
            thumbnail: thumbnail || groupLogoUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+',
            groupLogoUrl: groupLogoUrl || undefined,
            practiceMonthRange,
            createdAt: project.create_at,
            creatorName,
          };
        })
      );

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
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.title}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    index === activeSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {heroSlides.map((_, index) => (
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
                        // 如果當前是 YouTube 縮圖且失敗，嘗試使用團體 logo
                        if (currentSrc.includes('youtube.com') && project.groupLogoUrl) {
                          target.src = project.groupLogoUrl;
                        } else {
                          // 如果團體 logo 也失敗或沒有，使用全黑圖片
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PC9zdmc+';
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
