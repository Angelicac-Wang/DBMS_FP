// 從 girl-groups-batch1.json 導入偶像資料到資料庫
// 檢查重複後插入 KPOP_IDOLS，並在 GROUP_IDOL 中建立關聯
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 讀取環境變數
try {
  const dotenv = require('dotenv');
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

// 清理 URL
supabaseUrl = supabaseUrl.trim();
if (supabaseUrl.endsWith('export')) {
  supabaseUrl = supabaseUrl.slice(0, -6);
}
supabaseUrl = supabaseUrl.replace(/\s+$/, '');

if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('錯誤：SUPABASE_URL 格式不正確，應該以 http:// 或 https:// 開頭');
  console.error(`當前值: ${supabaseUrl}`);
  process.exit(1);
}

console.log(`使用 Supabase URL: ${supabaseUrl.substring(0, 50)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成唯一的 idol_id（從 1 開始遞增）
let currentIdolId = BigInt(0);

async function getNextIdolId(): Promise<bigint> {
  const { data, error } = await supabase
    .from('kpop_idols')
    .select('idol_id')
    .order('idol_id', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('無法查詢最大 idol_id，使用預設值:', error.message);
    currentIdolId = currentIdolId >= BigInt(0) ? currentIdolId : BigInt(0);
  } else if (data && data.length > 0) {
    const maxId = BigInt(data[0].idol_id);
    currentIdolId = maxId >= BigInt(0) ? maxId : BigInt(0);
  } else {
    currentIdolId = BigInt(0);
  }

  currentIdolId = currentIdolId + BigInt(1);
  return currentIdolId;
}

// 檢查偶像是否已存在（根據 stage_name, nationality, debut_date）
async function idolExists(
  stageName: string,
  nationality: string | null,
  debutDate: string
): Promise<number | null> {
  // 先查詢所有符合 stage_name 和 debut_date 的記錄
  const { data, error } = await supabase
    .from('kpop_idols')
    .select('idol_id, nationality')
    .eq('stage_name', stageName)
    .eq('debut_date', debutDate);

  if (error) {
    console.error(`檢查偶像 "${stageName}" 時發生錯誤:`, error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // 檢查 nationality 是否匹配（考慮 null 的情況）
  for (const idol of data) {
    const idolNationality = idol.nationality || null;
    if (idolNationality === nationality) {
      return idol.idol_id;
    }
  }

  return null;
}

// 插入偶像資料
async function insertIdol(idolData: {
  idol_id: bigint;
  stage_name: string;
  stage_name_kr: string;
  nationality: string | null;
  debut_date: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('kpop_idols')
    .insert({
      idol_id: idolData.idol_id.toString(),
      stage_name: idolData.stage_name,
      stage_name_kr: idolData.stage_name_kr,
      nationality: idolData.nationality,
      debut_date: idolData.debut_date,
    });

  if (error) {
    console.error(`插入偶像 "${idolData.stage_name}" 時發生錯誤:`, error);
    return false;
  }

  return true;
}

// 根據團體名稱查找 group_id
async function findGroupId(groupName: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id')
    .eq('group_name', groupName)
    .limit(1)
    .single();

  if (error) {
    console.warn(`找不到團體 "${groupName}":`, error.message);
    return null;
  }

  return data?.group_id || null;
}

// 在 GROUP_IDOL 表中建立關聯
async function linkIdolToGroup(groupId: number, idolId: number): Promise<boolean> {
  const { error } = await supabase
    .from('group_idol')
    .insert({
      group_id: groupId,
      idol_id: idolId,
    });

  if (error) {
    // 如果已存在，忽略錯誤
    if (error.code === '23505') {
      // Unique violation - 已存在，這是正常的
      return true;
    }
    console.error(`建立關聯失敗 (group_id: ${groupId}, idol_id: ${idolId}):`, error);
    return false;
  }

  return true;
}

// 主函數
async function main() {
  console.log('開始導入偶像資料...\n');

  // 讀取 JSON 文件
  const jsonPath = path.join(__dirname, 'girl-groups-batch1.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`錯誤：找不到文件 ${jsonPath}`);
    process.exit(1);
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  let linkSuccessCount = 0;
  let linkSkipCount = 0;
  const errors: string[] = [];

  // 遍歷每個團體
  for (const [key, value] of Object.entries(jsonData)) {
    try {
      // 提取 group_name（去掉 " MEMBERS"）
      if (!key.endsWith(' MEMBERS')) {
        continue;
      }

      const groupName = key.replace(' MEMBERS', '');
      const groupData = value as any;

      // 查找團體的 group_id
      const groupId = await findGroupId(groupName);
      if (!groupId) {
        console.warn(`⚠️  跳過團體 "${groupName}"：資料庫中找不到該團體`);
        continue;
      }

      // 處理每個成員
      if (!groupData.members || !Array.isArray(groupData.members)) {
        continue;
      }

      for (const member of groupData.members) {
        try {
          const stageName = member.stage_name;
          const stageNameKr = member.stage_name_kr || member.stage_name;
          const nationality = member.nationality || null;
          const debutDate = member.debut_date;

          if (!stageName || !debutDate) {
            console.warn(`⚠️  跳過成員：缺少必要欄位 (stage_name: ${stageName}, debut_date: ${debutDate})`);
            continue;
          }

          // 檢查是否已存在
          const existingIdolId = await idolExists(stageName, nationality, debutDate);

          let idolId: number;

          if (existingIdolId) {
            // 已存在，使用現有的 idol_id
            idolId = existingIdolId;
            console.log(`⏭️  跳過（已存在）: ${stageName} (ID: ${idolId})`);
            skipCount++;
          } else {
            // 不存在，插入新記錄
            const nextIdolId = await getNextIdolId();
            idolId = Number(nextIdolId);

            const insertData = {
              idol_id: nextIdolId,
              stage_name: stageName,
              stage_name_kr: stageNameKr,
              nationality: nationality,
              debut_date: debutDate,
            };

            const success = await insertIdol(insertData);
            if (success) {
              console.log(`✅ 成功插入: ${stageName} (ID: ${idolId})`);
              successCount++;
            } else {
              errorCount++;
              errors.push(`${stageName}: 插入失敗`);
              continue;
            }
          }

          // 建立團體與偶像的關聯
          const linkSuccess = await linkIdolToGroup(groupId, idolId);
          if (linkSuccess) {
            if (existingIdolId) {
              linkSkipCount++; // 關聯可能已存在
            } else {
              linkSuccessCount++;
            }
          } else {
            errors.push(`${stageName} -> ${groupName}: 建立關聯失敗`);
          }

          // 避免請求過快
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error: any) {
          console.error(`處理成員時發生錯誤:`, error.message);
          errorCount++;
          errors.push(`${member.stage_name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error(`處理團體 "${key}" 時發生錯誤:`, error.message);
      errorCount++;
      errors.push(`${key}: ${error.message}`);
    }
  }

  // 輸出統計
  console.log('\n=== 導入完成 ===');
  console.log(`✅ 成功插入新偶像: ${successCount} 筆`);
  console.log(`⏭️  跳過（已存在）: ${skipCount} 筆`);
  console.log(`✅ 成功建立關聯: ${linkSuccessCount} 筆`);
  console.log(`⏭️  關聯已存在: ${linkSkipCount} 筆`);
  console.log(`❌ 錯誤: ${errorCount} 筆`);

  if (errors.length > 0) {
    console.log('\n錯誤詳情:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
}

// 執行
main().catch(console.error);

