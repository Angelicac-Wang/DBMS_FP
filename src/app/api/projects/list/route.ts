import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');
    const searchQuery = searchParams.get('search') || '';
    const regions = searchParams.get('regions')?.split(',').filter(Boolean) || [];
    const months = searchParams.get('months')?.split(',').filter(Boolean) || [];
    const groupTypes = searchParams.get('groupTypes')?.split(',').filter(Boolean) || [];

    // 構建查詢條件
    const conditions: string[] = ['p.status = \'A\''];
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

    // 月份篩選（需要子查詢）
    let monthCondition = '';
    if (months.length > 0) {
      const monthConditions: string[] = [];
      months.forEach((month) => {
        const [year, monthNum] = month.split('/');
        monthConditions.push(`(
          EXTRACT(YEAR FROM ps2.date) = $${paramIndex} AND
          EXTRACT(MONTH FROM ps2.date) = $${paramIndex + 1}
        )`);
        params.push(parseInt(year), parseInt(monthNum));
        paramIndex += 2;
      });
      if (monthConditions.length > 0) {
        monthCondition = `AND EXISTS (
          SELECT 1 FROM practice_schedule ps2 
          WHERE ps2.p_id = p.p_id 
          AND (${monthConditions.join(' OR ')})
        )`;
      }
    }

    // 獲取所有進行中的專案（帶篩選條件）
    const query = `
      SELECT DISTINCT
        p.p_id,
        p.porject_title,
        p.practice_location,
        p.status,
        p.creator_id,
        p.song_id,
        p.create_at,
        p.target_cnt,
        u.name as creator_name,
        s.title as song_title,
        s.youtube_original_url,
        g.group_name,
        g.group_type,
        g.logo_image
      FROM project p
      LEFT JOIN users u ON p.creator_id = u.u_id
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE ${conditions.join(' AND ')} ${monthCondition}
      ORDER BY p.create_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    // 獲取練習時間表
    const projectIds = result.rows.map(p => p.p_id);
    let schedulesMap = new Map();
    let membershipMap = new Map();
    let missingPositionsMap = new Map();
    let memberCountsMap = new Map();
    let creatorMap = new Map();
    let pendingApplicationMap = new Map();

    if (projectIds.length > 0) {
      // 批次獲取練習時間
      const schedulesResult = await pool.query(
        `SELECT p_id, date, start_time, end_time
         FROM practice_schedule
         WHERE p_id = ANY($1)
         ORDER BY date, start_time`,
        [projectIds]
      );

      schedulesResult.rows.forEach(s => {
        if (!schedulesMap.has(s.p_id)) {
          schedulesMap.set(s.p_id, []);
        }
        schedulesMap.get(s.p_id).push({
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        });
      });

      // 批次獲取成員數量
      const memberCountsResult = await pool.query(
        `SELECT p_id, COUNT(*) as count
         FROM project_members
         WHERE p_id = ANY($1) AND status = 'Y'
         GROUP BY p_id`,
        [projectIds]
      );
      memberCountsResult.rows.forEach(m => {
        memberCountsMap.set(m.p_id, parseInt(m.count));
      });

      // 如果有 userId，檢查用戶狀態（成員身份、創建者身份、待審核申請）
      if (userId) {
        // 檢查成員身份（與詳細頁面邏輯一致：只檢查是否有記錄，不限制 status）
        const membershipResult = await pool.query(
          `SELECT p_id, status FROM project_members WHERE member_id = $1 AND p_id = ANY($2)`,
          [userId, projectIds]
        );
        membershipResult.rows.forEach(m => {
          // 只有 status = 'Y' 的才算成員（與詳細頁面邏輯一致）
          if (m.status === 'Y') {
            membershipMap.set(m.p_id, true);
          }
        });

        // 檢查創建者身份
        const creatorResult = await pool.query(
          `SELECT p_id FROM project WHERE creator_id = $1 AND p_id = ANY($2)`,
          [userId, projectIds]
        );
        creatorResult.rows.forEach(c => {
          creatorMap.set(c.p_id, true);
        });

        // 檢查待審核申請
        const applicationResult = await pool.query(
          `SELECT p_id, appli_id FROM project_applications WHERE applicant_id = $1 AND p_id = ANY($2) AND status = 'W'`,
          [userId, projectIds]
        );
        applicationResult.rows.forEach(a => {
          pendingApplicationMap.set(a.p_id, { appli_id: a.appli_id });
        });
      }

      // 獲取缺少的位置
      const missingResult = await pool.query(
        `SELECT
          pt.project_id as p_id,
          pt.target_seq,
          pt.idol_id,
          i.stage_name as idol_name
         FROM project_target pt
         LEFT JOIN kpop_idols i ON pt.idol_id = i.idol_id
         WHERE pt.project_id = ANY($1) AND pt.status = 'I'
         ORDER BY pt.project_id, pt.target_seq`,
        [projectIds]
      );

      missingResult.rows.forEach(pos => {
        if (!missingPositionsMap.has(pos.p_id)) {
          missingPositionsMap.set(pos.p_id, []);
        }
        missingPositionsMap.get(pos.p_id).push(
          pos.idol_name || `位置 ${pos.target_seq}`
        );
      });
    }

    // 生成 YouTube 縮圖 URL 的輔助函數
    const getYoutubeThumbnail = (url: string | null | undefined): string | null => {
      if (!url) return null;
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    };

    // 組裝結果
    const projects = result.rows.map(p => {
      const youtubeThumbnail = getYoutubeThumbnail(p.youtube_original_url);
      const groupLogoUrl = p.logo_image && !p.logo_image.includes('kprofiles.com') ? p.logo_image : null;
      
      const isCreator = userId ? creatorMap.get(p.p_id) || false : false;
      const isMember = userId ? membershipMap.get(p.p_id) || false : false;
      const pendingApplication = userId ? pendingApplicationMap.get(p.p_id) || null : null;

      return {
        p_id: p.p_id.toString(),
        porject_title: p.porject_title,
        practice_location: p.practice_location,
        status: p.status,
        creator_id: p.creator_id?.toString(),
        creator_name: p.creator_name,
        is_member: isMember,
        is_creator: isCreator,
        pending_application: pendingApplication,
        song_id: p.song_id?.toString(),
        target_cnt: p.target_cnt || 0,
        member_count: memberCountsMap.get(p.p_id) || 0,
        song: p.song_title ? {
          title: p.song_title,
          group: p.group_name ? {
            group_name: p.group_name,
            group_type: p.group_type,
          } : undefined,
        } : undefined,
        practice_schedules: schedulesMap.get(p.p_id) || [],
        missing_positions: missingPositionsMap.get(p.p_id) || [],
        create_at: p.create_at,
        songThumbnail: youtubeThumbnail,
        groupLogoUrl: groupLogoUrl,
      };
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects: ' + error.message },
      { status: 500 }
    );
  }
}
