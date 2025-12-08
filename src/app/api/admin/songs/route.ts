import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT
        s.song_id,
        s.title,
        s.title_kr,
        s.release_date,
        s.duration,
        s.difficulty_level,
        s.spotify_url,
        s.youtube_original_url
      FROM kpop_songs s
      ORDER BY s.release_date DESC
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      title_kr,
      release_date,
      duration,
      difficulty_level,
      spotify_url,
      youtube_original_url,
    } = body;

    // 生成歌曲 ID
    const generateSongId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return timestamp * 10000 + random;
    };

    let newSongId = generateSongId();

    // 檢查 ID 是否已存在
    let attempts = 0;
    while (attempts < 10) {
      const checkResult = await pool.query(
        'SELECT song_id FROM kpop_songs WHERE song_id = $1',
        [newSongId]
      );

      if (checkResult.rows.length === 0) break;
      newSongId = generateSongId();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: '系統繁忙，請稍後再試' },
        { status: 500 }
      );
    }

    // 插入歌曲
    await pool.query(
      `INSERT INTO kpop_songs (
        song_id, title, title_kr, release_date, duration,
        difficulty_level, spotify_url, youtube_original_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newSongId,
        title,
        title_kr,
        release_date,
        parseInt(duration),
        parseInt(difficulty_level),
        spotify_url || null,
        youtube_original_url,
      ]
    );

    return NextResponse.json({ song_id: newSongId });
  } catch (error: any) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song: ' + error.message },
      { status: 500 }
    );
  }
}
