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

interface ProjectRecord {
  p_id: number;
  porject_title: string;
  practice_location: string;
  status: string;
  target_cnt: number;
  creator_id: number;
  create_at: string;
  update_at?: string;
  description?: string;
  song_id?: number;
  original_p_id?: number; // 用於追蹤原始 ID（如果有重複）
}

async function fetchAllProjectsFromSupabase(): Promise<ProjectRecord[]> {
  console.log('正在從 Supabase 獲取所有專案...');
  const allProjects: ProjectRecord[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  let batchCount = 0;

  while (hasMore) {
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .order('create_at', { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`批次 ${batchCount + 1} 錯誤:`, error);
      break;
    }

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        allProjects.push({
          p_id: parseInt(row.p_id),
          porject_title: row.porject_title,
          practice_location: row.practice_location,
          status: row.status,
          target_cnt: row.target_cnt,
          creator_id: parseInt(row.creator_id),
          create_at: row.create_at,
          update_at: row.update_at,
          description: row.description,
          song_id: row.song_id ? parseInt(row.song_id) : undefined,
          original_p_id: parseInt(row.p_id), // 保存原始 ID
        });
      });
      batchCount++;
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
      console.log(`  已獲取 ${allProjects.length} 筆記錄...`);
    } else {
      hasMore = false;
    }
  }

  console.log(`✓ 總共獲取 ${allProjects.length} 筆專案記錄\n`);
  return allProjects;
}

function handleDuplicateIds(projects: ProjectRecord[]): ProjectRecord[] {
  console.log('正在處理重複的 p_id...');
  
  const idMap = new Map<number, ProjectRecord[]>();
  
  // 按 p_id 分組
  projects.forEach(project => {
    if (!idMap.has(project.p_id)) {
      idMap.set(project.p_id, []);
    }
    idMap.get(project.p_id)!.push(project);
  });

  // 找出重複的 ID
  const duplicates: number[] = [];
  idMap.forEach((records, pId) => {
    if (records.length > 1) {
      duplicates.push(pId);
    }
  });

  if (duplicates.length === 0) {
    console.log('✓ 沒有發現重複的 p_id\n');
    return projects;
  }

  console.log(`發現 ${duplicates.length} 個重複的 p_id，正在處理...`);

  const processedProjects: ProjectRecord[] = [];
  let newIdCounter = Date.now() * 10000; // 使用時間戳生成新 ID

  idMap.forEach((records, pId) => {
    if (records.length === 1) {
      // 沒有重複，直接使用
      processedProjects.push(records[0]);
    } else {
      // 有重複，保留第一個（最早的），其他的分配新 ID
      console.log(`  p_id ${pId} 有 ${records.length} 個重複記錄`);
      
      // 按創建時間排序，保留最早的
      records.sort((a, b) => 
        new Date(a.create_at).getTime() - new Date(b.create_at).getTime()
      );

      // 第一個保留原 ID
      processedProjects.push(records[0]);
      console.log(`    保留: ${records[0].porject_title} (原 ID: ${pId})`);

      // 其他的分配新 ID
      for (let i = 1; i < records.length; i++) {
        let newId = newIdCounter++;
        // 確保新 ID 不與現有 ID 衝突
        while (idMap.has(newId) || processedProjects.some(p => p.p_id === newId)) {
          newId = newIdCounter++;
        }
        
        const newProject = {
          ...records[i],
          p_id: newId,
          original_p_id: pId, // 記錄原始 ID
        };
        processedProjects.push(newProject);
        console.log(`    新 ID: ${newId} - ${records[i].porject_title} (原 ID: ${pId})`);
      }
    }
  });

  console.log(`✓ 處理完成，共 ${processedProjects.length} 個唯一專案\n`);
  return processedProjects;
}

async function fetchRelatedData(pId: number, originalPId?: number): Promise<any> {
  // 使用原始 ID 查詢相關資料（因為相關表可能還在使用原始 ID）
  const queryId = originalPId || pId;

  try {
    const [schedulesResult, targetsResult, membersResult] = await Promise.all([
      supabase.from('practice_schedule').select('*').eq('p_id', queryId),
      supabase.from('project_target').select('*').eq('project_id', queryId),
      supabase.from('project_members').select('*').eq('p_id', queryId),
    ]);

    return {
      schedules: schedulesResult.data || [],
      targets: targetsResult.data || [],
      members: membersResult.data || [],
    };
  } catch (error) {
    console.error(`  獲取相關資料失敗 (p_id: ${queryId}):`, error);
    return {
      schedules: [],
      targets: [],
      members: [],
    };
  }
}

