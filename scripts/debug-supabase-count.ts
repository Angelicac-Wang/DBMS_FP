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

async function debugCount() {
  console.log('正在檢查 Supabase 專案數量差異...\n');

  // 方法1: 使用 count
  const { count: count1, error: error1 } = await supabase
    .from('project')
    .select('*', { count: 'exact', head: true });

  console.log(`方法1 (count, head: true): ${count1 || 0}`);
  if (error1) console.error('錯誤:', error1);

  // 方法2: 使用 count 但不使用 head
  const { count: count2, error: error2 } = await supabase
    .from('project')
    .select('*', { count: 'exact' })
    .limit(0);

  console.log(`方法2 (count, limit 0): ${count2 || 0}`);
  if (error2) console.error('錯誤:', error2);

  // 方法3: 實際 select 所有 p_id
  console.log('\n正在實際 select 所有 p_id...');
  const ids = new Set<number | string>();
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  let batchCount = 0;

  while (hasMore) {
    const { data, error } = await supabase
      .from('project')
      .select('p_id')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`批次 ${batchCount + 1} 錯誤:`, error);
      break;
    }

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        if (row.p_id !== null && row.p_id !== undefined) {
          ids.add(row.p_id);
        }
      });
      batchCount++;
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`方法3 (實際 select): ${ids.size} 個唯一 p_id`);
  console.log(`處理了 ${batchCount} 個批次`);

  // 檢查是否有重複的 p_id
  const allIds: (number | string)[] = [];
  from = 0;
  hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('project')
      .select('p_id')
      .range(from, from + batchSize - 1);

    if (error) break;

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        allIds.push(row.p_id);
      });
      from += batchSize;
      if (data.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  const uniqueIds = new Set(allIds);
  console.log(`\n總記錄數: ${allIds.length}`);
  console.log(`唯一 p_id 數: ${uniqueIds.size}`);
  console.log(`重複記錄數: ${allIds.length - uniqueIds.size}`);

  // 檢查 NULL p_id
  const nullCount = allIds.filter(id => id === null || id === undefined).length;
  console.log(`NULL p_id 數: ${nullCount}`);

  // 檢查是否有權限問題
  console.log('\n檢查權限問題...');
  const { data: sampleData, error: sampleError } = await supabase
    .from('project')
    .select('p_id, porject_title, status')
    .limit(5);

  if (sampleError) {
    console.error('權限錯誤:', sampleError);
  } else {
    console.log('可以正常讀取樣本資料，權限正常');
    console.log('樣本資料:', sampleData);
  }

  // 嘗試使用不同的查詢方式
  console.log('\n嘗試使用不同的查詢方式...');
  
  // 使用 RPC 或直接 SQL（如果可用）
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_project_count');
  if (!rpcError && rpcData) {
    console.log('RPC 結果:', rpcData);
  } else {
    console.log('RPC 不可用或失敗');
  }

  console.log('\n=== 總結 ===');
  console.log(`Count 查詢結果: ${count1 || 0}`);
  console.log(`實際 Select 結果: ${ids.size}`);
  console.log(`差異: ${(count1 || 0) - ids.size}`);
}

debugCount().catch(console.error);

