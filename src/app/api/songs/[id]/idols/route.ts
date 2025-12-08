import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: songId } = await params;

    // 獲取歌曲對應的團體的所有偶像
    const query = `
      SELECT DISTINCT i.idol_id, i.stage_name
      FROM kpop_idols i
      INNER JOIN group_idol gi ON i.idol_id = gi.idol_id
      INNER JOIN song_group sg ON gi.group_id = sg.group_id
      WHERE sg.song_id = $1
      ORDER BY i.idol_id
    `;

    const result = await pool.query(query, [songId]);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching group idols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group idols' },
      { status: 500 }
    );
  }
}

