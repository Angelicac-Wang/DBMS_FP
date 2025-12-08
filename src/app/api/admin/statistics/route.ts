import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 總使用者數
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // 活躍使用者數（最近30天有登入）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE last_login >= $1',
      [thirtyDaysAgo]
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // 總專案數
    const totalProjectsResult = await pool.query('SELECT COUNT(*) as count FROM project');
    const totalProjects = parseInt(totalProjectsResult.rows[0].count);

    // 活躍專案數（狀態為 A）
    const activeProjectsResult = await pool.query(
      "SELECT COUNT(*) as count FROM project WHERE status = 'A'"
    );
    const activeProjects = parseInt(activeProjectsResult.rows[0].count);

    // 已完成專案數（狀態為 F）
    const completedProjectsResult = await pool.query(
      "SELECT COUNT(*) as count FROM project WHERE status = 'F'"
    );
    const completedProjects = parseInt(completedProjectsResult.rows[0].count);

    // 各狀態專案數量
    const statusResult = await pool.query('SELECT status, COUNT(*) as count FROM project GROUP BY status');
    const statusDistribution = statusResult.rows.map((row) => ({
      status: row.status,
      count: parseInt(row.count),
    }));

    // 地區分布
    const regionResult = await pool.query(
      "SELECT COALESCE(region, '未知') as region, COUNT(*) as count FROM users GROUP BY region"
    );
    const regionDistribution = regionResult.rows.map((row) => ({
      region: row.region,
      count: parseInt(row.count),
    }));

    // 性別分布
    const genderResult = await pool.query(
      "SELECT gender, COUNT(*) as count FROM users GROUP BY gender"
    );
    const genderDistribution = genderResult.rows.map((row) => {
      let gender = '未知';
      if (row.gender === 'B') gender = '男';
      else if (row.gender === 'G') gender = '女';
      return {
        gender,
        count: parseInt(row.count),
      };
    });

    // 熱門翻跳歌曲排行 - 使用 JOIN 確保能獲取到歌曲標題
    const songsResult = await pool.query(`
      SELECT 
        p.song_id,
        COALESCE(s.title, '未知歌曲') as title,
        COUNT(*) as count
      FROM project p
      LEFT JOIN kpop_songs s ON p.song_id = s.song_id
      WHERE p.song_id IS NOT NULL
      GROUP BY p.song_id, s.title
      ORDER BY count DESC
      LIMIT 10
    `);

    const topSongs: { song_id: number; title: string; count: number }[] = songsResult.rows.map((row) => {
      const songId = typeof row.song_id === 'string' ? parseInt(row.song_id) : Number(row.song_id);
      return {
        song_id: songId,
        title: row.title || '未知歌曲',
        count: parseInt(row.count),
      };
    });

    // 人數規模分布
    const sizeResult = await pool.query(
      'SELECT target_cnt as size, COUNT(*) as count FROM project GROUP BY target_cnt ORDER BY target_cnt'
    );
    const sizeDistribution = sizeResult.rows.map((row) => ({
      size: parseInt(row.size),
      count: parseInt(row.count),
    }));

    // 專案完成率
    const completionRate =
      totalProjects > 0 ? ((completedProjects / totalProjects) * 100) : 0;

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
      activeUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      todayProjects,
      statusDistribution,
      regionDistribution,
      genderDistribution,
      topSongs,
      sizeDistribution,
      completionRate,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics: ' + error.message },
      { status: 500 }
    );
  }
}

