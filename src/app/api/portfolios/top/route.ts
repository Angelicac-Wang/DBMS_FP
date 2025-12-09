import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getYouTubeVideoStats, extractYoutubeId } from '@/lib/youtube';

export async function GET() {
  try {
    // 獲取所有作品（限制數量以避免過多 API 調用）
    const query = `
      SELECT DISTINCT
        p.video_url,
        p.title,
        p.discription,
        vd.created_at
      FROM portfolios p
      INNER JOIN video_detail vd ON p.video_url = vd.video_url
      WHERE p.video_url LIKE '%youtube.com%' OR p.video_url LIKE '%youtu.be%'
      LIMIT 50
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }

    // 為每個作品獲取 YouTube 觀看次數
    const portfoliosWithViews = await Promise.all(
      result.rows.map(async (portfolio) => {
        const youtubeId = extractYoutubeId(portfolio.video_url);
        
        if (!youtubeId) {
          return {
            ...portfolio,
            view_cnt: 0,
          };
        }

        try {
          const stats = await getYouTubeVideoStats(youtubeId);
          return {
            ...portfolio,
            view_cnt: stats?.viewCount || 0,
          };
        } catch (error) {
          console.error(`Error fetching stats for ${youtubeId}:`, error);
          return {
            ...portfolio,
            view_cnt: 0,
          };
        }
      })
    );

    // 按觀看次數排序並取前 3 個
    const topPortfolios = portfoliosWithViews
      .sort((a, b) => (b.view_cnt || 0) - (a.view_cnt || 0))
      .slice(0, 3);

    return NextResponse.json(topPortfolios);
  } catch (error: any) {
    console.error('Error fetching top portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top portfolios: ' + error.message },
      { status: 500 }
    );
  }
}

