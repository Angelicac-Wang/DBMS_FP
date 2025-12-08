import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const body = await request.json();

    await pool.query(
      `UPDATE kpop_groups
       SET group_name = $1, group_namekr = $2, debut_date = $3, company = $4,
           group_type = $5, member_count = $6, logo_image = $7, discription = $8
       WHERE group_id = $9`,
      [
        body.group_name,
        body.group_namekr || null,
        body.debut_date,
        body.company,
        body.group_type,
        body.member_count,
        body.logo_image || null,
        body.discription || null,
        groupId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    // 檢查是否有關聯的歌曲
    const songsCheck = await pool.query(
      'SELECT song_id FROM song_group WHERE group_id = $1 LIMIT 1',
      [groupId]
    );

    if (songsCheck.rows.length > 0) {
      return NextResponse.json(
        { error: '無法刪除：此團體有關聯的歌曲，請先刪除相關歌曲。' },
        { status: 400 }
      );
    }

    // 刪除團體
    await pool.query('DELETE FROM kpop_groups WHERE group_id = $1', [groupId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group: ' + error.message },
      { status: 500 }
    );
  }
}

