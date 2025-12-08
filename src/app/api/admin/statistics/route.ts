import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 總使用者數
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // 總專案數
    const totalProjectsResult = await pool.query('SELECT COUNT(*) as count FROM project');
    const totalProjects = parseInt(totalProjectsResult.rows[0].count);

    // 活躍專案數（狀態為 A）
    const activeProjectsResult = await pool.query(
      "SELECT COUNT(*) as count FROM project WHERE status = 'A'"
    );
    const activeProjects = parseInt(activeProjectsResult.rows[0].count);

    // 今日新增專案數
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayProjectsResult = await pool.query(
      'SELECT COUNT(*) as count FROM project WHERE create_at >= $1',
      [today]
    );
    const todayProjects = parseInt(todayProjectsResult.rows[0].count);

    return NextResponse.json({
      totalUsers,
      totalProjects,
      activeProjects,
      todayProjects,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics: ' + error.message },
      { status: 500 }
    );
  }
}

