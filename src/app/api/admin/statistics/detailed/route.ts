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

    // 活躍專案數
    const activeProjectsResult = await pool.query(
      "SELECT COUNT(*) as count FROM project WHERE status = 'A'"
    );
    const activeProjects = parseInt(activeProjectsResult.rows[0].count);

    // 已完成專案數
    const completedProjectsResult = await pool.query(
      "SELECT COUNT(*) as count FROM project WHERE status = 'F'"
    );
    const completedProjects = parseInt(completedProjectsResult.rows[0].count);

    // 各狀態專案數量
    const statusResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM project GROUP BY status'
    );
    const statusDistribution = statusResult.rows.map((row: any) => ({
      status: row.status,
      count: parseInt(row.count),
    }));

    // 地區分布
    const regionResult = await pool.query(
      'SELECT COALESCE(region, \'未知\') as region, COUNT(*) as count FROM users GROUP BY region'
    );
    const regionDistribution = regionResult.rows.map((row: any) => ({
      region: row.region,
      count: parseInt(row.count),
    }));

    // 性別分布
    const genderResult = await pool.query(
      'SELECT gender, COUNT(*) as count FROM users WHERE gender IS NOT NULL GROUP BY gender'
    );
    const genderDistribution = genderResult.rows.map((row: any) => ({
      gender: row.gender,
      count: parseInt(row.count),
    }));

    // 最熱門歌曲
    const topSongsResult = await pool.query(
      `SELECT p.song_id, s.title, COUNT(*) as count
       FROM project p
       JOIN kpop_songs s ON p.song_id = s.song_id
       WHERE p.song_id IS NOT NULL
       GROUP BY p.song_id, s.title
       ORDER BY count DESC
       LIMIT 10`
    );
    const topSongs = topSongsResult.rows.map((row: any) => ({
      song_id: row.song_id,
      title: row.title,
      count: parseInt(row.count),
    }));

    // 專案規模分布
    const sizeResult = await pool.query(
      'SELECT target_cnt as size, COUNT(*) as count FROM project GROUP BY target_cnt ORDER BY target_cnt'
    );
    const sizeDistribution = sizeResult.rows.map((row: any) => ({
      size: row.size,
      count: parseInt(row.count),
    }));

    // 完成率（已完成專案 / 總專案數）
    const completionRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      statusDistribution,
      regionDistribution,
      genderDistribution,
      topSongs,
      sizeDistribution,
      completionRate,
    });
  } catch (error: any) {
    console.error('Error fetching detailed statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics: ' + error.message },
      { status: 500 }
    );
  }
}




