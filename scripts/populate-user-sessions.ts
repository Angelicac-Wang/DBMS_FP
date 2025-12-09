import pool from '../src/lib/db';

async function populateUserSessions() {
  try {
    console.log('開始將會話資料從 user_behavior_events 遷移到 user_sessions...\n');

    // 1. 檢查並創建 user_sessions 表
    console.log('1. 檢查並創建 user_sessions 表...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id VARCHAR(100) PRIMARY KEY,
        user_id BIGINT,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMP,
        duration_seconds INT,
        page_views INT DEFAULT 0,
        events_count INT DEFAULT 0,
        device_type VARCHAR(20),
        browser VARCHAR(50),
        os VARCHAR(50),
        country VARCHAR(50),
        city VARCHAR(100),
        session_data JSONB DEFAULT '{}',
        CONSTRAINT fk_session_user FOREIGN KEY (user_id) 
            REFERENCES users(u_id) 
            ON DELETE SET NULL 
            ON UPDATE CASCADE
      )
    `);

    // 創建索引
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_sessions(started_at)
    `);

    console.log('✓ user_sessions 表已創建\n');

    // 2. 從 user_behavior_events 中提取會話數據
    console.log('2. 從 user_behavior_events 中提取會話數據...\n');

    const sessionsQuery = `
      SELECT 
        session_id,
        MAX(user_id) as user_id,
        MIN(event_timestamp) as started_at,
        MAX(event_timestamp) as last_event,
        COUNT(*) as events_count,
        COUNT(DISTINCT page_url) as page_views,
        EXTRACT(EPOCH FROM (MAX(event_timestamp) - MIN(event_timestamp)))::INT as duration_seconds,
        (SELECT metadata->>'device_type' FROM user_behavior_events e2 
         WHERE e2.session_id = e.session_id 
         AND e2.metadata IS NOT NULL 
         AND e2.metadata->>'device_type' IS NOT NULL 
         LIMIT 1) as device_type,
        (SELECT metadata->>'browser' FROM user_behavior_events e2 
         WHERE e2.session_id = e.session_id 
         AND e2.metadata IS NOT NULL 
         AND e2.metadata->>'browser' IS NOT NULL 
         LIMIT 1) as browser,
        (SELECT metadata->>'os' FROM user_behavior_events e2 
         WHERE e2.session_id = e.session_id 
         AND e2.metadata IS NOT NULL 
         AND e2.metadata->>'os' IS NOT NULL 
         LIMIT 1) as os,
        (SELECT metadata->>'country' FROM user_behavior_events e2 
         WHERE e2.session_id = e.session_id 
         AND e2.metadata IS NOT NULL 
         AND e2.metadata->>'country' IS NOT NULL 
         LIMIT 1) as country,
        (SELECT metadata->>'city' FROM user_behavior_events e2 
         WHERE e2.session_id = e.session_id 
         AND e2.metadata IS NOT NULL 
         AND e2.metadata->>'city' IS NOT NULL 
         LIMIT 1) as city
      FROM user_behavior_events e
      WHERE session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY started_at DESC
    `;

    const sessionsResult = await pool.query(sessionsQuery);
    console.log(`✓ 找到 ${sessionsResult.rows.length} 個會話\n`);

    // 3. 插入或更新會話數據
    console.log('3. 插入會話數據到 user_sessions 表...\n');

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const session of sessionsResult.rows) {
      try {
        // 檢查是否已存在
        const existingCheck = await pool.query(
          'SELECT session_id FROM user_sessions WHERE session_id = $1',
          [session.session_id]
        );

        if (existingCheck.rows.length > 0) {
          // 更新現有會話（使用最新的結束時間和事件數）
          await pool.query(
            `UPDATE user_sessions SET
              user_id = $1,
              started_at = $2,
              ended_at = $3,
              duration_seconds = $4,
              page_views = $5,
              events_count = $6,
              device_type = $7,
              browser = $8,
              os = $9,
              country = $10,
              city = $11
            WHERE session_id = $12`,
            [
              session.user_id || null,
              session.started_at,
              session.last_event,
              session.duration_seconds || null,
              parseInt(session.page_views) || 0,
              parseInt(session.events_count) || 0,
              session.device_type || null,
              session.browser || null,
              session.os || null,
              session.country || null,
              session.city || null,
              session.session_id,
            ]
          );
          updatedCount++;
        } else {
          // 插入新會話
          await pool.query(
            `INSERT INTO user_sessions (
              session_id, user_id, started_at, ended_at, duration_seconds,
              page_views, events_count, device_type, browser, os, country, city
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              session.session_id,
              session.user_id || null,
              session.started_at,
              session.last_event,
              session.duration_seconds || null,
              parseInt(session.page_views) || 0,
              parseInt(session.events_count) || 0,
              session.device_type || null,
              session.browser || null,
              session.os || null,
              session.country || null,
              session.city || null,
            ]
          );
          insertedCount++;
        }
      } catch (error: any) {
        console.error(`  處理會話 ${session.session_id} 時發生錯誤:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n=== 遷移完成 ===');
    console.log(`新增: ${insertedCount} 個會話`);
    console.log(`更新: ${updatedCount} 個會話`);
    console.log(`跳過: ${skippedCount} 個會話`);
    console.log(`總計: ${sessionsResult.rows.length} 個會話\n`);

    // 4. 驗證結果
    console.log('4. 驗證結果...');
    const verifyResult = await pool.query('SELECT COUNT(*) as count FROM user_sessions');
    console.log(`✓ user_sessions 表中現有 ${verifyResult.rows[0].count} 個會話\n`);

    // 5. 顯示統計信息
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN ended_at IS NULL THEN 1 END) as active_sessions,
        AVG(duration_seconds) as avg_duration,
        SUM(events_count) as total_events
      FROM user_sessions
    `);

    const stats = statsResult.rows[0];
    console.log('會話統計:');
    console.log(`  總會話數: ${stats.total_sessions}`);
    console.log(`  獨立使用者: ${stats.unique_users}`);
    console.log(`  活躍會話: ${stats.active_sessions}`);
    console.log(`  平均持續時間: ${stats.avg_duration ? Math.round(stats.avg_duration) : 0} 秒`);
    console.log(`  總事件數: ${stats.total_events}`);

  } catch (error: any) {
    console.error('遷移過程中發生錯誤:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

populateUserSessions().catch(console.error);




