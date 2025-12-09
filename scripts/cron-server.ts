/**
 * Cron 定時任務服務器
 * 獨立運行的服務，用於執行定時任務
 * 
 * 使用方式：
 * npx tsx scripts/cron-server.ts
 * 
 * 或使用 PM2 管理：
 * pm2 start scripts/cron-server.ts --interpreter tsx --name cron-server
 */

import cron from 'node-cron';
import pool from '../src/lib/db';

/**
 * 清理過期申請
 */
async function cleanExpiredApplications() {
  try {
    console.log(`[${new Date().toISOString()}] 開始清理過期申請...`);

    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM project_applications
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );
    const expiredCount = parseInt(countResult.rows[0].count);

    if (expiredCount === 0) {
      console.log(`[${new Date().toISOString()}] ✓ 沒有過期的申請需要清理`);
      return;
    }

    console.log(`[${new Date().toISOString()}] 發現 ${expiredCount} 筆過期申請`);

    const updateResult = await pool.query(
      `UPDATE project_applications
       SET status = 'C', reviewed_time = NOW()
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );

    console.log(`[${new Date().toISOString()}] ✓ 成功清理 ${updateResult.rowCount} 筆過期申請`);
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❌ 錯誤:`, error.message);
  }
}

// 初始化定時任務
console.log('🚀 Cron 定時任務服務器啟動中...\n');

// 每天凌晨 2:00 執行
// cron 格式: 秒 分鐘 小時 日 月 星期
cron.schedule('0 0 2 * * *', async () => {
  await cleanExpiredApplications();
});

// 也可以設定為每小時執行（用於測試）
// cron.schedule('0 0 * * * *', async () => {
//   await cleanExpiredApplications();
// });

console.log('✓ 定時任務已設定：每天凌晨 2:00 自動清理過期申請');
console.log('✓ 服務器運行中，按 Ctrl+C 停止\n');

// 保持進程運行
process.on('SIGINT', async () => {
  console.log('\n正在關閉服務器...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n正在關閉服務器...');
  await pool.end();
  process.exit(0);
});


