import pool from '../src/lib/db';

async function checkSessions() {
  try {
    console.log('正在檢查資料庫中的會話資料...\n');

    // 1. 檢查 user_sessions 表是否存在
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
      )
    `);

    const tableExists = tableCheck.rows[0]?.exists;

    if (tableExists) {
      console.log('✓ user_sessions 表存在\n');
      
      // 查詢會話數據
      const sessionsResult = await pool.query(`
        SELECT 
          session_id,
          user_id,
          started_at,
          ended_at,
          duration_seconds,
          page_views,
          events_count,
          device_type,
          browser,
          os
        FROM user_sessions
        ORDER BY started_at DESC
        LIMIT 10
      `);

      console.log(`找到 ${sessionsResult.rows.length} 筆會話記錄（顯示前 10 筆）:\n`);
      
      if (sessionsResult.rows.length > 0) {
        sessionsResult.rows.forEach((session, index) => {
          console.log(`[${index + 1}]`);
          console.log(`  會話 ID: ${session.session_id}`);
          console.log(`  使用者 ID: ${session.user_id || '訪客'}`);
          console.log(`  開始時間: ${session.started_at}`);
          console.log(`  結束時間: ${session.ended_at || '進行中'}`);
          console.log(`  持續時間: ${session.duration_seconds ? `${session.duration_seconds} 秒` : '未知'}`);
          console.log(`  頁面瀏覽: ${session.page_views || 0}`);
          console.log(`  事件數: ${session.events_count || 0}`);
          console.log(`  設備: ${session.device_type || '未知'}`);
          console.log(`  瀏覽器: ${session.browser || '未知'}`);
          console.log(`  作業系統: ${session.os || '未知'}`);
          console.log('');
        });
      } else {
        console.log('  目前沒有會話記錄\n');
      }

      // 統計信息
      const statsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN ended_at IS NULL THEN 1 END) as active_sessions
        FROM user_sessions
      `);

      const stats = statsResult.rows[0];
      console.log('會話統計:');
      console.log(`  總會話數: ${stats.total_sessions}`);
      console.log(`  獨立使用者: ${stats.unique_users}`);
      console.log(`  活躍會話: ${stats.active_sessions}`);
      console.log('');
    } else {
      console.log('✗ user_sessions 表不存在\n');
    }

    // 2. 從 user_behavior_events 中提取會話信息
    console.log('從 user_behavior_events 中提取會話信息...\n');
    
    const eventsSessionsResult = await pool.query(`
      SELECT 
        session_id,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as event_count,
        MIN(event_timestamp) as first_event,
        MAX(event_timestamp) as last_event,
        COUNT(DISTINCT page_url) as unique_pages
      FROM user_behavior_events
      WHERE session_id IS NOT NULL
      GROUP BY session_id
      ORDER BY first_event DESC
      LIMIT 10
    `);

    console.log(`找到 ${eventsSessionsResult.rows.length} 個會話（從事件中提取，顯示前 10 個）:\n`);

    if (eventsSessionsResult.rows.length > 0) {
      eventsSessionsResult.rows.forEach((session, index) => {
        const duration = session.last_event && session.first_event
          ? Math.floor((new Date(session.last_event).getTime() - new Date(session.first_event).getTime()) / 1000)
          : null;

        console.log(`[${index + 1}]`);
        console.log(`  會話 ID: ${session.session_id}`);
        console.log(`  使用者數: ${session.unique_users}`);
        console.log(`  事件數: ${session.event_count}`);
        console.log(`  首次事件: ${session.first_event}`);
        console.log(`  最後事件: ${session.last_event}`);
        console.log(`  持續時間: ${duration ? `${duration} 秒` : '未知'}`);
        console.log(`  瀏覽頁面數: ${session.unique_pages}`);
        console.log('');
      });

      // 統計信息
      const eventsStatsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_events
        FROM user_behavior_events
        WHERE session_id IS NOT NULL
      `);

      const eventsStats = eventsStatsResult.rows[0];
      console.log('從事件中提取的會話統計:');
      console.log(`  總會話數: ${eventsStats.total_sessions}`);
      console.log(`  獨立使用者: ${eventsStats.unique_users}`);
      console.log(`  總事件數: ${eventsStats.total_events}`);
    } else {
      console.log('  目前沒有會話記錄\n');
    }

  } catch (error: any) {
    console.error('檢查會話資料時發生錯誤:', error.message);
  } finally {
    await pool.end();
  }
}

checkSessions().catch(console.error);

