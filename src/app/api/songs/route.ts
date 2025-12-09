import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit') || '100';

    // 建立搜尋條件
    let searchCondition = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (search.trim()) {
      // 搜尋歌曲標題、韓文標題、團體名稱或偶像名稱
      // 在外層查詢中使用子查詢的欄位進行搜尋
      searchCondition = `
        WHERE (
          song_data.title ILIKE $${paramIndex} OR 
          song_data.title_kr ILIKE $${paramIndex} OR
          song_data.display_name ILIKE $${paramIndex} OR
          song_data.group_names ILIKE $${paramIndex} OR
          song_data.idol_names ILIKE $${paramIndex}
        )
      `;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 獲取歌曲及其團體/偶像資訊
    // 使用子查詢來聚合團體名稱，避免笛卡爾積問題
    // 將整個查詢包裝在子查詢中，以便在 WHERE 條件中使用聚合欄位
    const songsQuery = `
      SELECT 
        song_id,
        title,
        display_name
      FROM (
        SELECT DISTINCT
          s.song_id,
          s.title,
          COALESCE(s.title_kr, '') as title_kr,
          CASE 
            WHEN group_names IS NOT NULL AND group_names != '' THEN 
              group_names || ' - ' || s.title
            WHEN idol_names IS NOT NULL AND idol_names != '' THEN 
              idol_names || ' - ' || s.title
            ELSE 
              s.title
          END as display_name,
          COALESCE(group_names, '') as group_names,
          COALESCE(idol_names, '') as idol_names
        FROM kpop_songs s
        LEFT JOIN (
          SELECT 
            sg.song_id,
            STRING_AGG(DISTINCT g.group_name, ', ' ORDER BY g.group_name) as group_names
          FROM song_group sg
          JOIN kpop_groups g ON sg.group_id = g.group_id
          GROUP BY sg.song_id
        ) groups ON s.song_id = groups.song_id
        LEFT JOIN (
          SELECT 
            si.song_id,
            STRING_AGG(DISTINCT i.stage_name, ', ' ORDER BY i.stage_name) as idol_names
          FROM song_idol si
          JOIN kpop_idols i ON si.idol_id = i.idol_id
          GROUP BY si.song_id
        ) idols ON s.song_id = idols.song_id
      ) song_data
      ${searchCondition}
      ORDER BY song_id
      LIMIT $${paramIndex}
    `;

    params.push(limit);
    
    // 除錯：記錄搜尋參數和查詢
    if (search.trim()) {
      console.log('Searching songs with query:', search);
      console.log('SQL query:', songsQuery.replace(/\s+/g, ' '));
      console.log('Params:', params);
    }
    
    const result = await pool.query(songsQuery, params);

    // 格式化結果
    const songs = result.rows.map(row => ({
      song_id: row.song_id,
      title: row.title,
      displayName: row.display_name || row.title,
    }));

    if (search.trim()) {
      console.log(`Found ${songs.length} songs matching "${search}"`);
    }

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}
