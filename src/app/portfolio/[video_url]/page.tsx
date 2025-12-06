'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PortfolioDetail {
  video_url: string;
  title: string;
  discription: string;
  cover_song_id?: number;
  created_at: string;
  view_cnt: number;
  u_id: number;
  user?: {
    name: string;
  };
  song?: {
    title: string;
    group_name?: string;
  };
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export default function PortfolioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const videoUrl = decodeURIComponent(params.video_url as string);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (videoUrl) {
      fetchPortfolioDetail(videoUrl);
    }
  }, [videoUrl]);

  const fetchPortfolioDetail = async (url: string) => {
    try {
      setLoading(true);

      // 獲取作品集基本資訊
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('video_url', url)
        .single();

      if (portfolioError) throw portfolioError;

      // 獲取用戶資訊
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('u_id', portfolioData.u_id)
        .single();

      // 獲取歌曲資訊
      let songInfo = null;
      if (portfolioData.cover_song_id) {
        const { data: songData } = await supabase
          .from('kpop_songs')
          .select('title')
          .eq('song_id', portfolioData.cover_song_id)
          .single();

        if (songData) {
          // 獲取團體名稱
          const { data: songGroups } = await supabase
            .from('song_group')
            .select('group_id')
            .eq('song_id', portfolioData.cover_song_id)
            .limit(1);

          let groupName = null;
          if (songGroups && songGroups.length > 0) {
            const { data: group } = await supabase
              .from('kpop_groups')
              .select('group_name')
              .eq('group_id', songGroups[0].group_id)
              .single();

            if (group) groupName = group.group_name;
          }

          songInfo = {
            title: songData.title,
            group_name: groupName,
          };
        }
      }

      setPortfolio({
        ...portfolioData,
        user: userData,
        song: songInfo,
      });
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError('無法載入作品資訊');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error || '作品不存在'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-[#eca382] text-white rounded-lg hover:bg-[#e08f6f]"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const youtubeId = extractYoutubeId(portfolio.video_url);
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;

  return (
    <div className="min-h-screen bg-[#fff6ec] pb-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eca382]">{portfolio.title}</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {youtubeEmbedUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6">
              <iframe
                src={youtubeEmbedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg bg-gray-200 flex items-center justify-center mb-6">
              <p className="text-gray-500">無法載入影片</p>
            </div>
          )}

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{portfolio.title}</h2>
              <Link
                href={`/profile?userId=${portfolio.u_id}`}
                className="text-sm text-[#7a2d81] hover:text-[#eca382] hover:underline"
              >
                {portfolio.user?.name || '未知'}
              </Link>
            </div>

            {portfolio.song && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">翻跳歌曲</p>
                <p className="text-base text-gray-800">
                  {portfolio.song.title}
                  {portfolio.song.group_name && ` - ${portfolio.song.group_name}`}
                </p>
              </div>
            )}

            {portfolio.discription && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">描述</p>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {portfolio.discription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
