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

    // 獲取我申請的專案（只查詢狀態為 'W' 或 'R' 的申請）
    const applicationsQuery = `
      SELECT 
        appli_id,
        p_id,
        target_seq,
        status,
        applied_time
      FROM project_applications
      WHERE applicant_id = $1 AND status IN ('W', 'R')
      ORDER BY applied_time DESC
    `;

    const applicationsResult = await pool.query(applicationsQuery, [userId]);

    if (applicationsResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    // 獲取所有申請對應的專案 ID
    const projectIds = [...new Set(applicationsResult.rows.map(a => a.p_id))];

    // 批次查詢專案資訊
    const projectsQuery = `
      SELECT
        p.*,
        s.title as song_title,
        g.group_name
      FROM project p
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE p.p_id = ANY($1)
    `;

    const projectsResult = await pool.query(projectsQuery, [projectIds]);

    if (projectsResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    // 建立申請映射表（每個專案對應的申請資訊）
    const applicationMap = new Map<number, {
      appli_id: number;
      status: string;
      target_seq: number;
      applied_time: string;
    }>();

    applicationsResult.rows.forEach((app) => {
      const pid = Number(app.p_id);
      if (!Number.isNaN(pid)) {
        // 如果同一個專案有多個申請，保留最新的
        const existing = applicationMap.get(pid);
        if (!existing || new Date(app.applied_time) > new Date(existing.applied_time)) {
          applicationMap.set(pid, {
            appli_id: app.appli_id,
            status: app.status,
            target_seq: app.target_seq,
            applied_time: app.applied_time,
          });
        }
      }
    });

    // 批次獲取成員數量
    const membersResult = await pool.query(
      `SELECT p_id, COUNT(*) as count
       FROM project_members
       WHERE p_id = ANY($1) AND status = 'Y'
       GROUP BY p_id`,
      [projectIds]
    );

    const membersMap = new Map(
      membersResult.rows.map(r => [r.p_id, parseInt(r.count)])
    );

    // 組裝專案詳細資訊
    const projects = projectsResult.rows.map((project) => {
      const projectId = Number(project.p_id);
      const applicationInfo = applicationMap.get(projectId);

      return {
        p_id: project.p_id,
        porject_title: project.porject_title,
        status: project.status,
        create_at: project.create_at,
        update_at: project.update_at,
        practice_location: project.practice_location,
        target_cnt: project.target_cnt,
        creator_id: project.creator_id,
        song: project.song_title ? {
          title: project.song_title,
          group_name: project.group_name || undefined,
        } : undefined,
        member_count: membersMap.get(projectId) || 0,
        application_status: applicationInfo?.status || '',
        application_id: applicationInfo?.appli_id,
        target_seq: applicationInfo?.target_seq,
        applied_time: applicationInfo?.applied_time,
      };
    });

    // 排序：待回覆的優先，然後按申請時間降序
    const sortedProjects = projects.sort((a, b) => {
      const aIsWaiting = a.application_status === 'W' ? 1 : 0;
      const bIsWaiting = b.application_status === 'W' ? 1 : 0;
      if (aIsWaiting !== bIsWaiting) return bIsWaiting - aIsWaiting;
      const aTime = a.applied_time ? new Date(a.applied_time).getTime() : 0;
      const bTime = b.applied_time ? new Date(b.applied_time).getTime() : 0;
      return bTime - aTime;
    });

    // 根據篩選條件過濾專案
    let filteredProjects = sortedProjects;
    if (filter === 'waiting') {
      filteredProjects = sortedProjects.filter(p => p.application_status === 'W');
    } else if (filter === 'rejected') {
      filteredProjects = sortedProjects.filter(p => p.application_status === 'R');
    }

    return NextResponse.json(filteredProjects);
  } catch (error: any) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications: ' + error.message },
      { status: 500 }
    );
  }
}

