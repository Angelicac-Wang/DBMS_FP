import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { memberId, creatorId } = await request.json();

    if (!memberId || !creatorId) {
      return NextResponse.json(
        { error: '參數不完整' },
        { status: 400 }
      );
    }

    // 驗證是否為專案創建者
    const projectResult = await pool.query(
      `SELECT creator_id FROM project WHERE p_id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: '專案不存在' },
        { status: 404 }
      );
    }

    if (projectResult.rows[0].creator_id.toString() !== creatorId) {
      return NextResponse.json(
        { error: '只有專案創建者可以移除成員' },
        { status: 403 }
      );
    }

    // 不能移除創建者自己
    if (memberId === creatorId) {
      return NextResponse.json(
        { error: '不能移除專案創建者' },
        { status: 400 }
      );
    }

    // 獲取被移除成員的資訊
    const memberResult = await pool.query(
      `SELECT target_seq, status FROM project_members
       WHERE p_id = $1 AND member_id = $2 AND status = 'Y'`,
      [projectId, memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到該成員資料' },
        { status: 404 }
      );
    }

    const memberInfo = memberResult.rows[0];
    const targetSeq = memberInfo.target_seq;

    // 標記為離開，保留紀錄（跟退出專案一樣的效果）
    await pool.query(
      `UPDATE project_members
       SET status = 'N'
       WHERE p_id = $1 AND member_id = $2`,
      [projectId, memberId]
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

    const project = projectResult.rows[0];
    const targetCntResult = await pool.query(
      `SELECT target_cnt, status FROM project WHERE p_id = $1`,
      [projectId]
    );

    if (targetCntResult.rows.length > 0) {
      const projectInfo = targetCntResult.rows[0];
      if (
        memberCount < projectInfo.target_cnt &&
        projectInfo.status === 'F'
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
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: '移除成員失敗：' + error.message },
      { status: 500 }
    );
  }
}

