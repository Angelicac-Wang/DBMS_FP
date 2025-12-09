import { NextResponse } from 'next/server';
import { getBehaviorEventsCollection, getSessionsCollection, documentToBehaviorEvent } from '@/lib/mongodb-models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const eventsCollection = await getBehaviorEventsCollection();
    const sessionsCollection = await getSessionsCollection();

    // 构建查询过滤器
    const filter: any = {};
    if (startDate) {
      filter.event_timestamp = { 
        ...filter.event_timestamp,
        $gte: new Date(startDate)
      };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.event_timestamp = {
        ...filter.event_timestamp,
        $lte: end
      };
    }

    // 获取统计信息
    const events = await eventsCollection.find(filter).toArray();
    
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;

    // 获取事件类型统计
    const eventsByTypeMap: { [key: string]: number } = {};
    events.forEach(event => {
      const type = event.event_type;
      eventsByTypeMap[type] = (eventsByTypeMap[type] || 0) + 1;
    });

    // 获取最近的事件（最多50条）
    const recentEvents = events
      .sort((a, b) => b.event_timestamp.getTime() - a.event_timestamp.getTime())
      .slice(0, 50)
      .map(doc => documentToBehaviorEvent(doc));

    // 获取事件类型排序（前10）
    const topEventTypes = Object.entries(eventsByTypeMap)
      .map(([event_type, count]) => ({ event_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 获取会话数据
    const sessionsFilter: any = {};
    if (startDate) {
      sessionsFilter.started_at = {
        ...sessionsFilter.started_at,
        $gte: new Date(startDate)
      };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      sessionsFilter.started_at = {
        ...sessionsFilter.started_at,
        $lte: end
      };
    }

    const sessions = await sessionsCollection
      .find(sessionsFilter)
      .sort({ started_at: -1 })
      .limit(100)
      .toArray();

    // 计算按日期统计
    const eventsByDateMap: { [key: string]: number } = {};
    events.forEach(event => {
      const date = event.event_timestamp.toISOString().split('T')[0];
      eventsByDateMap[date] = (eventsByDateMap[date] || 0) + 1;
    });

    const eventsByDate = Object.entries(eventsByDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      total_events: totalEvents,
      unique_users: uniqueUsers,
      unique_sessions: uniqueSessions,
      events_by_type: eventsByTypeMap,
      events_by_date: eventsByDate,
      recentEvents,
      topEventTypes,
      sessions: sessions.map(session => ({
        session_id: session.session_id,
        user_id: session.user_id,
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_seconds: session.duration_seconds,
        page_views: session.page_views || 0,
        events_count: session.events_count || 0,
        device_type: session.device_type,
        browser: session.browser,
        os: session.os,
        country: session.country,
        city: session.city,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics: ' + error.message },
      { status: 500 }
    );
  }
}
