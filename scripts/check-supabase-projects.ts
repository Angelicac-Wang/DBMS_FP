import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('錯誤：找不到 Supabase 環境變數');
  console.error('請確認 .env.local 檔案中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProjectCount() {
  try {
    console.log('正在查詢 Supabase 中的專案數量...\n');

    // 查詢總專案數
    const { count: totalCount, error: totalError } = await supabase
      .from('project')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('查詢總專案數失敗:', totalError);
      return;
    }

    // 查詢活躍專案數（狀態為 A）
    const { count: activeCount, error: activeError } = await supabase
      .from('project')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'A');

    if (activeError) {
      console.error('查詢活躍專案數失敗:', activeError);
      return;
    }

    // 查詢各狀態的專案數（使用 count 查詢每個狀態）
    const statusCounts: Record<string, number> = {};
    const statuses = ['A', 'F', 'C', 'X']; // 可能的狀態值
    
    for (const status of statuses) {
      const { count, error } = await supabase
        .from('project')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      if (!error && count !== null) {
        statusCounts[status] = count;
      }
    }
    
    // 查詢 NULL 狀態
    const { count: nullCount, error: nullError } = await supabase
      .from('project')
      .select('*', { count: 'exact', head: true })
      .is('status', null);
    
    if (!nullError && nullCount !== null && nullCount > 0) {
      statusCounts['NULL'] = nullCount;
    }

    console.log('=== Supabase 專案統計 ===');
    console.log(`總專案數: ${totalCount || 0}`);
    console.log(`活躍專案數 (status='A'): ${activeCount || 0}`);
    console.log('\n各狀態專案數:');
    Object.entries(statusCounts)
      .sort(([a], [b]) => (a || '').localeCompare(b || ''))
      .forEach(([status, count]) => {
        console.log(`  ${status || 'NULL'}: ${count}`);
      });
    console.log('\n=== 查詢完成 ===');
  } catch (error) {
    console.error('發生錯誤:', error);
  }
}

checkProjectCount().catch(console.error);

