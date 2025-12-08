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

    // 生成團體 ID
    const generateGroupId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return timestamp * 10000 + random;
    };

    let newGroupId = generateGroupId();

    // 檢查 ID 是否已存在
    let attempts = 0;
    while (attempts < 10) {
      const checkResult = await pool.query(
        'SELECT group_id FROM kpop_groups WHERE group_id = $1',
        [newGroupId]
      );

      if (checkResult.rows.length === 0) break;
      newGroupId = generateGroupId();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: '系統繁忙，請稍後再試' },
        { status: 500 }
      );
    }

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
