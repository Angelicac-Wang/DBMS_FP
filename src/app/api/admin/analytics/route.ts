import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 獲取統計信息
    let statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM user_behavior_events
      WHERE 1=1
    `;
    const statsParams: any[] = [];

    if (startDate) {
      statsQuery += ` AND event_timestamp >= $${statsParams.length + 1}`;
      statsParams.push(startDate);
    }
    if (endDate) {
      statsQuery += ` AND event_timestamp <= $${statsParams.length + 1}`;
      statsParams.push(endDate + 'T23:59:59');
    }

    const statsResult = await pool.query(statsQuery, statsParams);

    // 獲取事件類型統計
    let eventsQuery = `
      SELECT event_type, COUNT(*) as count
      FROM user_behavior_events
      WHERE 1=1
    `;
    const eventsParams: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      eventsQuery += ` AND event_timestamp >= $${paramIndex++}`;
      eventsParams.push(startDate);
    }
    if (endDate) {
      eventsQuery += ` AND event_timestamp <= $${paramIndex++}`;
      eventsParams.push(endDate + 'T23:59:59');
    }

    eventsQuery += ` GROUP BY event_type ORDER BY count DESC LIMIT 10`;

    const eventsResult = await pool.query(eventsQuery, eventsParams);

    // 獲取最近的事件
    let recentQuery = `
      SELECT *
      FROM user_behavior_events
      WHERE 1=1
    `;
    const recentParams: any[] = [];
    paramIndex = 1;

    if (startDate) {
      recentQuery += ` AND event_timestamp >= $${paramIndex++}`;
      recentParams.push(startDate);
    }
    if (endDate) {
      recentQuery += ` AND event_timestamp <= $${paramIndex++}`;
      recentParams.push(endDate + 'T23:59:59');
    }

    recentQuery += ` ORDER BY event_timestamp DESC LIMIT 50`;

    const recentResult = await pool.query(recentQuery, recentParams);

    // 獲取會話數據（從 user_behavior_events 動態生成）
    let sessionsResult: any = { rows: [] };
    try {
      // 先檢查 user_sessions 表是否存在
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_sessions'
        )
      `);
      
      if (tableCheck.rows[0]?.exists) {
        // 如果表存在，直接查詢
        let sessionsQuery = `
          SELECT *
          FROM user_sessions
          WHERE 1=1
        `;
        const sessionsParams: any[] = [];
        paramIndex = 1;

        if (startDate) {
          sessionsQuery += ` AND started_at >= $${paramIndex++}`;
          sessionsParams.push(startDate);
        }
        if (endDate) {
          sessionsQuery += ` AND started_at <= $${paramIndex++}`;
          sessionsParams.push(endDate + 'T23:59:59');
        }

        sessionsQuery += ` ORDER BY started_at DESC LIMIT 100`;

        sessionsResult = await pool.query(sessionsQuery, sessionsParams);
      } else {
        // 如果表不存在，從 user_behavior_events 動態生成會話數據
        let sessionsQuery = `
          SELECT 
            session_id,
            MAX(user_id) as user_id,
            MIN(event_timestamp) as started_at,
            MAX(event_timestamp) as last_event,
            COUNT(*) as events_count,
            COUNT(DISTINCT page_url) as page_views,
            EXTRACT(EPOCH FROM (MAX(event_timestamp) - MIN(event_timestamp)))::INT as duration_seconds,
            (SELECT metadata->>'device_type' FROM user_behavior_events e2 
             WHERE e2.session_id = e.session_id AND e2.metadata->>'device_type' IS NOT NULL 
             LIMIT 1) as device_type,
            (SELECT metadata->>'browser' FROM user_behavior_events e2 
             WHERE e2.session_id = e.session_id AND e2.metadata->>'browser' IS NOT NULL 
             LIMIT 1) as browser,
            (SELECT metadata->>'os' FROM user_behavior_events e2 
             WHERE e2.session_id = e.session_id AND e2.metadata->>'os' IS NOT NULL 
             LIMIT 1) as os
          FROM user_behavior_events e
          WHERE session_id IS NOT NULL
        `;
        const sessionsParams: any[] = [];
        paramIndex = 1;

        if (startDate) {
          sessionsQuery += ` AND event_timestamp >= $${paramIndex++}`;
          sessionsParams.push(startDate);
        }
        if (endDate) {
          sessionsQuery += ` AND event_timestamp <= $${paramIndex++}`;
          sessionsParams.push(endDate + 'T23:59:59');
        }

        sessionsQuery += ` 
          GROUP BY session_id
          ORDER BY started_at DESC 
          LIMIT 100
        `;

        const dynamicSessions = await pool.query(sessionsQuery, sessionsParams);
        
        // 轉換為與 user_sessions 表相同的格式
        sessionsResult = {
          rows: dynamicSessions.rows.map((row: any) => ({
            session_id: row.session_id,
            user_id: row.user_id,
            started_at: row.started_at,
            ended_at: row.last_event,
            duration_seconds: row.duration_seconds ? parseInt(row.duration_seconds) : null,
            page_views: parseInt(row.page_views) || 0,
            events_count: parseInt(row.events_count) || 0,
            device_type: row.device_type,
            browser: row.browser,
            os: row.os,
          }))
        };
      }
    } catch (error) {
      // 如果查詢失敗，返回空數組
      console.warn('Failed to fetch sessions:', error);
      sessionsResult = { rows: [] };
    }

    // 計算按日期統計
    let dateStatsQuery = `
      SELECT DATE(event_timestamp) as date, COUNT(*) as count
      FROM user_behavior_events
      WHERE 1=1
    `;
    const dateStatsParams: any[] = [];
    paramIndex = 1;

    if (startDate) {
      dateStatsQuery += ` AND event_timestamp >= $${paramIndex++}`;
      dateStatsParams.push(startDate);
    }
    if (endDate) {
      dateStatsQuery += ` AND event_timestamp <= $${paramIndex++}`;
      dateStatsParams.push(endDate + 'T23:59:59');
    }

    dateStatsQuery += ` GROUP BY DATE(event_timestamp) ORDER BY date DESC`;

    const dateStatsResult = await pool.query(dateStatsQuery, dateStatsParams);

    const stats = statsResult.rows[0];
    const eventsByType: { [key: string]: number } = {};
    eventsResult.rows.forEach((row: any) => {
      eventsByType[row.event_type] = parseInt(row.count);
    });

    const eventsByDate = dateStatsResult.rows.map((row: any) => {
      // 处理日期格式（可能是 Date 对象或字符串）
      let dateStr: string;
      if (row.date instanceof Date) {
        dateStr = row.date.toISOString().split('T')[0];
      } else if (typeof row.date === 'string') {
        dateStr = row.date.split('T')[0];
      } else {
        dateStr = String(row.date);
      }
      return {
        date: dateStr,
        count: parseInt(row.count),
      };
    });

    return NextResponse.json({
      total_events: parseInt(stats.total_events) || 0,
      unique_users: parseInt(stats.unique_users) || 0,
      unique_sessions: parseInt(stats.unique_sessions) || 0,
      events_by_type: eventsByType,
      events_by_date: eventsByDate,
      recentEvents: recentResult.rows,
      topEventTypes: eventsResult.rows.map((row: any) => ({
        event_type: row.event_type,
        count: parseInt(row.count),
      })),
      sessions: sessionsResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics: ' + error.message },
      { status: 500 }
    );
  }
}

