import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '500';

    // 獲取歌曲及其團體/偶像資訊
    const songsQuery = `
      SELECT
        s.song_id,
        s.title,
        COALESCE(g.group_name, i.stage_name, s.title) as display_name
      FROM kpop_songs s
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      LEFT JOIN song_idol si ON s.song_id = si.song_id
      LEFT JOIN kpop_idols i ON si.idol_id = i.idol_id
      LIMIT $1
    `;

    const result = await pool.query(songsQuery, [limit]);

    // 格式化結果
    const songs = result.rows.map(row => ({
      song_id: row.song_id,
      title: row.title,
      displayName: row.display_name || row.title,
    }));

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}
