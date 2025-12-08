import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT
        p.p_id,
        p.porject_title,
        p.practice_location,
        p.status,
        p.target_cnt,
        p.create_at,
        u.name as creator_name,
        s.title as song_title
      FROM project p
      LEFT JOIN users u ON p.creator_id = u.u_id
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      ORDER BY p.create_at DESC
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
