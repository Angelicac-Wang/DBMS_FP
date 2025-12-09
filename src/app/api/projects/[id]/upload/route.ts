import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { video_url, title, discription, team_members, creator_id, song_id } = await request.json();

    // 檢查 video_url 是否已存在於 video_detail
    const existingVideo = await pool.query(
      'SELECT video_url FROM video_detail WHERE video_url = $1',
      [video_url]
    );

    if (existingVideo.rows.length === 0) {
      // 創建新的 video_detail
      await pool.query(
        `INSERT INTO video_detail (video_url, cover_song_id, created_at, view_cnt)
         VALUES ($1, $2, NOW(), 0)`,
        [video_url, song_id || null]
      );
    }

    // 為每個成員創建作品集項目
    const allMembers = [...team_members];
    if (!allMembers.includes(creator_id.toString())) {
      allMembers.push(creator_id.toString());
    }

    for (const memberId of allMembers) {
      await pool.query(
        `INSERT INTO portfolios (u_id, video_url, title, discription)
         VALUES ($1, $2, $3, $4)`,
        [memberId, video_url, title, discription || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error uploading project video:', error);
    return NextResponse.json(
      { error: 'Failed to upload: ' + error.message },
      { status: 500 }
    );
  }
}



