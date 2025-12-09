import pool from '../src/lib/db';
import { getMongoDB } from '../src/lib/mongodb';

// PostgreSQL 表名列表（注意：PostgreSQL 會將表名轉為小寫）
const postgresTables = [
  'users',
  'kpop_songs',
  'user_skills',
  'user_social_link',
  'video_detail',
  'portfolios',
  'project',
  'kpop_groups',
  'kpop_idols',
  'song_group',
  'song_idol',
  'group_idol',
  'practice_schedule',
  'project_target',
  'project_members',
  'project_applications',
];

async function checkPostgreSQLCounts() {
  console.log('\n📊 PostgreSQL 資料庫記錄數統計\n');
  console.log('=' .repeat(60));
  
  const results: { table: string; count: number }[] = [];
  let total = 0;

  for (const table of postgresTables) {
    try {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      results.push({ table, count });
      total += count;
      console.log(`${table.padEnd(25)} : ${count.toLocaleString().padStart(10)} 筆`);
    } catch (error: any) {
      console.log(`${table.padEnd(25)} : 錯誤 - ${error.message}`);
    }
  }

  console.log('=' .repeat(60));
  console.log(`總計${' '.repeat(20)} : ${total.toLocaleString().padStart(10)} 筆`);
  console.log('=' .repeat(60));

  return results;
}

async function checkMongoDBCounts() {
  console.log('\n📊 MongoDB 資料庫記錄數統計\n');
  console.log('=' .repeat(60));

  try {
    const db = await getMongoDB();
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('沒有找到任何 collection');
      return;
    }

    let total = 0;
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const count = await db.collection(collectionName).countDocuments();
      total += count;
      console.log(`${collectionName.padEnd(25)} : ${count.toLocaleString().padStart(10)} 筆`);
    }

    console.log('=' .repeat(60));
    console.log(`總計${' '.repeat(20)} : ${total.toLocaleString().padStart(10)} 筆`);
    console.log('=' .repeat(60));
  } catch (error: any) {
    console.log(`MongoDB 連接錯誤: ${error.message}`);
  }
}

async function main() {
  try {
    // 檢查 PostgreSQL
    await checkPostgreSQLCounts();
    
    // 檢查 MongoDB
    await checkMongoDBCounts();
    
    console.log('\n✅ 統計完成\n');
  } catch (error: any) {
    console.error('❌ 發生錯誤:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();


