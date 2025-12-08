import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // 獲取使用者創建的專案
    const createdProjectsQuery = `
      SELECT
        p.*,
        s.title as song_title,
        g.group_name
      FROM project p
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE p.creator_id = $1
      ORDER BY p.create_at DESC
    `;

    // 獲取使用者參與的專案
    const joinedProjectsQuery = `
      SELECT
        p.*,
        s.title as song_title,
        g.group_name
      FROM project_members pm
      JOIN project p ON pm.p_id = p.p_id
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE pm.member_id = $1 AND pm.status = 'Y'
      ORDER BY p.create_at DESC
    `;

    const [createdResult, joinedResult] = await Promise.all([
      pool.query(createdProjectsQuery, [userId]),
      pool.query(joinedProjectsQuery, [userId]),
    ]);

    let projects = [];

    if (filter === 'all') {
      // 合併並去重
      const projectMap = new Map();
      [...createdResult.rows, ...joinedResult.rows].forEach((p) => {
        if (!projectMap.has(p.p_id)) {
          projectMap.set(p.p_id, p);
        }
      });
      projects = Array.from(projectMap.values());
    } else if (filter === 'created') {
      projects = createdResult.rows;
    } else if (filter === 'joined') {
      projects = joinedResult.rows;
    }

    // 批次獲取每個專案的成員數和申請數
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.p_id);

      const [membersResult, applicationsResult] = await Promise.all([
        pool.query(
          `SELECT p_id, COUNT(*) as count
           FROM project_members
           WHERE p_id = ANY($1) AND status = 'Y'
           GROUP BY p_id`,
          [projectIds]
        ),
        pool.query(
          `SELECT p_id, COUNT(*) as count
           FROM project_applications
           WHERE p_id = ANY($1) AND status = 'W'
           GROUP BY p_id`,
          [projectIds]
        ),
      ]);

      // 建立映射
      const membersMap = new Map(
        membersResult.rows.map(r => [r.p_id, parseInt(r.count)])
      );
      const applicationsMap = new Map(
        applicationsResult.rows.map(r => [r.p_id, parseInt(r.count)])
      );

      // 組裝結果
      projects = projects.map(p => ({
        p_id: p.p_id,
        porject_title: p.porject_title,
        status: p.status,
        create_at: p.create_at,
        update_at: p.update_at,
        practice_location: p.practice_location,
        target_cnt: p.target_cnt,
        creator_id: p.creator_id,
        song: p.song_title ? {
          title: p.song_title,
          group_name: p.group_name || undefined,
        } : undefined,
        member_count: membersMap.get(p.p_id) || 0,
        application_count: applicationsMap.get(p.p_id) || 0,
      }));
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects: ' + error.message },
      { status: 500 }
    );
  }
}
