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
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      title,
      title_kr,
      release_date,
      duration,
      spotify_url,
      youtube_original_url,
      groups,
      idols,
    } = body;

    await client.query('BEGIN');

    // 獲取最大 song_id 並 +1
    const maxIdResult = await client.query(
      'SELECT COALESCE(MAX(song_id), 0) as max_id FROM kpop_songs'
    );
    const maxId = parseInt(maxIdResult.rows[0].max_id) || 0;
    const newSongId = maxId + 1;

    // 插入歌曲
    await client.query(
      `INSERT INTO kpop_songs (
        song_id, title, title_kr, release_date, duration,
        spotify_url, youtube_original_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newSongId,
        title,
        title_kr,
        release_date,
        parseInt(duration),
        spotify_url || null,
        youtube_original_url,
      ]
    );

    // 插入團體關聯
    if (groups && Array.isArray(groups) && groups.length > 0) {
      for (const groupId of groups) {
        await client.query(
          'INSERT INTO song_group (song_id, group_id) VALUES ($1, $2)',
          [newSongId, groupId]
        );
      }
    }

    // 插入偶像關聯
    if (idols && Array.isArray(idols) && idols.length > 0) {
      for (const idolId of idols) {
        await client.query(
          'INSERT INTO song_idol (song_id, idol_id) VALUES ($1, $2)',
          [newSongId, idolId]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ song_id: newSongId });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song: ' + error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
