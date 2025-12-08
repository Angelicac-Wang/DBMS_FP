import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        isCreator: false,
        isMember: false,
        memberStatus: null,
        pendingApplication: null,
      });
    }

    // 檢查是否是專案創建者
    const creatorResult = await pool.query(
      `SELECT creator_id FROM project WHERE p_id = $1 AND creator_id = $2`,
      [projectId, userId]
    );

    const isCreator = creatorResult.rows.length > 0;

    // 檢查是否在 PROJECT_MEMBERS 中有記錄
    const memberResult = await pool.query(
      `SELECT status, target_seq FROM project_members
       WHERE p_id = $1 AND member_id = $2`,
      [projectId, userId]
    );

    let isMember = false;
    let memberStatus = null;
    let memberTargetSeq = null;

    if (memberResult.rows.length > 0) {
      isMember = true;
      memberStatus = memberResult.rows[0].status;
      memberTargetSeq = memberResult.rows[0].target_seq;
    }

    // 檢查是否有狀態為 'W' 的申請
    const applicationResult = await pool.query(
      `SELECT appli_id, target_seq FROM project_applications
       WHERE p_id = $1 AND applicant_id = $2 AND status = 'W'`,
      [projectId, userId]
    );

    let pendingApplication = null;
    if (applicationResult.rows.length > 0) {
      pendingApplication = {
        appli_id: applicationResult.rows[0].appli_id,
        target_seq: applicationResult.rows[0].target_seq,
      };
    }

    return NextResponse.json({
      isCreator,
      isMember,
      memberStatus,
      memberTargetSeq,
      pendingApplication,
    });
  } catch (error: any) {
    console.error('Error fetching user status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user status: ' + error.message },
      { status: 500 }
    );
  }
}

