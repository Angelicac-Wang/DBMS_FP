import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 先找到 angelica 用户的 ID
    const userResult = await pool.query(
      'SELECT u_id FROM users WHERE name = $1',
      ['angelica']
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    const userId = userResult.rows[0].u_id;

    // 获取该用户的所有 portfolio
    const query = `
      SELECT
        p.video_url,
        p.title,
        p.discription,
        vd.created_at
      FROM portfolios p
      LEFT JOIN video_detail vd ON p.video_url = vd.video_url
      WHERE p.u_id = $1
      ORDER BY RANDOM()
    `;

    const result = await pool.query(query, [userId]);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching angelica portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios: ' + error.message },
      { status: 500 }
    );
  }
}


