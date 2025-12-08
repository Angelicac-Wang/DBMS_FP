import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const region = searchParams.get('region');
    const gender = searchParams.get('gender');
    const status = searchParams.get('status');

    let query = `
      SELECT u_id, name, email, region, gender, status, create_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // 搜尋
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 篩選地區
    if (region) {
      query += ` AND region = $${paramIndex}`;
      params.push(region);
      paramIndex++;
    }

    // 篩選性別
    if (gender) {
      query += ` AND gender = $${paramIndex}`;
      params.push(gender);
      paramIndex++;
    }

    // 篩選狀態
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY create_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
