import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT region
      FROM users
      WHERE region IS NOT NULL
      ORDER BY region
    `;

    const result = await pool.query(query);
    const regions = result.rows.map(row => row.region);

    return NextResponse.json(regions);
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
