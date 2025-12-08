import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const regions = searchParams.get('regions')?.split(',').filter(Boolean) || [];
    const months = searchParams.get('months')?.split(',').filter(Boolean) || [];
    const groupTypes = searchParams.get('groupTypes')?.split(',').filter(Boolean) || [];

    // 基礎查詢
    let query = `
      SELECT COUNT(DISTINCT p.p_id) as count
      FROM project p
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE p.status = 'A'
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 搜尋條件
    if (searchQuery) {
      conditions.push(`(
        LOWER(p.porject_title) LIKE $${paramIndex} OR
        LOWER(s.title) LIKE $${paramIndex} OR
        LOWER(g.group_name) LIKE $${paramIndex}
      )`);
      params.push(`%${searchQuery.toLowerCase()}%`);
      paramIndex++;
    }

    // 地區篩選
    if (regions.length > 0) {
      conditions.push(`p.practice_location = ANY($${paramIndex}::text[])`);
      params.push(regions);
      paramIndex++;
    }

    // 月份篩選
    if (months.length > 0) {
      const monthConditions: string[] = [];
      months.forEach((month) => {
        const [year, monthNum] = month.split('/');
        const yearParam = paramIndex;
        const monthParam = paramIndex + 1;
        monthConditions.push(`(
          EXTRACT(YEAR FROM ps2.date) = $${yearParam} AND
          EXTRACT(MONTH FROM ps2.date) = $${monthParam}
        )`);
        params.push(parseInt(year), parseInt(monthNum));
        paramIndex += 2;
      });
      if (monthConditions.length > 0) {
        conditions.push(`EXISTS (
          SELECT 1 FROM practice_schedule ps2 
          WHERE ps2.p_id = p.p_id 
          AND (${monthConditions.join(' OR ')})
        )`);
      }
    }

    // 團體類型篩選
    if (groupTypes.length > 0) {
      const typeMap: { [key: string]: string } = { '男團': 'B', '女團': 'G', '混團': 'M' };
      const dbTypes = groupTypes.map(t => typeMap[t]).filter(Boolean);
      if (dbTypes.length > 0) {
        conditions.push(`g.group_type = ANY($${paramIndex}::char[])`);
        params.push(dbTypes);
        paramIndex++;
      }
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    const count = parseInt(result.rows[0].count);

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error counting projects:', error);
    return NextResponse.json(
      { error: 'Failed to count projects: ' + error.message },
      { status: 500 }
    );
  }
}

