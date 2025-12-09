import cron from 'node-cron';
import pool from './db';

/**
 * 清理過期申請
 * 將超過 30 天未審核的申請記錄狀態改為 'C'（已取消）
 */
async function cleanExpiredApplications() {
  try {
    console.log(`[${new Date().toISOString()}] 開始清理過期申請...`);

    // 先查詢有多少筆過期申請
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

    console.log(`[${new Date().toISOString()}] 發現 ${expiredCount} 筆過期申請（超過 30 天未審核）`);

    // 更新過期申請的狀態
    const updateResult = await pool.query(
      `UPDATE project_applications
       SET status = 'C', reviewed_time = NOW()
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );

    console.log(`[${new Date().toISOString()}] ✓ 成功清理 ${updateResult.rowCount} 筆過期申請`);
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] ❌ 清理過期申請時發生錯誤:`, error.message);
  }
}

let cronJobStarted = false;

/**
 * 初始化定時任務
 * 每天凌晨 2:00 執行一次清理過期申請
 * 只在開發環境或明確啟用時啟動
 */
export function initCronJobs() {
  // 避免重複啟動
  if (cronJobStarted) {
    return;
  }

  // 只在開發環境或生產環境啟動（根據環境變數決定）
  const shouldStartCron = process.env.NODE_ENV === 'development' || process.env.ENABLE_CRON === 'true';

  if (!shouldStartCron) {
    return;
  }

  // 每天凌晨 2:00 執行
  // cron 格式: 秒 分鐘 小時 日 月 星期
  cron.schedule('0 0 2 * * *', async () => {
    await cleanExpiredApplications();
  });

  cronJobStarted = true;
  console.log('✓ 定時任務已啟動：每天凌晨 2:00 自動清理過期申請');
}

/**
 * 手動觸發清理（用於測試）
 */
export async function triggerCleanExpiredApplications() {
  await cleanExpiredApplications();
}
