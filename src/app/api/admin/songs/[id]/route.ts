import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: songId } = await params;

    const query = `
      SELECT
        song_id, title, title_kr, release_date, duration,
        spotify_url, youtube_original_url
      FROM kpop_songs
      WHERE song_id = $1
    `;

    const result = await pool.query(query, [songId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    const song = result.rows[0];

    // Fetch related groups
    const groupsResult = await pool.query(
      `SELECT group_id FROM song_group WHERE song_id = $1`,
      [songId]
    );
    song.groups = groupsResult.rows.map(row => row.group_id);

    // Fetch related idols
    const idolsResult = await pool.query(
      `SELECT idol_id FROM song_idol WHERE song_id = $1`,
      [songId]
    );
    song.idols = idolsResult.rows.map(row => row.idol_id);

    return NextResponse.json(song);
  } catch (error: any) {
    console.error('Error fetching song:', error);
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  try {
    const { id: songId } = await params;
    const body = await request.json();
    const {
      title,
      title_kr,
      release_date,
      duration,
      spotify_url,
      youtube_original_url,
      groups,
      idols,
    } = body;

    await client.query('BEGIN');

    // Update song
    await client.query(
      `UPDATE kpop_songs
       SET title = $1, title_kr = $2, release_date = $3, duration = $4,
           spotify_url = $5, youtube_original_url = $6
       WHERE song_id = $7`,
      [
        title,
        title_kr,
        release_date,
        parseInt(duration),
        spotify_url || null,
        youtube_original_url,
        songId,
      ]
    );

    // Update group relations
    await client.query('DELETE FROM song_group WHERE song_id = $1', [songId]);
    if (groups && groups.length > 0) {
      for (const groupId of groups) {
        await client.query(
          'INSERT INTO song_group (song_id, group_id) VALUES ($1, $2)',
          [songId, groupId]
        );
      }
    }

    // Update idol relations
    await client.query('DELETE FROM song_idol WHERE song_id = $1', [songId]);
    if (idols && idols.length > 0) {
      for (const idolId of idols) {
        await client.query(
          'INSERT INTO song_idol (song_id, idol_id) VALUES ($1, $2)',
          [songId, idolId]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating song:', error);
    return NextResponse.json(
      { error: 'Failed to update song: ' + error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: songId } = await params;

    // Check if song has related projects
    const projectCheck = await pool.query(
      'SELECT p_id FROM project WHERE song_id = $1 LIMIT 1',
      [songId]
    );

    if (projectCheck.rows.length > 0) {
      return NextResponse.json(
        { error: '無法刪除：此歌曲有關聯的專案，請先處理相關專案。' },
        { status: 400 }
      );
    }

    // Delete song (cascade will handle song_group and song_idol)
    await pool.query('DELETE FROM kpop_songs WHERE song_id = $1', [songId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song: ' + error.message },
      { status: 500 }
    );
  }
}
