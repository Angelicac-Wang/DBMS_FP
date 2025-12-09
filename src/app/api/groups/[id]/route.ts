import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    // 獲取團體基本資訊
    const groupQuery = `
      SELECT *
      FROM kpop_groups
      WHERE group_id = $1
    `;

    const groupResult = await pool.query(groupQuery, [groupId]);

    if (groupResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const group = groupResult.rows[0];

    // 獲取團體成員
    const membersQuery = `
      SELECT i.idol_id, i.stage_name, i.stage_name_kr
      FROM group_idol gi
      JOIN kpop_idols i ON gi.idol_id = i.idol_id
      WHERE gi.group_id = $1
      ORDER BY i.idol_id
    `;

    const membersResult = await pool.query(membersQuery, [groupId]);

    // 獲取團體的歌曲
    const songsQuery = `
      SELECT s.song_id, s.title, s.title_kr
      FROM song_group sg
      JOIN kpop_songs s ON sg.song_id = s.song_id
      WHERE sg.group_id = $1
      ORDER BY s.song_id
    `;

    const songsResult = await pool.query(songsQuery, [groupId]);

    return NextResponse.json({
      ...group,
      members: membersResult.rows,
      songs: songsResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching group detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group: ' + error.message },
      { status: 500 }
    );
  }
}



