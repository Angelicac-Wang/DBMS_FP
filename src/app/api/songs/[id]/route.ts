import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: songId } = await params;

    // 獲取歌曲基本資訊
    const songQuery = `
      SELECT *
      FROM kpop_songs
      WHERE song_id = $1
    `;

    const songResult = await pool.query(songQuery, [songId]);

    if (songResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    const song = songResult.rows[0];

    // 獲取關聯的團體
    const groupsQuery = `
      SELECT g.group_id, g.group_name, g.group_namekr
      FROM song_group sg
      JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE sg.song_id = $1
    `;

    const groupsResult = await pool.query(groupsQuery, [songId]);

    // 獲取關聯的偶像
    const idolsQuery = `
      SELECT i.idol_id, i.stage_name, i.stage_name_kr
      FROM song_idol si
      JOIN kpop_idols i ON si.idol_id = i.idol_id
      WHERE si.song_id = $1
    `;

    const idolsResult = await pool.query(idolsQuery, [songId]);

    return NextResponse.json({
      ...song,
      groups: groupsResult.rows,
      idols: idolsResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching song detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch song: ' + error.message },
      { status: 500 }
    );
  }
}



