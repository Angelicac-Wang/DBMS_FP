import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import pool from '../src/lib/db';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('錯誤：找不到 Supabase 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getSupabaseProjectIds(): Promise<Set<number>> {
  console.log('正在從 Supabase 獲取所有唯一專案 ID...');
  const ids = new Set<number>();
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  const seenIds = new Map<number, any>(); // 用於處理重複，保留最新的記錄

  while (hasMore) {
    const { data, error } = await supabase
      .from('project')
      .select('p_id, create_at, update_at')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('獲取 Supabase 專案 ID 失敗:', error);
      break;
    }

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        const pId = parseInt(row.p_id);
        if (!seenIds.has(pId)) {
          seenIds.set(pId, row);
          ids.add(pId);
        } else {
          // 如果有重複，保留更新時間較新的記錄
          const existing = seenIds.get(pId);
          const existingTime = new Date(existing.update_at || existing.create_at).getTime();
          const newTime = new Date(row.update_at || row.create_at).getTime();
          if (newTime > existingTime) {
            seenIds.set(pId, row);
          }
        }
      });
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`✓ Supabase 共有 ${ids.size} 個唯一專案（總記錄數可能更多，但已去重）`);
  return ids;
}

async function getPostgresProjectIds(): Promise<Set<number>> {
  console.log('正在從 PostgreSQL 獲取所有專案 ID...');
  const result = await pool.query('SELECT p_id FROM project');
  const ids = new Set<number>();
  result.rows.forEach((row: any) => {
    ids.add(parseInt(row.p_id));
  });
  console.log(`✓ PostgreSQL 共有 ${ids.size} 個專案`);
  return ids;
}

async function getMissingProjectIds(): Promise<number[]> {
  const supabaseIds = await getSupabaseProjectIds();
  const postgresIds = await getPostgresProjectIds();

  const missing: number[] = [];
  supabaseIds.forEach(id => {
    if (!postgresIds.has(id)) {
      missing.push(id);
    }
  });

  console.log(`\n發現 ${missing.length} 個缺失的專案`);
  return missing;
}

async function fetchProjectFromSupabase(pId: number): Promise<any> {
  const { data, error } = await supabase
    .from('project')
    .select('*')
    .eq('p_id', pId)
    .single();

  if (error) {
    console.error(`獲取專案 ${pId} 失敗:`, error);
    return null;
  }

  return data;
}

async function fetchRelatedDataFromSupabase(pId: number) {
  // 獲取練習時間表
  const { data: schedules } = await supabase
    .from('practice_schedule')
    .select('*')
    .eq('p_id', pId);

  // 獲取專案目標位置
  const { data: targets } = await supabase
    .from('project_target')
    .select('*')
    .eq('project_id', pId);

  // 獲取專案成員
  const { data: members } = await supabase
    .from('project_members')
    .select('*')
    .eq('p_id', pId);

  return {
    schedules: schedules || [],
    targets: targets || [],
    members: members || [],
  };
}

async function insertProjectToPostgres(project: any, relatedData: any) {
  try {
    // 檢查是否已存在（因為可能沒有主鍵約束）
    const existingCheck = await pool.query(
      'SELECT p_id FROM project WHERE p_id = $1',
      [project.p_id]
    );

    if (existingCheck.rows.length > 0) {
      console.log(`  專案 ${project.p_id} 已存在，跳過`);
      return true;
    }

    // 插入專案
    await pool.query(
      `INSERT INTO project (
        p_id, porject_title, practice_location, status, target_cnt,
        creator_id, create_at, update_at, description, song_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        project.p_id,
        project.porject_title,
        project.practice_location,
        project.status,
        project.target_cnt,
        project.creator_id,
        project.create_at,
        project.update_at || project.create_at,
        project.description || null,
        project.song_id || null,
      ]
    );

    // 插入練習時間表
    for (const schedule of relatedData.schedules) {
      await pool.query(
        `INSERT INTO practice_schedule (p_id, date, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (p_id, date, start_time) DO NOTHING`,
        [schedule.p_id, schedule.date, schedule.start_time, schedule.end_time]
      );
    }

    // 插入專案目標位置
    for (const target of relatedData.targets) {
      await pool.query(
        `INSERT INTO project_target (project_id, target_seq, idol_id, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id, target_seq) DO NOTHING`,
        [target.project_id, target.target_seq, target.idol_id || null, target.status]
      );
    }

    // 插入專案成員
    for (const member of relatedData.members) {
      await pool.query(
        `INSERT INTO project_members (p_id, member_id, join_date, target_seq, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (p_id, member_id) DO NOTHING`,
        [member.p_id, member.member_id, member.join_date, member.target_seq, member.status]
      );
    }

    return true;
  } catch (error: any) {
    console.error(`插入專案 ${project.p_id} 失敗:`, error.message);
    return false;
  }
}

async function migrateMissingProjects() {
  try {
    console.log('開始檢查並遷移缺失的專案...\n');

    const missingIds = await getMissingProjectIds();

    if (missingIds.length === 0) {
      console.log('\n✓ 所有專案都已遷移，無需補齊');
      return;
    }

    console.log(`\n開始遷移 ${missingIds.length} 個缺失的專案...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < missingIds.length; i++) {
      const pId = missingIds[i];
      console.log(`[${i + 1}/${missingIds.length}] 正在遷移專案 ${pId}...`);

      // 獲取專案資料
      const project = await fetchProjectFromSupabase(pId);
      if (!project) {
        console.log(`  ✗ 無法獲取專案 ${pId} 的資料`);
        failCount++;
        continue;
      }

      // 獲取相關資料
      const relatedData = await fetchRelatedDataFromSupabase(pId);

      // 插入到 PostgreSQL
      const success = await insertProjectToPostgres(project, relatedData);
      if (success) {
        console.log(`  ✓ 專案 ${pId} 遷移成功`);
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n=== 遷移完成 ===');
    console.log(`成功: ${successCount} 個專案`);
    console.log(`失敗: ${failCount} 個專案`);
    console.log(`總計: ${missingIds.length} 個專案`);

    // 驗證最終數量
    console.log('\n驗證最終數量...');
    const finalSupabaseIds = await getSupabaseProjectIds();
    const finalPostgresIds = await getPostgresProjectIds();
    const finalMissing = Array.from(finalSupabaseIds).filter(id => !finalPostgresIds.has(id));
    
    if (finalMissing.length === 0) {
      console.log('✓ 所有專案已成功遷移！');
    } else {
      console.log(`⚠ 仍有 ${finalMissing.length} 個專案未遷移`);
    }

  } catch (error) {
    console.error('遷移過程中發生錯誤:', error);
  } finally {
    await pool.end();
  }
}

migrateMissingProjects().catch(console.error);

