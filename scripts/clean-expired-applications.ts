import pool from '../src/lib/db';

/**
 * 清理過期申請
 * 將超過 30 天未審核的申請記錄狀態改為 'C'（已取消）
 */
async function cleanExpiredApplications() {
  try {
    console.log('開始清理過期申請...\n');

    // 先查詢有多少筆過期申請
    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM project_applications
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );
    const expiredCount = parseInt(countResult.rows[0].count);

    if (expiredCount === 0) {
      console.log('✓ 沒有過期的申請需要清理');
      return;
    }

    console.log(`發現 ${expiredCount} 筆過期申請（超過 30 天未審核）\n`);

    // 更新過期申請的狀態
    const updateResult = await pool.query(
      `UPDATE project_applications
       SET status = 'C', reviewed_time = NOW()
       WHERE status = 'W'
         AND applied_time < NOW() - INTERVAL '30 days'`
    );

    console.log(`✓ 成功清理 ${updateResult.rowCount} 筆過期申請`);
    console.log('✓ 所有過期申請已標記為「已取消」(C) 狀態\n');

    // 顯示清理統計
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'W') as waiting,
         COUNT(*) FILTER (WHERE status = 'C') as cancelled,
         COUNT(*) FILTER (WHERE status = 'A') as accepted,
         COUNT(*) FILTER (WHERE status = 'R') as rejected
       FROM project_applications`
    );

    const stats = statsResult.rows[0];
    console.log('申請狀態統計：');
    console.log(`  等待審核 (W): ${stats.waiting} 筆`);
    console.log(`  已取消 (C): ${stats.cancelled} 筆`);
    console.log(`  已接受 (A): ${stats.accepted} 筆`);
    console.log(`  已拒絕 (R): ${stats.rejected} 筆`);
  } catch (error: any) {
    console.error('❌ 清理過期申請時發生錯誤:', error.message);
    throw error;
  }
}

// 執行清理
async function main() {
  try {
    await cleanExpiredApplications();
    console.log('\n✅ 清理完成');
  } catch (error: any) {
    console.error('❌ 執行失敗:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();

