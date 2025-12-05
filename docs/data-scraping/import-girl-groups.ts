// 從 girl-groups-batch1.json 導入女團資料到資料庫
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 讀取環境變數
// 嘗試從 .env.local 文件讀取（如果存在）
try {
  const dotenv = require('dotenv');
  // 從腳本所在位置向上兩層找到專案根目錄的 .env.local
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn('載入 .env.local 時發生錯誤:', result.error.message);
    } else {
      console.log('✅ 已載入 .env.local 文件:', envPath);
    }
  } else {
    console.warn('⚠️  未找到 .env.local 文件，嘗試使用環境變數');
    console.warn('預期路徑:', envPath);
  }
} catch (e: any) {
  // dotenv 可能未安裝，繼續使用環境變數
  console.warn('⚠️  dotenv 未安裝或載入失敗，使用環境變數:', e.message);
}

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// 驗證環境變數
if (!supabaseUrl || !supabaseKey) {
  console.error('錯誤：請設置 SUPABASE_URL 和 SUPABASE_KEY 環境變數');
  console.error('可以在 .env.local 文件中設置，或使用環境變數');
  console.error('例如：NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
  process.exit(1);
}

// 清理 URL：移除可能的 "export" 後綴和其他多餘字符
supabaseUrl = supabaseUrl.trim();
// 移除末尾的 "export"（可能是環境變數設置錯誤）
if (supabaseUrl.endsWith('export')) {
  supabaseUrl = supabaseUrl.slice(0, -6);
}
// 移除末尾的空白字符
supabaseUrl = supabaseUrl.replace(/\s+$/, '');

// 檢查 URL 格式
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('錯誤：SUPABASE_URL 格式不正確，應該以 http:// 或 https:// 開頭');
  console.error(`當前值: ${supabaseUrl}`);
  console.error('正確格式範例: https://xxx.supabase.co');
  process.exit(1);
}

console.log(`使用 Supabase URL: ${supabaseUrl.substring(0, 50)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// 獲取下一個 group_id（從 4 開始遞增）
let currentGroupId = BigInt(3); // 從 3 開始，下一個會是 4

async function getNextGroupId(): Promise<bigint> {
  // 查詢資料庫中最大的 group_id
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id')
    .order('group_id', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('無法查詢最大 group_id，使用預設值:', error.message);
    // 如果查詢失敗，使用當前值
    const minId = BigInt(3);
    currentGroupId = currentGroupId >= minId ? currentGroupId : minId;
  } else if (data && data.length > 0) {
    // 如果資料庫中有資料，使用最大值和 3 中的較大者
    const maxId = BigInt(data[0].group_id);
    const minId = BigInt(3);
    currentGroupId = maxId >= minId ? maxId : minId;
  } else {
    // 如果資料庫是空的，從 3 開始（下一個會是 4）
    currentGroupId = BigInt(3);
  }

  // 遞增並返回
  currentGroupId = currentGroupId + BigInt(1);
  return currentGroupId;
}

// 檢查團體是否已存在
async function groupExists(groupName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id')
    .eq('group_name', groupName)
    .limit(1);

  if (error) {
    console.error(`檢查團體 "${groupName}" 時發生錯誤:`, error);
    return false;
  }

  return (data && data.length > 0);
}

// 插入團體資料
async function insertGroup(groupData: {
  group_id: bigint;
  group_name: string;
  group_namekr?: string;
  debut_date: string;
  company: string;
  group_type: string;
  member_count: number;
  logo_image?: string;
  discription?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('kpop_groups')
    .insert({
      group_id: groupData.group_id.toString(),
      group_name: groupData.group_name,
      group_namekr: groupData.group_namekr || null,
      debut_date: groupData.debut_date,
      company: groupData.company || 'Unknown',
      group_type: groupData.group_type,
      member_count: groupData.member_count,
      logo_image: groupData.logo_image || null,
      discription: groupData.discription || null,
    });

  if (error) {
    console.error(`插入團體 "${groupData.group_name}" 時發生錯誤:`, error);
    return false;
  }

  return true;
}

// 主函數
async function main() {
  console.log('開始導入女團資料...\n');

    // 讀取 JSON 文件
  // 使用相對於腳本文件的路徑
  const jsonPath = path.join(__dirname, 'girl-groups-batch1.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`錯誤：找不到文件 ${jsonPath}`);
    process.exit(1);
  }
  
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // 遍歷每個團體
  for (const [key, value] of Object.entries(jsonData)) {
    try {
      // 提取 group_name（去掉 " MEMBERS"）
      if (!key.endsWith(' MEMBERS')) {
        console.warn(`警告：跳過不符合格式的 key: ${key}`);
        continue;
      }

      const groupName = key.replace(' MEMBERS', '');
      const groupData = value as any;

      // 檢查是否已存在
      const exists = await groupExists(groupName);
      if (exists) {
        console.log(`⏭️  跳過（已存在）: ${groupName}`);
        skipCount++;
        continue;
      }

      // 準備插入資料（排除 members）
      // 處理 group_name 長度限制（VARCHAR(20)）
      let finalGroupName = groupName;
      if (finalGroupName.length > 20) {
        console.warn(`警告：團體名稱 "${groupName}" 超過 20 字元，將截斷`);
        finalGroupName = finalGroupName.substring(0, 20);
      }

      // 處理 company 長度限制（VARCHAR(20)）
      let company = groupData.company || 'Unknown';
      if (company.length > 20) {
        company = company.substring(0, 20);
      }

      // 處理 group_namekr 長度限制（VARCHAR(20)）
      let groupNamekr = groupData.group_namekr;
      if (groupNamekr && groupNamekr.length > 20) {
        groupNamekr = groupNamekr.substring(0, 20);
      }

      // 處理 logo_image 長度限制（VARCHAR(100)）
      let logoImage = groupData.logo_image;
      if (logoImage && logoImage.length > 100) {
        logoImage = logoImage.substring(0, 100);
      }

      // 獲取下一個 group_id（從 4 開始遞增）
      const nextGroupId = await getNextGroupId();

      const insertData = {
        group_id: nextGroupId,
        group_name: finalGroupName,
        group_namekr: groupNamekr || null,
        debut_date: groupData.debut_date,
        company: company,
        group_type: groupData.group_type || 'G',
        member_count: groupData.member_count || 0,
        logo_image: logoImage || null,
        discription: groupData.discription || null,
      };

      // 驗證必要欄位
      if (!insertData.debut_date) {
        console.warn(`警告：團體 "${groupName}" 缺少 debut_date，跳過`);
        errorCount++;
        errors.push(`${groupName}: 缺少 debut_date`);
        continue;
      }

      // 插入資料
      const success = await insertGroup(insertData);
      if (success) {
        console.log(`✅ 成功插入: ${groupName} (ID: ${insertData.group_id})`);
        successCount++;
      } else {
        errorCount++;
        errors.push(`${groupName}: 插入失敗`);
      }

      // 避免請求過快
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`處理團體 "${key}" 時發生錯誤:`, error.message);
      errorCount++;
      errors.push(`${key}: ${error.message}`);
    }
  }

  // 輸出統計
  console.log('\n=== 導入完成 ===');
  console.log(`✅ 成功插入: ${successCount} 筆`);
  console.log(`⏭️  跳過（已存在）: ${skipCount} 筆`);
  console.log(`❌ 錯誤: ${errorCount} 筆`);

  if (errors.length > 0) {
    console.log('\n錯誤詳情:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
}

// 執行
main().catch(console.error);
