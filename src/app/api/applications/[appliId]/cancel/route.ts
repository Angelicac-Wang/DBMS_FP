import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ appliId: string }> }
) {
  try {
    const { appliId } = await params;

    // 更新申請狀態為 'C' (取消)
    const result = await pool.query(
      `UPDATE project_applications
       SET status = 'C'
       WHERE appli_id = $1 AND status = 'W'`,
      [appliId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '申請不存在或無法取消' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error canceling application:', error);
    return NextResponse.json(
      { error: 'Failed to cancel application: ' + error.message },
      { status: 500 }
    );
  }
}

