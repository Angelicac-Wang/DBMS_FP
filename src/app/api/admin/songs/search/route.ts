import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');
    const filterDifficulty = searchParams.get('difficulty');
    const filterGroup = searchParams.get('group');

    let query = `
      SELECT s.*
      FROM kpop_songs s
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // 搜尋
    if (searchQuery) {
      query += ` AND (s.title ILIKE $${paramIndex} OR s.title_kr ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // 篩選難度
    if (filterDifficulty) {
      const level = parseInt(filterDifficulty);
      if (level === 1) {
        query += ` AND s.difficulty_level >= $${paramIndex} AND s.difficulty_level <= $${paramIndex + 1}`;
        params.push(1, 3);
        paramIndex += 2;
      } else if (level === 2) {
        query += ` AND s.difficulty_level >= $${paramIndex} AND s.difficulty_level <= $${paramIndex + 1}`;
        params.push(4, 6);
        paramIndex += 2;
      } else if (level === 3) {
        query += ` AND s.difficulty_level >= $${paramIndex} AND s.difficulty_level <= $${paramIndex + 1}`;
        params.push(7, 10);
        paramIndex += 2;
      }
    }

    query += ` ORDER BY s.title`;

    const songsResult = await pool.query(query, params);
    const songs = songsResult.rows;

    if (songs.length === 0) {
      return NextResponse.json([]);
    }

    // 批量獲取所有歌曲的團體資訊
    const songIds = songs.map(s => s.song_id);

    // 一次性獲取所有 song_group 關聯
    const songGroupsResult = await pool.query(
      'SELECT song_id, group_id FROM song_group WHERE song_id = ANY($1)',
      [songIds]
    );

    // 獲取所有相關的 group_id
    const groupIds = [...new Set(songGroupsResult.rows.map(sg => sg.group_id))];

    // 一次性獲取所有團體名稱
    let groupsMap = new Map<number, string>();
    if (groupIds.length > 0) {
      const groupsResult = await pool.query(
        'SELECT group_id, group_name FROM kpop_groups WHERE group_id = ANY($1)',
        [groupIds]
      );
      groupsMap = new Map(groupsResult.rows.map(g => [g.group_id, g.group_name]));
    }

    // 建立 song_id 到 group_names 的映射
    const songGroupsMap = new Map<number, string[]>();
    songGroupsResult.rows.forEach(sg => {
      const groupName = groupsMap.get(sg.group_id);
      if (groupName) {
        if (!songGroupsMap.has(sg.song_id)) {
          songGroupsMap.set(sg.song_id, []);
        }
        songGroupsMap.get(sg.song_id)!.push(groupName);
      }
    });

    // 組裝最終結果
    let songsWithGroups = songs.map(song => ({
      ...song,
      groups: songGroupsMap.get(song.song_id) || [],
    }));

    // 如果有篩選團體，過濾結果
    if (filterGroup) {
      songsWithGroups = songsWithGroups.filter(song =>
        song.groups?.some(g => g === filterGroup)
      );
    }

    return NextResponse.json(songsWithGroups);
  } catch (error: any) {
    console.error('Error searching songs:', error);
    return NextResponse.json(
      { error: 'Failed to search songs: ' + error.message },
      { status: 500 }
    );
  }
}

