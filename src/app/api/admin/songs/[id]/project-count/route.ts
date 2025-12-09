import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: songId } = await params;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM project WHERE song_id = $1',
      [songId]
    );

    return NextResponse.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (error: any) {
    console.error('Error fetching project count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project count: ' + error.message },
      { status: 500 }
    );
  }
}