async function insertProjectWithRelatedData(
  project: ProjectRecord,
  relatedData: any
): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 檢查是否已存在
    const existingCheck = await client.query(
      'SELECT p_id FROM project WHERE p_id = $1',
      [project.p_id]
    );

    if (existingCheck.rows.length > 0) {
      console.log(`  專案 ${project.p_id} 已存在，跳過`);
      await client.query('ROLLBACK');
      return true;
    }

    // 插入專案
    await client.query(
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

    // 插入練習時間表（使用新的 p_id）
    for (const schedule of relatedData.schedules) {
      await client.query(
        `INSERT INTO practice_schedule (p_id, date, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (p_id, date, start_time) DO NOTHING`,
        [project.p_id, schedule.date, schedule.start_time, schedule.end_time]
      );
    }

    // 插入專案目標位置（使用新的 p_id）
    for (const target of relatedData.targets) {
      await client.query(
        `INSERT INTO project_target (project_id, target_seq, idol_id, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id, target_seq) DO NOTHING`,
        [project.p_id, target.target_seq, target.idol_id || null, target.status]
      );
    }

    // 插入專案成員（使用新的 p_id）
    for (const member of relatedData.members) {
      await client.query(
        `INSERT INTO project_members (p_id, member_id, join_date, target_seq, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (p_id, member_id) DO NOTHING`,
        [project.p_id, member.member_id, member.join_date, member.target_seq, member.status]
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(`  插入專案 ${project.p_id} 失敗:`, error.message);
    return false;
  } finally {
    client.release();
  }
}

async function reimportProjects() {
  try {
    console.log('開始從 Supabase 重新匯入專案資料...\n');

    // 1. 獲取所有專案
    const allProjects = await fetchAllProjectsFromSupabase();

    // 2. 處理重複的 ID
    const processedProjects = handleDuplicateIds(allProjects);

    // 3. 清空現有的專案資料（可選，如果需要完全重新匯入）
    console.log('是否要清空現有的專案資料？');
    console.log('（此操作將刪除 PostgreSQL 中所有現有的專案資料）');
    console.log('跳過此步驟，直接開始匯入...\n');

    // 4. 匯入專案
    console.log(`開始匯入 ${processedProjects.length} 個專案...\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (let i = 0; i < processedProjects.length; i++) {
      const project = processedProjects[i];
      const progress = `[${i + 1}/${processedProjects.length}]`;
      
      console.log(`${progress} 正在匯入專案 ${project.p_id}: ${project.porject_title}`);

      // 獲取相關資料
      const relatedData = await fetchRelatedData(project.p_id, project.original_p_id);

      // 插入資料
      const success = await insertProjectWithRelatedData(project, relatedData);
      
      if (success) {
        // 檢查是否是跳過的（已存在）
        const check = await pool.query('SELECT p_id FROM project WHERE p_id = $1', [project.p_id]);
        if (check.rows.length > 0 && i > 0) {
          // 可能是已存在的
          const existing = await pool.query(
            'SELECT porject_title FROM project WHERE p_id = $1',
            [project.p_id]
          );
          if (existing.rows.length > 0 && existing.rows[0].porject_title === project.porject_title) {
            skipCount++;
            console.log(`  ✓ 已存在，跳過`);
          } else {
            successCount++;
            console.log(`  ✓ 匯入成功`);
          }
        } else {
          successCount++;
          console.log(`  ✓ 匯入成功`);
        }
      } else {
        failCount++;
      }

      // 每 100 個專案顯示一次進度
      if ((i + 1) % 100 === 0) {
        console.log(`\n進度: ${i + 1}/${processedProjects.length} (成功: ${successCount}, 跳過: ${skipCount}, 失敗: ${failCount})\n`);
      }
    }

    console.log('\n=== 匯入完成 ===');
    console.log(`成功: ${successCount} 個專案`);
    console.log(`跳過: ${skipCount} 個專案`);
    console.log(`失敗: ${failCount} 個專案`);
    console.log(`總計: ${processedProjects.length} 個專案`);

    // 驗證最終數量
    console.log('\n驗證最終數量...');
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM project');
    console.log(`PostgreSQL 中現有專案數: ${finalCount.rows[0].count}`);

  } catch (error) {
    console.error('匯入過程中發生錯誤:', error);
  } finally {
    await pool.end();
  }
}

reimportProjects().catch(console.error);

