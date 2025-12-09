import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 獲取所有申請記錄
    const applicationsResult = await pool.query(
      `SELECT 
        appli_id as application_id,
        applicant_id,
        target_seq,
        status,
        applied_time,
        reviewed_time as review_time
       FROM project_applications
       WHERE p_id = $1
       ORDER BY applied_time DESC`,
      [projectId]
    );

    // 獲取申請者詳細資訊
    const applicationsWithDetails = await Promise.all(
      applicationsResult.rows.map(async (app) => {
        // 獲取申請者名稱
        const userResult = await pool.query(
          'SELECT name FROM users WHERE u_id = $1',
          [app.applicant_id]
        );

        // 獲取位置對應的偶像名稱
        const targetResult = await pool.query(
          `SELECT pt.idol_id, i.stage_name
           FROM project_target pt
           LEFT JOIN kpop_idols i ON pt.idol_id = i.idol_id
           WHERE pt.project_id = $1 AND pt.target_seq = $2`,
          [projectId, app.target_seq]
        );

        return {
          ...app,
          applicant_name: userResult.rows[0]?.name || '未知',
          idol_name: targetResult.rows[0]?.stage_name,
        };
      })
    );

    return NextResponse.json({ applications: applicationsWithDetails });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications: ' + error.message },
      { status: 500 }
    );
  }
}



