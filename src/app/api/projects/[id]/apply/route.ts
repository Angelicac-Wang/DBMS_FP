import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { applicant_id, target_seq, message } = await request.json();

    // 檢查是否是專案創建者
    const creatorCheck = await pool.query(
      `SELECT creator_id FROM project
       WHERE p_id = $1 AND creator_id = $2`,
      [projectId, applicant_id]
    );

    if (creatorCheck.rows.length > 0) {
      return NextResponse.json(
        { error: '您是專案創建者，無法申請' },
        { status: 400 }
      );
    }

    // 檢查用戶是否在 PROJECT_MEMBERS 中有記錄（無論狀態）
    const memberCheck = await pool.query(
      `SELECT status FROM project_members
       WHERE p_id = $1 AND member_id = $2`,
      [projectId, applicant_id]
    );

    if (memberCheck.rows.length > 0) {
      const memberStatus = memberCheck.rows[0].status;
      if (memberStatus === 'Y') {
        return NextResponse.json(
          { error: '您已經加入此專案，無法再次申請' },
          { status: 400 }
        );
      } else if (memberStatus === 'N') {
        return NextResponse.json(
          { error: '您曾經加入過此專案但已退出，無法再次申請' },
          { status: 400 }
        );
      }
    }

    // 檢查是否有狀態為 'W' 的申請
    const pendingApplicationCheck = await pool.query(
      `SELECT appli_id FROM project_applications
       WHERE p_id = $1 AND applicant_id = $2 AND status = 'W'`,
      [projectId, applicant_id]
    );

    if (pendingApplicationCheck.rows.length > 0) {
      return NextResponse.json(
        { error: '您目前有一筆申請正在等待主辦人回覆，請等待主辦人回覆' },
        { status: 400 }
      );
    }

    // 檢查該位置是否已填滿
    const targetCheck = await pool.query(
      `SELECT status FROM project_target
       WHERE project_id = $1 AND target_seq = $2`,
      [projectId, target_seq]
    );

    if (targetCheck.rows.length === 0) {
      return NextResponse.json(
        { error: '此位置不存在' },
        { status: 404 }
      );
    }

    if (targetCheck.rows[0].status === 'F') {
      return NextResponse.json(
        { error: '此位置沒有空缺' },
        { status: 400 }
      );
    }

    // 生成申請 ID
    const generateAppliId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return timestamp * 10000 + random;
    };

    let newAppliId = generateAppliId();
    let attempts = 0;

    while (attempts < 10) {
      const checkResult = await pool.query(
        'SELECT appli_id FROM project_applications WHERE appli_id = $1',
        [newAppliId]
      );

      if (checkResult.rows.length === 0) break;
      newAppliId = generateAppliId();
      attempts++;
    }

    // 插入申請（注意：資料庫中沒有 message 欄位，使用 applied_time 而非 apply_at）
    await pool.query(
      `INSERT INTO project_applications (
        appli_id, p_id, applicant_id, target_seq, status, applied_time
      ) VALUES ($1, $2, $3, $4, 'W', NOW())`,
      [newAppliId, projectId, applicant_id, target_seq]
    );

    return NextResponse.json({ appli_id: newAppliId });
  } catch (error: any) {
    console.error('Error applying to project:', error);
    return NextResponse.json(
      { error: 'Failed to apply: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - 獲取用戶的申請狀態
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ applications: [] });
    }

    const result = await pool.query(
      `SELECT appli_id, target_seq, status, applied_time, reviewed_time
       FROM project_applications
       WHERE p_id = $1 AND applicant_id = $2`,
      [projectId, userId]
    );

    return NextResponse.json({ applications: result.rows });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications: ' + error.message },
      { status: 500 }
    );
  }
}
