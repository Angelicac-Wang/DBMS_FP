import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ video_url: string }> }
) {
  try {
    const { video_url } = await params;
    const decodedUrl = decodeURIComponent(video_url);

    // 獲取作品集基本資訊
    const portfolioResult = await pool.query(
      'SELECT * FROM portfolios WHERE video_url = $1 LIMIT 1',
      [decodedUrl]
    );

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = portfolioResult.rows[0];

    // 獲取用戶資訊
    const userResult = await pool.query(
      'SELECT name FROM users WHERE u_id = $1',
      [portfolio.u_id]
    );

    // 獲取 video_detail 資訊
    const videoDetailResult = await pool.query(
      'SELECT cover_song_id, created_at, view_cnt FROM video_detail WHERE video_url = $1',
      [decodedUrl]
    );

    const videoDetail = videoDetailResult.rows[0] || {};

    // 獲取歌曲資訊
    let songInfo = null;
    if (videoDetail.cover_song_id) {
      const songResult = await pool.query(
        'SELECT title FROM kpop_songs WHERE song_id = $1',
        [videoDetail.cover_song_id]
      );

      if (songResult.rows.length > 0) {
        const song = songResult.rows[0];
        const groupResult = await pool.query(
          `SELECT g.group_name
           FROM song_group sg
           JOIN kpop_groups g ON sg.group_id = g.group_id
           WHERE sg.song_id = $1
           LIMIT 1`,
          [videoDetail.cover_song_id]
        );
        songInfo = {
          title: song.title,
          group_name: groupResult.rows[0]?.group_name || null,
        };
      }
    }

    return NextResponse.json({
      ...portfolio,
      cover_song_id: videoDetail.cover_song_id,
      created_at: videoDetail.created_at,
      view_cnt: videoDetail.view_cnt || 0,
      user: userResult.rows[0] || null,
      song: songInfo,
    });
  } catch (error: any) {
    console.error('Error fetching portfolio detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio: ' + error.message },
      { status: 500 }
    );
  }
}

