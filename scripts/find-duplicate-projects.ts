import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('錯誤：找不到 Supabase 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findDuplicates() {
  console.log('正在查找重複的專案 p_id...\n');

  // 獲取所有記錄
  const allProjects: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('project')
      .select('p_id, porject_title, status, create_at, creator_id')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error('獲取資料失敗:', error);
      break;
    }

    if (data && data.length > 0) {
      allProjects.push(...data);
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`總共獲取 ${allProjects.length} 筆記錄\n`);

  // 找出重複的 p_id
  const idCounts: Record<string, number> = {};
  const idRecords: Record<string, any[]> = {};

  allProjects.forEach((project: any) => {
    const pId = String(project.p_id);
    idCounts[pId] = (idCounts[pId] || 0) + 1;
    if (!idRecords[pId]) {
      idRecords[pId] = [];
    }
    idRecords[pId].push(project);
  });

  // 找出有重複的 p_id
  const duplicates: string[] = [];
  Object.entries(idCounts).forEach(([pId, count]) => {
    if (count > 1) {
      duplicates.push(pId);
    }
  });

  console.log(`發現 ${duplicates.length} 個重複的 p_id\n`);

  // 顯示重複的詳細資訊
  if (duplicates.length > 0) {
    console.log('重複的專案詳情：\n');
    duplicates.slice(0, 20).forEach((pId) => {
      const records = idRecords[pId];
      console.log(`p_id: ${pId} (重複 ${records.length} 次)`);
      records.forEach((record, index) => {
        console.log(`  [${index + 1}] 標題: ${record.porject_title}, 狀態: ${record.status}, 創建時間: ${record.create_at}`);
      });
      console.log('');
    });

    if (duplicates.length > 20) {
      console.log(`... 還有 ${duplicates.length - 20} 個重複的 p_id\n`);
    }

    // 統計重複次數分布
    const duplicateCounts: Record<number, number> = {};
    duplicates.forEach((pId) => {
      const count = idCounts[pId];
      duplicateCounts[count] = (duplicateCounts[count] || 0) + 1;
    });

    console.log('重複次數分布：');
    Object.entries(duplicateCounts)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .forEach(([count, num]) => {
        console.log(`  重複 ${count} 次: ${num} 個 p_id`);
      });
  }

  console.log(`\n總結：`);
  console.log(`  總記錄數: ${allProjects.length}`);
  console.log(`  唯一 p_id 數: ${Object.keys(idCounts).length}`);
  console.log(`  重複記錄數: ${allProjects.length - Object.keys(idCounts).length}`);
  console.log(`  有重複的 p_id 數: ${duplicates.length}`);
}

findDuplicates().catch(console.error);

