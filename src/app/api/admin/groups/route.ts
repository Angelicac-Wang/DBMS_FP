import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT group_id, group_name, group_namekr, debut_date, company,
             group_type, member_count, logo_image
      FROM kpop_groups
      ORDER BY debut_date DESC
    `;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      group_name,
      group_namekr,
      debut_date,
      company,
      group_type,
      member_count,
      logo_image,
      discription,
    } = body;

    // 獲取最大 group_id 並 +1
    const maxIdResult = await pool.query(
      'SELECT COALESCE(MAX(group_id), 0) as max_id FROM kpop_groups'
    );
    const maxId = parseInt(maxIdResult.rows[0].max_id) || 0;
    const newGroupId = maxId + 1;

    // 插入團體
    await pool.query(
      `INSERT INTO kpop_groups (
        group_id, group_name, group_namekr, debut_date, company,
        group_type, member_count, logo_image, discription
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newGroupId,
        group_name,
        group_namekr || null,
        debut_date,
        company,
        group_type,
        parseInt(member_count),
        logo_image || null,
        discription || null,
      ]
    );

    return NextResponse.json({ group_id: newGroupId });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group: ' + error.message },
      { status: 500 }
    );
  }
}
