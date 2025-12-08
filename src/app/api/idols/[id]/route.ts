import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idolId } = await params;

    // 獲取偶像基本資訊
    const idolQuery = `
      SELECT *
      FROM kpop_idols
      WHERE idol_id = $1
    `;

    const idolResult = await pool.query(idolQuery, [idolId]);

    if (idolResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Idol not found' },
        { status: 404 }
      );
    }

    const idol = idolResult.rows[0];

    // 獲取所屬團體
    const groupsQuery = `
      SELECT g.group_id, g.group_name, g.group_namekr
      FROM group_idol gi
      JOIN kpop_groups g ON gi.group_id = g.group_id
      WHERE gi.idol_id = $1
      ORDER BY g.group_name
    `;

    const groupsResult = await pool.query(groupsQuery, [idolId]);

    // 獲取參與的歌曲
    const songsQuery = `
      SELECT s.song_id, s.title, s.title_kr
      FROM song_idol si
      JOIN kpop_songs s ON si.song_id = s.song_id
      WHERE si.idol_id = $1
      ORDER BY s.song_id
    `;

    const songsResult = await pool.query(songsQuery, [idolId]);

    return NextResponse.json({
      ...idol,
      groups: groupsResult.rows,
      songs: songsResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching idol detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idol: ' + error.message },
      { status: 500 }
    );
  }
}

