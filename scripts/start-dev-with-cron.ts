/**
 * 啟動開發伺服器並同時啟動 Cron 定時任務
 * 
 * 使用方式：
 * npm run dev
 * 
 * 這個腳本會：
 * 1. 啟動 Next.js 開發伺服器
 * 2. 同時啟動 Cron 定時任務（每天凌晨 2:00 清理過期申請）
 */

import { spawn } from 'child_process';
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

// 啟動 Cron 定時任務
console.log('🚀 啟動 Cron 定時任務...');
console.log('✓ 定時任務已設定：每天凌晨 2:00 自動清理過期申請\n');

// 每天凌晨 2:00 執行
cron.schedule('0 0 2 * * *', async () => {
  await cleanExpiredApplications();
});

// 啟動 Next.js 開發伺服器
console.log('🚀 啟動 Next.js 開發伺服器...\n');

const nextDev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
});

// 處理進程退出
process.on('SIGINT', async () => {
  console.log('\n正在關閉服務...');
  nextDev.kill('SIGINT');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n正在關閉服務...');
  nextDev.kill('SIGTERM');
  await pool.end();
  process.exit(0);
});

nextDev.on('exit', async (code) => {
  await pool.end();
  process.exit(code || 0);
});


