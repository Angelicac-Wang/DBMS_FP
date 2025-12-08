import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const songIdsParam = searchParams.get('songIds');
    
    if (!songIdsParam) {
      return NextResponse.json({ count: 0 });
    }

    const songIds = songIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (songIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM project WHERE song_id = ANY($1)',
      [songIds]
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

