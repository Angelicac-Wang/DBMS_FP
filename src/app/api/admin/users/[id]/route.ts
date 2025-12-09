import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 獲取使用者基本資料
    const userResult = await pool.query(
      'SELECT * FROM users WHERE u_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // 獲取發起的專案
    const createdProjectsResult = await pool.query(
      'SELECT p_id, porject_title, status, create_at FROM project WHERE creator_id = $1 ORDER BY create_at DESC',
      [userId]
    );

    // 獲取參與的專案
    const participatedProjectsResult = await pool.query(
      `SELECT p.p_id, p.porject_title, pm.target_seq, pm.join_date
       FROM project_members pm
       JOIN project p ON pm.p_id = p.p_id
       WHERE pm.member_id = $1 AND pm.status = 'Y'
       ORDER BY pm.join_date DESC`,
      [userId]
    );

    // 獲取作品集
    const portfoliosResult = await pool.query(
      `SELECT 
        p.video_url,
        p.title,
        p.discription,
        vd.cover_song_id,
        vd.created_at,
        vd.view_cnt
       FROM portfolios p
       LEFT JOIN video_detail vd ON p.video_url = vd.video_url
       WHERE p.u_id = $1
       ORDER BY vd.created_at DESC NULLS LAST`,
      [userId]
    );

    // 獲取技能
    const skillsResult = await pool.query(
      'SELECT skill_type, proficiency_level, years_of_experience as experience_years FROM user_skills WHERE u_id = $1',
      [userId]
    );

    // 獲取社群連結
    const socialLinksResult = await pool.query(
      'SELECT platform, url, follower_cnt as follower_count FROM user_social_link WHERE u_id = $1',
      [userId]
    );

    // 獲取申請記錄
    const applicationsResult = await pool.query(
      `SELECT appli_id as application_id, pa.p_id, p.porject_title, pa.target_seq, pa.status, pa.applied_time
       FROM project_applications pa
       JOIN project p ON pa.p_id = p.p_id
       WHERE pa.applicant_id = $1
       ORDER BY pa.applied_time DESC`,
      [userId]
    );

    return NextResponse.json({
      user,
      createdProjects: createdProjectsResult.rows,
      participatedProjects: participatedProjectsResult.rows,
      portfolios: portfoliosResult.rows,
      skills: skillsResult.rows,
      socialLinks: socialLinksResult.rows,
      applications: applicationsResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user: ' + error.message },
      { status: 500 }
    );
  }
}



