import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - 獲取專案管理資料
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 獲取專案資訊
    const projectResult = await pool.query(
      'SELECT * FROM project WHERE p_id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0];

    // 檢查是否為專案創建者
    if (userId && project.creator_id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 獲取歌曲資訊
    let songInfo = null;
    if (project.song_id) {
      const songResult = await pool.query(
        'SELECT title FROM kpop_songs WHERE song_id = $1',
        [project.song_id]
      );
      if (songResult.rows.length > 0) {
        const song = songResult.rows[0];
        const groupResult = await pool.query(
          `SELECT g.group_name
           FROM song_group sg
           JOIN kpop_groups g ON sg.group_id = g.group_id
           WHERE sg.song_id = $1
           LIMIT 1`,
          [project.song_id]
        );
        songInfo = {
          title: song.title,
          group_name: groupResult.rows[0]?.group_name || null,
        };
      }
    }

    // 獲取練習時間表
    const schedulesResult = await pool.query(
      'SELECT * FROM practice_schedule WHERE p_id = $1 ORDER BY date ASC',
      [projectId]
    );

    // 獲取目標位置
    const targetsResult = await pool.query(
      `SELECT pt.target_seq, pt.idol_id, pt.status, i.stage_name
       FROM project_target pt
       LEFT JOIN kpop_idols i ON pt.idol_id = i.idol_id
       WHERE pt.project_id = $1
       ORDER BY pt.target_seq`,
      [projectId]
    );

    // 獲取成員
    const membersResult = await pool.query(
      `SELECT pm.member_id, pm.target_seq, pm.join_date, pm.status, u.name
       FROM project_members pm
       JOIN users u ON pm.member_id = u.u_id
       WHERE pm.p_id = $1`,
      [projectId]
    );

    // 獲取申請列表
    const applicationsResult = await pool.query(
      `SELECT appli_id, applicant_id, target_seq, applied_time, status
       FROM project_applications
       WHERE p_id = $1 AND status = 'W'
       ORDER BY applied_time DESC`,
      [projectId]
    );

    // 獲取申請者詳細資訊
    const applicationsWithDetails = await Promise.all(
      applicationsResult.rows.map(async (app) => {
        const userResult = await pool.query(
          'SELECT name FROM users WHERE u_id = $1',
          [app.applicant_id]
        );
        const skillsResult = await pool.query(
          'SELECT * FROM user_skills WHERE u_id = $1',
          [app.applicant_id]
        );
        const portfoliosResult = await pool.query(
          'SELECT * FROM portfolios WHERE u_id = $1 LIMIT 3',
          [app.applicant_id]
        );

        const target = targetsResult.rows.find((t) => t.target_seq === app.target_seq);

        return {
          ...app,
          applicant_name: userResult.rows[0]?.name,
          applicant_skills: skillsResult.rows,
          applicant_portfolios: portfoliosResult.rows,
          idol_name: target?.stage_name,
        };
      })
    );

    return NextResponse.json({
      project,
      songInfo,
      practiceSchedules: schedulesResult.rows,
      targets: targetsResult.rows,
      members: membersResult.rows.map(m => ({
        ...m,
        users: { name: m.name },
      })),
      applications: applicationsWithDetails,
    });
  } catch (error: any) {
    console.error('Error fetching project management data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - 審核申請
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { appli_id, status } = await request.json();

    // 更新申請狀態
    await pool.query(
      `UPDATE project_applications
       SET status = $1, reviewed_time = NOW()
       WHERE appli_id = $2`,
      [status, appli_id]
    );

    if (status === 'A') {
      // 如果接受申請，需要將申請者加入專案成員
      const appResult = await pool.query(
        'SELECT applicant_id, target_seq FROM project_applications WHERE appli_id = $1',
        [appli_id]
      );

      if (appResult.rows.length > 0) {
        const app = appResult.rows[0];

        // 更新目標狀態為已填滿
        await pool.query(
          `UPDATE project_target
           SET status = 'F'
           WHERE project_id = $1 AND target_seq = $2`,
          [projectId, app.target_seq]
        );

        // 加入專案成員
        await pool.query(
          `INSERT INTO project_members (p_id, member_id, join_date, target_seq, status)
           VALUES ($1, $2, CURRENT_DATE, $3, 'Y')
           ON CONFLICT (p_id, member_id, target_seq) DO NOTHING`,
          [projectId, app.applicant_id, app.target_seq]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reviewing application:', error);
    return NextResponse.json(
      { error: 'Failed to review: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - 新增練習時間
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { action, date, start_time, end_time, schedule_date } = await request.json();

    if (action === 'add') {
      await pool.query(
        `INSERT INTO practice_schedule (p_id, date, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [projectId, date, start_time, end_time]
      );
    } else if (action === 'delete') {
      await pool.query(
        'DELETE FROM practice_schedule WHERE p_id = $1 AND date = $2',
        [projectId, schedule_date]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error managing schedule:', error);
    return NextResponse.json(
      { error: 'Failed to manage schedule: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - 刪除專案
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 先刪除 PROJECT_TARGET（因為主鍵包含 project_id）
    await pool.query(
      'DELETE FROM project_target WHERE project_id = $1',
      [projectId]
    );

    // 刪除專案（會自動 CASCADE 刪除相關資料）
    await pool.query('DELETE FROM project WHERE p_id = $1', [projectId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete: ' + error.message },
      { status: 500 }
    );
  }
}

