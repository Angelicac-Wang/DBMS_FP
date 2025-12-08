import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT
        i.idol_id,
        i.stage_name,
        g.group_name
      FROM kpop_idols i
      LEFT JOIN kpop_groups g ON i.group_id = g.group_id
      ORDER BY g.group_name, i.stage_name
      LIMIT 1000
    `;

    const result = await pool.query(query);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching idols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idols' },
      { status: 500 }
    );
  }
}
