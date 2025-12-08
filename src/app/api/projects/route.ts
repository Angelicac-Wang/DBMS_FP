import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      creator_id,
      song_id,
      porject_title,
      target_cnt,
      practice_location,
      description,
      schedules,
      practice_schedules,
      targets,
    } = body;

    // Support both 'schedules' and 'practice_schedules' for compatibility
    const finalSchedules = schedules || practice_schedules;

    // 驗證必填欄位
    if (!song_id) {
      return NextResponse.json(
        { error: '翻跳歌曲為必填欄位' },
        { status: 400 }
      );
    }

    // 生成專案 ID
    const generateProjectId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return timestamp * 10000 + random;
    };

    let newProjectId = generateProjectId();

    // 檢查 ID 是否已存在
    let attempts = 0;
    while (attempts < 10) {
      const checkResult = await pool.query(
        'SELECT p_id FROM project WHERE p_id = $1',
        [newProjectId]
      );

      if (checkResult.rows.length === 0) break;
      newProjectId = generateProjectId();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: '系統繁忙，請稍後再試' },
        { status: 500 }
      );
    }

    const now = new Date();

    // 插入專案
    await pool.query(
      `INSERT INTO project (
        p_id, creator_id, song_id, porject_title, target_cnt,
        practice_location, create_at, update_at, status, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newProjectId,
        creator_id,
        song_id,
        porject_title,
        target_cnt,
        practice_location,
        now,
        now,
        'A',
        description || null,
      ]
    );

    // 插入練習時間
    if (finalSchedules && finalSchedules.length > 0) {
      const scheduleValues = finalSchedules
        .map((s: any, idx: number) =>
          `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
        )
        .join(', ');

      const scheduleParams = finalSchedules.flatMap((s: any) => [
        newProjectId,
        s.date,
        s.start_time,
        s.end_time,
      ]);

      await pool.query(
        `INSERT INTO practice_schedule (p_id, date, start_time, end_time)
         VALUES ${scheduleValues}`,
        scheduleParams
      );
    }

    // 插入目標位置
    if (targets && targets.length > 0) {
      const targetValues = targets
        .map((t: any, idx: number) =>
          `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
        )
        .join(', ');

      const targetParams = targets.flatMap((t: any, idx: number) => [
        t.target_seq || idx + 1, // Auto-generate target_seq if not provided
        newProjectId,
        t.idol_id || null,
        t.status || 'I', // Default status to 'I' if not provided
      ]);

      await pool.query(
        `INSERT INTO project_target (target_seq, project_id, idol_id, status)
         VALUES ${targetValues}`,
        targetParams
      );
    }

    return NextResponse.json({ p_id: newProjectId, project_id: newProjectId });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project: ' + error.message },
      { status: 500 }
    );
  }
}
