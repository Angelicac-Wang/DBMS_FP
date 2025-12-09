import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const result = await pool.query(
      'SELECT url, platform, follower_cnt FROM user_social_link WHERE u_id = $1',
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching social links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social links: ' + error.message },
      { status: 500 }
    );
  }
}




