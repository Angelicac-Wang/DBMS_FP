import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '用戶 ID 不能為空' },
        { status: 400 }
      );
    }

    // 獲取使用者的成員資訊
    const memberResult = await pool.query(
      `SELECT target_seq, status FROM project_members
       WHERE p_id = $1 AND member_id = $2 AND status = 'Y'`,
      [projectId, userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到您的成員資料，無法退出專案' },
        { status: 404 }
      );
    }

    const memberInfo = memberResult.rows[0];
    const targetSeq = memberInfo.target_seq;

    // 標記為離開，保留紀錄
    await pool.query(
      `UPDATE project_members
       SET status = 'N'
       WHERE p_id = $1 AND member_id = $2`,
      [projectId, userId]
    );

    // 更新目標狀態為空缺
    await pool.query(
      `UPDATE project_target
       SET status = 'I'
       WHERE project_id = $1 AND target_seq = $2`,
      [projectId, targetSeq]
    );

    // 檢查成員人數，如果低於目標人數且專案狀態為已額滿，則改為招募中
    const memberCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM project_members
       WHERE p_id = $1 AND status = 'Y'`,
      [projectId]
    );

    const memberCount = parseInt(memberCountResult.rows[0].count);

    const projectResult = await pool.query(
      `SELECT target_cnt, status FROM project WHERE p_id = $1`,
      [projectId]
    );

    if (projectResult.rows.length > 0) {
      const project = projectResult.rows[0];
      if (
        memberCount < project.target_cnt &&
        project.status === 'F'
      ) {
        await pool.query(
          `UPDATE project
           SET status = 'A', update_at = NOW()
           WHERE p_id = $1`,
          [projectId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving project:', error);
    return NextResponse.json(
      { error: '退出失敗：' + error.message },
      { status: 500 }
    );
  }
}

