import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 獲取用戶基本資料
    const userResult = await pool.query(
      `SELECT
        u_id,
        name,
        email,
        birthdate,
        gender,
        region,
        phone,
        create_at,
        last_login
       FROM users
       WHERE u_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];

    // 獲取用戶技能
    const skillsResult = await pool.query(
      `SELECT
        skill_type,
        proficiency_level,
        years_of_experience,
        discription
       FROM user_skills
       WHERE u_id = $1
       ORDER BY proficiency_level DESC
       LIMIT 3`,
      [userId]
    );

    // 獲取用戶作品集
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

    // 獲取用戶社群連結
    const socialLinksResult = await pool.query(
      `SELECT
        url,
        platform,
        follower_cnt
       FROM user_social_link
       WHERE u_id = $1
       ORDER BY follower_cnt DESC`,
      [userId]
    );

    return NextResponse.json({
      ...userData,
      skills: skillsResult.rows,
      portfolios: portfoliosResult.rows,
      socialLinks: socialLinksResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { name, region, skills, socialLinks } = await request.json();

    // 更新基本資料
    if (name !== undefined || region !== undefined) {
      await pool.query(
        'UPDATE users SET name = COALESCE($1, name), region = COALESCE($2, region) WHERE u_id = $3',
        [name || null, region || null, userId]
      );
    }

    // 更新技能（先刪除再插入）
    await pool.query('DELETE FROM user_skills WHERE u_id = $1', [userId]);
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        await pool.query(
          `INSERT INTO user_skills (u_id, skill_type, proficiency_level, years_of_experience, discription)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, skill.skill_type, skill.proficiency_level, skill.years_of_experience, skill.discription || null]
        );
      }
    }

    // 更新社群連結（先刪除再插入）
    await pool.query('DELETE FROM user_social_link WHERE u_id = $1', [userId]);
    if (socialLinks && socialLinks.length > 0) {
      for (const link of socialLinks) {
        await pool.query(
          `INSERT INTO user_social_link (u_id, url, platform, follower_cnt)
           VALUES ($1, $2, $3, $4)`,
          [userId, link.url, link.platform, link.follower_cnt || 0]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile: ' + error.message },
      { status: 500 }
    );
  }
}
