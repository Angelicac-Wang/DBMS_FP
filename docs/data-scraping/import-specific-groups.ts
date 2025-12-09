// 從 specific-groups.json 導入團體和成員資料到資料庫
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

// ========== 團體相關函數 ==========

let currentGroupId = BigInt(3);

async function getNextGroupId(): Promise<bigint> {
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id')
    .order('group_id', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('無法查詢最大 group_id，使用預設值:', error.message);
    const minId = BigInt(3);
    currentGroupId = currentGroupId >= minId ? currentGroupId : minId;
  } else if (data && data.length > 0) {
    const maxId = BigInt(data[0].group_id);
    const minId = BigInt(3);
    currentGroupId = maxId >= minId ? maxId : minId;
  } else {
    currentGroupId = BigInt(3);
  }

  currentGroupId = currentGroupId + BigInt(1);
  return currentGroupId;
}

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

// ========== 成員相關函數 ==========

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

async function idolExists(
  stageName: string,
  nationality: string | null,
  debutDate: string
): Promise<number | null> {
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

  for (const idol of data) {
    const idolNationality = idol.nationality || null;
    if (idolNationality === nationality) {
      return idol.idol_id;
    }
  }

  return null;
}

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

async function linkIdolToGroup(groupId: number, idolId: number): Promise<boolean> {
  const { error } = await supabase
    .from('group_idol')
    .insert({
      group_id: groupId,
      idol_id: idolId,
    });

  if (error) {
    if (error.code === '23505') {
      return true; // 已存在，這是正常的
    }
    console.error(`建立關聯失敗 (group_id: ${groupId}, idol_id: ${idolId}):`, error);
    return false;
  }

  return true;
}

// ========== 主函數 ==========

async function main() {
  console.log('開始導入團體和成員資料...\n');

  // 讀取 JSON 文件
  const jsonPath = path.join(__dirname, 'specific-groups.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`錯誤：找不到文件 ${jsonPath}`);
    process.exit(1);
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let groupSuccessCount = 0;
  let groupSkipCount = 0;
  let groupErrorCount = 0;
  let idolSuccessCount = 0;
  let idolSkipCount = 0;
  let idolErrorCount = 0;
  let linkSuccessCount = 0;
  let linkSkipCount = 0;
  const errors: string[] = [];

  // 第一階段：導入所有團體
  console.log('=== 第一階段：導入團體 ===\n');
  for (const [key, value] of Object.entries(jsonData)) {
    try {
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
        groupSkipCount++;
        continue;
      }

      // 準備插入資料
      let finalGroupName = groupName;
      if (finalGroupName.length > 20) {
        console.warn(`警告：團體名稱 "${groupName}" 超過 20 字元，將截斷`);
        finalGroupName = finalGroupName.substring(0, 20);
      }

      let company = groupData.company || 'Unknown';
      if (company.length > 20) {
        company = company.substring(0, 20);
      }

      let groupNamekr = groupData.group_namekr;
      if (groupNamekr && groupNamekr.length > 20) {
        groupNamekr = groupNamekr.substring(0, 20);
      }

      let logoImage = groupData.logo_image;
      if (logoImage && logoImage.length > 100) {
        logoImage = logoImage.substring(0, 100);
      }

      // 驗證必要欄位
      if (!groupData.debut_date) {
        console.warn(`警告：團體 "${groupName}" 缺少 debut_date，跳過`);
        groupErrorCount++;
        errors.push(`${groupName}: 缺少 debut_date`);
        continue;
      }

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

      const success = await insertGroup(insertData);
      if (success) {
        console.log(`✅ 成功插入: ${groupName} (ID: ${insertData.group_id})`);
        groupSuccessCount++;
      } else {
        groupErrorCount++;
        errors.push(`${groupName}: 插入失敗`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`處理團體 "${key}" 時發生錯誤:`, error.message);
      groupErrorCount++;
      errors.push(`${key}: ${error.message}`);
    }
  }

  // 第二階段：導入所有成員並建立關聯
  console.log('\n=== 第二階段：導入成員 ===\n');
  for (const [key, value] of Object.entries(jsonData)) {
    try {
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
            idolId = existingIdolId;
            console.log(`⏭️  跳過（已存在）: ${stageName} (ID: ${idolId})`);
            idolSkipCount++;
          } else {
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
              idolSuccessCount++;
            } else {
              idolErrorCount++;
              errors.push(`${stageName}: 插入失敗`);
              continue;
            }
          }

          // 建立團體與偶像的關聯
          const linkSuccess = await linkIdolToGroup(groupId, idolId);
          if (linkSuccess) {
            if (existingIdolId) {
              linkSkipCount++;
            } else {
              linkSuccessCount++;
            }
          } else {
            errors.push(`${stageName} -> ${groupName}: 建立關聯失敗`);
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error: any) {
          console.error(`處理成員時發生錯誤:`, error.message);
          idolErrorCount++;
          errors.push(`${member.stage_name}: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error(`處理團體 "${key}" 時發生錯誤:`, error.message);
      idolErrorCount++;
      errors.push(`${key}: ${error.message}`);
    }
  }

  // 輸出統計
  console.log('\n=== 導入完成 ===');
  console.log('\n團體統計:');
  console.log(`  ✅ 成功插入: ${groupSuccessCount} 筆`);
  console.log(`  ⏭️  跳過（已存在）: ${groupSkipCount} 筆`);
  console.log(`  ❌ 錯誤: ${groupErrorCount} 筆`);
  console.log('\n成員統計:');
  console.log(`  ✅ 成功插入新偶像: ${idolSuccessCount} 筆`);
  console.log(`  ⏭️  跳過（已存在）: ${idolSkipCount} 筆`);
  console.log(`  ❌ 錯誤: ${idolErrorCount} 筆`);
  console.log('\n關聯統計:');
  console.log(`  ✅ 成功建立關聯: ${linkSuccessCount} 筆`);
  console.log(`  ⏭️  關聯已存在: ${linkSkipCount} 筆`);

  if (errors.length > 0) {
    console.log('\n錯誤詳情:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
}

// 執行
main().catch(console.error);




