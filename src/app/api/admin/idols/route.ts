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
      LEFT JOIN group_idol gi ON i.idol_id = gi.idol_id
      LEFT JOIN kpop_groups g ON gi.group_id = g.group_id
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      stage_name,
      stage_name_kr,
      nationality,
      debut_date,
      group_id,
    } = body;

    // 驗證必填欄位
    if (!stage_name || !stage_name_kr || !debut_date) {
      return NextResponse.json(
        { error: 'stage_name, stage_name_kr, 和 debut_date 為必填欄位' },
        { status: 400 }
      );
    }

    // 獲取最大 idol_id 並 +1
    const maxIdResult = await pool.query(
      'SELECT COALESCE(MAX(idol_id), 0) as max_id FROM kpop_idols'
    );
    const maxId = parseInt(maxIdResult.rows[0].max_id) || 0;
    const newIdolId = maxId + 1;

    // 插入偶像
    await pool.query(
      `INSERT INTO kpop_idols (
        idol_id, stage_name, stage_name_kr, nationality, debut_date
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        newIdolId,
        stage_name,
        stage_name_kr,
        nationality || null,
        debut_date,
      ]
    );

    // 如果有提供 group_id，建立關聯
    if (group_id) {
      await pool.query(
        'INSERT INTO group_idol (group_id, idol_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [group_id, newIdolId]
      );
    }

    return NextResponse.json({ idol_id: newIdolId });
  } catch (error: any) {
    console.error('Error creating idol:', error);
    return NextResponse.json(
      { error: 'Failed to create idol: ' + error.message },
      { status: 500 }
    );
  }
}
