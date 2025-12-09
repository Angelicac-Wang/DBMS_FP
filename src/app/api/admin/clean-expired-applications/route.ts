import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * 清理過期申請 API
 * 將超過 30 天未審核的申請記錄狀態改為 'C'（已取消）
 * 
 * 使用方式：
 * POST /api/admin/clean-expired-applications
 */
export async function POST(request: Request) {
  try {
    // 先查詢有多少筆過期申請
    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM project_applications
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );
    const expiredCount = parseInt(countResult.rows[0].count);

    if (expiredCount === 0) {
      return NextResponse.json({
        success: true,
        message: '沒有過期的申請需要清理',
        cleaned: 0,
      });
    }

    // 更新過期申請的狀態
    const updateResult = await pool.query(
      `UPDATE project_applications
       SET status = 'C', reviewed_time = NOW()
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );

    // 獲取清理後的統計
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'W') as waiting,
         COUNT(*) FILTER (WHERE status = 'C') as cancelled,
         COUNT(*) FILTER (WHERE status = 'A') as accepted,
         COUNT(*) FILTER (WHERE status = 'R') as rejected
       FROM project_applications`
    );

    return NextResponse.json({
      success: true,
      message: `成功清理 ${updateResult.rowCount} 筆過期申請`,
      cleaned: updateResult.rowCount,
      statistics: statsResult.rows[0],
    });
  } catch (error: any) {
    console.error('Error cleaning expired applications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '清理過期申請失敗: ' + error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET 方法：查詢過期申請數量（不執行清理）
 */
export async function GET(request: Request) {
  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM project_applications
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );
    const expiredCount = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      expired_count: expiredCount,
      message: expiredCount > 0 
        ? `有 ${expiredCount} 筆過期申請需要清理`
        : '沒有過期的申請',
    });
  } catch (error: any) {
    console.error('Error checking expired applications:', error);
    return NextResponse.json(
      { error: '查詢過期申請失敗: ' + error.message },
      { status: 500 }
    );
  }
}

