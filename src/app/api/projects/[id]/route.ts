import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 獲取專案基本資訊
    const projectQuery = `
      SELECT
        p.p_id,
        p.porject_title,
        p.practice_location,
        p.status,
        p.target_cnt,
        p.creator_id,
        p.create_at,
        p.update_at,
        p.description,
        p.song_id,
        u.name as creator_name,
        s.title as song_title,
        s.duration,
        s.youtube_original_url,
        g.group_id,
        g.group_name
      FROM project p
      LEFT JOIN users u ON p.creator_id = u.u_id
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      LEFT JOIN song_group sg ON s.song_id = sg.song_id
      LEFT JOIN kpop_groups g ON sg.group_id = g.group_id
      WHERE p.p_id = $1
    `;

    const result = await pool.query(projectQuery, [projectId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = result.rows[0];

    // 獲取練習時間表
    const schedulesResult = await pool.query(
      `SELECT date, start_time, end_time
       FROM practice_schedule
       WHERE p_id = $1
       ORDER BY date, start_time`,
      [projectId]
    );

    // 獲取缺少的位置（未填滿）
    const missingResult = await pool.query(
      `SELECT
        pt.target_seq,
        pt.idol_id,
        i.stage_name as idol_name
       FROM project_target pt
       LEFT JOIN kpop_idols i ON pt.idol_id = i.idol_id
       WHERE pt.project_id = $1 AND pt.status = 'I'
       ORDER BY pt.target_seq`,
      [projectId]
    );

    // 獲取已填滿的位置
    const filledResult = await pool.query(
      `SELECT
        pt.target_seq,
        pm.member_id,
        u.name as member_name,
        pt.idol_id,
        i.stage_name as idol_name
       FROM project_target pt
       INNER JOIN project_members pm ON pt.project_id = pm.p_id AND pt.target_seq = pm.target_seq
       LEFT JOIN users u ON pm.member_id = u.u_id
       LEFT JOIN kpop_idols i ON pt.idol_id = i.idol_id
       WHERE pt.project_id = $1 AND pt.status = 'F' AND pm.status = 'Y'
       ORDER BY pt.target_seq`,
      [projectId]
    );

    // 組裝結果
    const projectDetail = {
      p_id: project.p_id,
      porject_title: project.porject_title,
      practice_location: project.practice_location,
      status: project.status,
      target_cnt: project.target_cnt,
      creator_id: project.creator_id,
      create_at: project.create_at,
      update_at: project.update_at,
      description: project.description,
      song_id: project.song_id,
      creator_name: project.creator_name,
      song: project.song_title ? {
        title: project.song_title,
        duration: project.duration,
        youtube_original_url: project.youtube_original_url,
        group: project.group_name ? {
          group_id: project.group_id,
          group_name: project.group_name,
        } : undefined,
      } : undefined,
      practice_schedules: schedulesResult.rows,
      missing_positions: missingResult.rows,
      filled_positions: filledResult.rows,
    };

    return NextResponse.json(projectDetail);
  } catch (error: any) {
    console.error('Error fetching project detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project: ' + error.message },
      { status: 500 }
    );
  }
}
