import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT practice_location
      FROM project
      WHERE status = 'A' AND practice_location IS NOT NULL
      ORDER BY practice_location
    `;

    const result = await pool.query(query);
    const locations = result.rows.map(row => row.practice_location);

    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('Error fetching practice locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice locations' },
      { status: 500 }
    );
  }
}
